import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import Expense from "../models/Expense.js";
import Refund from "../models/Refund.js";

// Get accounts overview/dashboard
export const getAccountsOverview = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { startDate, endDate, academicYear } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const match = { tenantId };
    if (Object.keys(dateFilter).length > 0) {
      match.date = dateFilter;
    }
    if (academicYear) match.academicYear = academicYear;

    // Fetch financial data
    const [payments, expenses, refunds, students] = await Promise.all([
      Payment.find({ ...match, status: "success" }),
      Expense.find({ ...match, status: "paid" }),
      Refund.find({ ...match, status: "completed" }),
      Student.find({ tenantId })
    ]);

    // Calculate totals
    const totalFeesCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
    
    const totalFees = students.reduce((sum, s) => sum + (s.fees || 0), 0);
    const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0);
    const totalPending = totalFees - totalBalance;

    // Receipt stats
    const receiptsGenerated = payments.filter(p => p.receiptGenerated).length;
    const receiptsDelivered = payments.filter(p => p.receiptDelivered).length;
    const receiptsPending = receiptsGenerated - receiptsDelivered;

    // Expense breakdown by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Recent transactions
    const recentPayments = await Payment.find({ tenantId })
      .populate("studentId", "name rollNumber")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      overview: {
        totalFeesCollected,
        totalFees,
        totalBalance,
        totalPending,
        totalExpenses,
        totalRefunds,
        netIncome: totalFeesCollected - totalExpenses - totalRefunds,
        receiptsGenerated,
        receiptsDelivered,
        receiptsPending,
        totalStudents: students.length
      },
      expensesByCategory,
      recentPayments
    });
  } catch (err) {
    console.error("Get accounts overview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Search students for receipt generation
export const searchStudentsForReceipt = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { rollNumber, batch, name } = req.query;

    const match = { tenantId };
    if (rollNumber) match.rollNumber = rollNumber;
    if (batch) match.batch = batch;
    if (name) match.name = new RegExp(name, "i");

    const students = await Student.find(match).select("name rollNumber email phone batch course fees balance");

    // Get payment history for each student
    const studentsWithPayments = await Promise.all(
      students.map(async (student) => {
        const payments = await Payment.find({ 
          tenantId, 
          studentId: student._id,
          status: "success"
        }).sort({ date: -1 });

        return {
          ...student.toObject(),
          payments,
          totalPaid: student.balance || 0,
          totalDue: (student.fees || 0) - (student.balance || 0)
        };
      })
    );

    res.json({
      success: true,
      students: studentsWithPayments
    });
  } catch (err) {
    console.error("Search students error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate receipt for a payment
export const generateReceipt = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { paymentId } = req.params;
    const { deliveryMethod } = req.body;

    const payment = await Payment.findOne({ _id: paymentId, tenantId })
      .populate("studentId", "name rollNumber email phone batch course fees balance address");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Update payment with receipt info
    payment.receiptGenerated = true;
    payment.receiptGeneratedAt = new Date();
    payment.receiptGeneratedBy = userId;
    
    if (deliveryMethod) {
      payment.receiptDelivered = true;
      payment.receiptDeliveryMethod = deliveryMethod;
      payment.receiptDeliveredAt = new Date();
    }

    await payment.save();

    res.json({
      success: true,
      message: "Receipt generated successfully",
      payment
    });
  } catch (err) {
    console.error("Generate receipt error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new payment and generate receipt
export const createPaymentWithReceipt = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { 
      studentId, 
      amount, 
      method, 
      date, 
      feeType, 
      month, 
      academicYear,
      transactionId,
      remarks,
      generateReceipt: shouldGenerateReceipt,
      deliveryMethod
    } = req.body;

    // Verify student exists
    const student = await Student.findOne({ _id: studentId, tenantId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Create payment
    const payment = await Payment.create({
      tenantId,
      studentId,
      amount: Number(amount),
      method,
      date: date || new Date(),
      feeType,
      month,
      academicYear,
      transactionId,
      remarks,
      status: "success",
      receiptGenerated: shouldGenerateReceipt || false,
      receiptGeneratedAt: shouldGenerateReceipt ? new Date() : undefined,
      receiptGeneratedBy: shouldGenerateReceipt ? userId : undefined,
      receiptDelivered: deliveryMethod ? true : false,
      receiptDeliveryMethod: deliveryMethod || "none",
      receiptDeliveredAt: deliveryMethod ? new Date() : undefined
    });

    // Update student balance
    student.balance = (student.balance || 0) + Number(amount);
    await student.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate("studentId", "name rollNumber email phone batch course fees balance address");

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: populatedPayment
    });
  } catch (err) {
    console.error("Create payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { page = 1, limit = 20, category, startDate, endDate, status } = req.query;
    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    const match = { tenantId };
    if (category) match.category = category;
    if (status) match.status = status;
    
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(match)
        .sort({ date: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .populate("approvedBy", "name email"),
      Expense.countDocuments(match)
    ]);

    const totalAmount = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      expenses,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create expense
export const createExpense = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const expenseData = {
      ...req.body,
      tenantId,
      approvedBy: userId
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      message: "Expense recorded successfully",
      expense
    });
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get refunds
export const getRefunds = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    const match = { tenantId };
    if (status) match.status = status;

    const [refunds, total] = await Promise.all([
      Refund.find(match)
        .populate("studentId", "name rollNumber email phone")
        .populate("approvedBy", "name email")
        .populate("processedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim),
      Refund.countDocuments(match)
    ]);

    res.json({
      success: true,
      refunds,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim)
    });
  } catch (err) {
    console.error("Get refunds error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create refund
export const createRefund = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { studentId, amount, reason, refundMethod, originalPaymentId } = req.body;

    const refund = await Refund.create({
      tenantId,
      studentId,
      amount: Number(amount),
      reason,
      refundMethod,
      originalPaymentId,
      approvedBy: userId,
      approvedAt: new Date(),
      status: "approved"
    });

    const populatedRefund = await Refund.findById(refund._id)
      .populate("studentId", "name rollNumber email phone");

    res.status(201).json({
      success: true,
      message: "Refund request created",
      refund: populatedRefund
    });
  } catch (err) {
    console.error("Create refund error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update refund status
export const updateRefundStatus = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { status, transactionId, remarks } = req.body;

    const refund = await Refund.findOne({ _id: id, tenantId });
    if (!refund) return res.status(404).json({ message: "Refund not found" });

    refund.status = status;
    if (transactionId) refund.transactionId = transactionId;
    if (remarks) refund.remarks = remarks;

    if (status === "completed") {
      refund.processedBy = userId;
      refund.processedAt = new Date();

      // Update student balance
      const student = await Student.findById(refund.studentId);
      if (student) {
        student.balance = (student.balance || 0) - refund.amount;
        await student.save();
      }
    }

    await refund.save();

    res.json({
      success: true,
      message: "Refund status updated",
      refund
    });
  } catch (err) {
    console.error("Update refund error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
