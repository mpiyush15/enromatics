import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import Expense from "../models/Expense.js";
import Refund from "../models/Refund.js";

// Get accounts overview/dashboard
export const getAccountsOverview = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { startDate, endDate, academicYear, period = "monthly" } = req.query;

    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();
    
    if (startDate || endDate) {
      // Use custom dates if provided
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    } else {
      // Use period-based filtering
      const startOfRange = new Date();
      
      if (period === "monthly") {
        startOfRange.setMonth(startOfRange.getMonth() - 1);
      } else if (period === "quarterly") {
        startOfRange.setMonth(startOfRange.getMonth() - 3);
      } else if (period === "annual") {
        startOfRange.setFullYear(startOfRange.getFullYear() - 1);
      }
      
      dateFilter.$gte = startOfRange;
      dateFilter.$lte = now;
    }

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

    console.log('🔍 Receipt Search - Query params:', { rollNumber, batch, name });

    const match = { tenantId };
    if (rollNumber) {
      match.rollNumber = rollNumber;
    }
    if (batch) {
      match.batch = batch;
    }
    if (name) {
      // Use regex for partial, case-insensitive matching
      match.name = { $regex: name, $options: 'i' };
    }

    console.log('🔍 Receipt Search - Match query:', JSON.stringify(match));

    const students = await Student.find(match).select("name rollNumber email phone batch course fees balance");

    console.log(`🔍 Receipt Search - Found ${students.length} students`);

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
    console.error("❌ Search students error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
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

    // Generate receipt number if not already generated
    if (!payment.receiptNumber) {
      try {
        const counter = await Counter.findByIdAndUpdate(
          "receiptNumber",
          { $inc: { sequence_value: 1 } },
          { new: true, upsert: true }
        );
        const receiptNumber = `RCP-${tenantId.substring(0, 3).toUpperCase()}-${String(counter.sequence_value).padStart(6, '0')}`;
        payment.receiptNumber = receiptNumber;
      } catch (err) {
        console.error("Error generating receipt number:", err);
        // Fallback: use payment ID
        payment.receiptNumber = `RCP-${paymentId.substring(0, 8).toUpperCase()}`;
      }
    }

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
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Create new payment and generate receipt
export const createPaymentWithReceipt = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?._id;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    console.log('💳 Create Payment Request:', {
      tenantId,
      userId,
      body: req.body
    });

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

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    // Verify student exists
    const student = await Student.findOne({ _id: studentId, tenantId });
    if (!student) {
      console.log('❌ Student not found:', { studentId, tenantId });
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    console.log('✅ Student found:', { 
      name: student.name, 
      rollNumber: student.rollNumber, 
      currentBalance: student.balance 
    });

    // Create payment
    const payment = await Payment.create({
      tenantId,
      studentId,
      amount: Number(amount),
      method: method || 'cash',
      date: date || new Date(),
      feeType: feeType || 'tuition',
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

    console.log('✅ Payment created:', { 
      paymentId: payment._id, 
      receiptNumber: payment.receiptNumber,
      amount: payment.amount 
    });

    // Update student balance
    const previousBalance = student.balance || 0;
    student.balance = previousBalance + Number(amount);
    await student.save();

    console.log('✅ Student balance updated:', { 
      previousBalance, 
      newBalance: student.balance 
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate("studentId", "name rollNumber email phone batch course fees balance address");

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: populatedPayment
    });
  } catch (err) {
    console.error("❌ Create payment error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

// Get financial reports (Profit & Loss Analysis)
export const getFinancialReports = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const match = { tenantId };
    if (Object.keys(dateFilter).length > 0) {
      match.date = dateFilter;
    }

    // Fetch financial data
    const [payments, expenses] = await Promise.all([
      Payment.find({ ...match, status: "success" }),
      Expense.find({ ...match, status: "paid" })
    ]);

    // Calculate totals
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Expenses by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Top expense categories
    const topExpenseCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly data (last 6 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthPayments = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate >= monthDate && pDate < nextMonth;
      });
      
      const monthExpenses = expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= monthDate && eDate < nextMonth;
      });

      const income = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses: expense,
        profit: income - expense
      });
    }

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        expensesByCategory,
        monthlyData,
        topExpenseCategories
      }
    });
  } catch (err) {
    console.error("Financial reports error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get students with pending fees
export const getFeesPendingStudents = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { batch, course, minAmount } = req.query;

    // Build filter
    const match = { tenantId };
    if (batch) match.batch = batch;
    if (course) match.course = course;

    // Find all students matching basic criteria
    const students = await Student.find(match).select("name rollNumber email phone batch course fees balance");

    // Filter students with pending fees
    const studentsWithPending = students.filter(student => {
      const fees = student.fees || 0;
      const balance = student.balance || 0;
      const pendingAmount = fees - balance;
      
      // Apply minimum amount filter if specified
      if (minAmount && pendingAmount < Number(minAmount)) {
        return false;
      }
      
      // Only include students with pending fees
      return pendingAmount > 0;
    }).map(student => {
      const fees = student.fees || 0;
      const balance = student.balance || 0;
      const pendingAmount = fees - balance;
      
      return {
        ...student.toObject(),
        pendingAmount,
        percentagePaid: fees > 0 ? ((balance / fees) * 100).toFixed(2) : 0
      };
    });

    // Sort by pending amount (highest first)
    studentsWithPending.sort((a, b) => b.pendingAmount - a.pendingAmount);

    res.json({
      success: true,
      students: studentsWithPending,
      count: studentsWithPending.length,
      totalPending: studentsWithPending.reduce((sum, s) => sum + s.pendingAmount, 0)
    });
  } catch (err) {
    console.error("Fees pending error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all transactions (payments and refunds combined)
export const getAllTransactions = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ 
        success: false, 
        message: "Tenant ID missing" 
      });
    }

    console.log('📊 Get All Transactions Request:', {
      tenantId,
      userId: req.user?._id,
    });

    // Simple filter - just fetch all by tenantId
    const baseFilter = { tenantId };

    // Sort by date descending (most recent first)
    const sortObj = { date: -1 };

    // Fetch payments and refunds in parallel
    const [payments, refunds] = await Promise.all([
      Payment.find(baseFilter)
        .populate({
          path: "studentId",
          select: "name rollNumber batchId",
          populate: {
            path: "batchId",
            select: "name",
          },
        })
        .sort(sortObj)
        .lean(),
      Refund.find(baseFilter)
        .populate({
          path: "studentId",
          select: "name rollNumber batchId",
          populate: {
            path: "batchId",
            select: "name",
          },
        })
        .sort(sortObj)
        .lean()
    ]);

    // Add type field and format data
    let transactions = [
      ...payments.map((p) => ({
        ...p,
        type: "payment",
        studentId: {
          _id: p.studentId?._id || p.studentId,
          name: p.studentId?.name || "N/A",
          rollNumber: p.studentId?.rollNumber || "N/A",
          batchName: p.studentId?.batchId?.name || "N/A",
        },
      })),
      ...refunds.map((r) => ({
        ...r,
        type: "refund",
        studentId: {
          _id: r.studentId?._id || r.studentId,
          name: r.studentId?.name || "N/A",
          rollNumber: r.studentId?.rollNumber || "N/A",
          batchName: r.studentId?.batchId?.name || "N/A",
        },
      })),
    ];

    // Sort combined transactions by date (most recent first)
    transactions.sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return bDate - aDate; // descending
    });

    console.log('✅ Transactions fetched:', {
      totalPayments: payments.length,
      totalRefunds: refunds.length,
      combinedTotal: transactions.length,
    });

    res.json({
      success: true,
      transactions,
      total: transactions.length,
    });
  } catch (err) {
    console.error("❌ Get all transactions error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get revenue trend by month
export const getRevenueTrendByMonth = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { months = 6, period = "monthly" } = req.query;
    const monthsCount = parseInt(months) || 6;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Group by period (monthly, quarterly, or annual)
    let groupExpression;
    let dateFormatExpression;

    if (period === "quarterly") {
      groupExpression = {
        year: { $year: "$date" },
        quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } }
      };
      dateFormatExpression = {
        $concat: [
          "Q",
          { $toString: { $ceil: { $divide: [{ $month: "$date" }, 3] } } },
          " ",
          { $toString: { $year: "$date" } }
        ]
      };
    } else if (period === "annual") {
      groupExpression = {
        year: { $year: "$date" }
      };
      dateFormatExpression = { $toString: { $year: "$date" } };
    } else {
      // monthly (default)
      groupExpression = {
        year: { $year: "$date" },
        month: { $month: "$date" }
      };
      dateFormatExpression = {
        $concat: [
          { $arrayElemAt: [["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], { $month: "$date" }] },
          " ",
          { $toString: { $year: "$date" } }
        ]
      };
    }

    // Get payments grouped by period
    const pipeline = [
      {
        $match: {
          tenantId,
          status: "success",
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupExpression,
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, ...(period !== "annual" && { "_id.month": 1, "_id.quarter": 1 }) } }
    ];

    const revenueData = await Payment.aggregate(pipeline);

    // Format for frontend
    const formattedData = revenueData.map((item, index) => {
      let month;
      if (period === "quarterly") {
        month = `Q${item._id.quarter} ${item._id.year}`;
      } else if (period === "annual") {
        month = `${item._id.year}`;
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        month = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }

      return {
        month,
        revenue: item.revenue,
        transactions: item.count,
        date: period === "quarterly" ? `${item._id.year}-Q${item._id.quarter}` : 
              period === "annual" ? `${item._id.year}` :
              `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      };
    });

    res.json({
      success: true,
      data: formattedData,
      period,
      total: formattedData.reduce((sum, item) => sum + item.revenue, 0),
      average: formattedData.length > 0 ? Math.round(formattedData.reduce((sum, item) => sum + item.revenue, 0) / formattedData.length) : 0
    });
  } catch (err) {
    console.error("❌ Get revenue trend error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get pending fees trend by month
export const getPendingFeesTrendByMonth = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { months = 6, period = "monthly" } = req.query;
    const monthsCount = parseInt(months) || 6;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Get all students with pending fees
    const students = await Student.find({ tenantId });
    
    // Calculate current pending fees
    const totalPending = students.reduce((sum, s) => {
      const fees = s.fees || 0;
      const balance = s.balance || 0;
      return sum + Math.max(0, fees - balance);
    }, 0);

    // Build monthly data based on student enrollment dates
    const monthlyData = {};
    
    students.forEach(student => {
      const enrollDate = new Date(student.createdAt || new Date());
      const year = enrollDate.getFullYear();
      const month = enrollDate.getMonth();
      
      let key;
      if (period === "quarterly") {
        const quarter = Math.ceil((month + 1) / 3);
        key = `Q${quarter} ${year}`;
      } else if (period === "annual") {
        key = `${year}`;
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = `${monthNames[month]} ${year}`;
      }
      
      if (!monthlyData[key]) {
        monthlyData[key] = { amount: 0, count: 0 };
      }
      
      // Add pending fees for this student
      const pending = Math.max(0, (student.fees || 0) - (student.balance || 0));
      monthlyData[key].amount += pending;
      monthlyData[key].count += 1;
    });

    // Convert to array format
    const formattedData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => {
        // Sort chronologically
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    res.json({
      success: true,
      data: formattedData,
      period,
      total: formattedData.reduce((sum, item) => sum + item.amount, 0),
      average: formattedData.length > 0 ? Math.round(formattedData.reduce((sum, item) => sum + item.amount, 0) / formattedData.length) : 0
    });
  } catch (err) {
    console.error("❌ Get pending fees trend error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get enrollment trend by month
export const getEnrollmentTrendByMonth = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { months = 6, period = "monthly" } = req.query;
    const monthsCount = parseInt(months) || 6;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Get students within date range and all students for total
    const newStudents = await Student.find({
      tenantId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const allStudents = await Student.find({ tenantId });

    // Build monthly data
    const monthlyData = {};
    
    // First, populate with all months in range (with 0 new enrollments)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      let key;
      if (period === "quarterly") {
        const quarter = Math.ceil((month + 1) / 3);
        key = `Q${quarter} ${year}`;
      } else if (period === "annual") {
        key = `${year}`;
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = `${monthNames[month]} ${year}`;
      }
      
      if (!monthlyData[key]) {
        monthlyData[key] = { new: 0, total: 0 };
      }
      
      if (period === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (period === "quarterly") {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    // Add new enrollments
    newStudents.forEach(student => {
      const enrollDate = new Date(student.createdAt);
      const year = enrollDate.getFullYear();
      const month = enrollDate.getMonth();
      
      let key;
      if (period === "quarterly") {
        const quarter = Math.ceil((month + 1) / 3);
        key = `Q${quarter} ${year}`;
      } else if (period === "annual") {
        key = `${year}`;
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = `${monthNames[month]} ${year}`;
      }
      
      if (monthlyData[key]) {
        monthlyData[key].new += 1;
      }
    });

    // Calculate cumulative total for each period
    let cumulativeTotal = 0;
    const periodStartDate = new Date(startDate);
    periodStartDate.setMonth(periodStartDate.getMonth() - monthsCount); // Go back further to get accurate total

    allStudents.forEach(student => {
      const enrollDate = new Date(student.createdAt);
      if (enrollDate <= endDate) {
        const year = enrollDate.getFullYear();
        const month = enrollDate.getMonth();
        
        let key;
        if (period === "quarterly") {
          const quarter = Math.ceil((month + 1) / 3);
          key = `Q${quarter} ${year}`;
        } else if (period === "annual") {
          key = `${year}`;
        } else {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          key = `${monthNames[month]} ${year}`;
        }
        
        if (monthlyData[key]) {
          monthlyData[key].total = (monthlyData[key].total || 0) + 1;
        }
      }
    });

    // Convert to array format and sort
    const formattedData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        new: data.new,
        total: data.total,
        cumulativeNew: data.new
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    res.json({
      success: true,
      data: formattedData,
      period,
      totalNewEnrollments: formattedData.reduce((sum, item) => sum + item.new, 0),
      totalStudents: allStudents.length
    });
  } catch (err) {
    console.error("❌ Get enrollment trend error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get enrollment by batch
export const getEnrollmentByBatch = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    // Get all students grouped by batch
    const students = await Student.find({ tenantId });

    // Group students by batch
    const batchData = {};
    
    students.forEach(student => {
      const batchName = student.batch || 'Unassigned';
      
      if (!batchData[batchName]) {
        batchData[batchName] = {
          batch: batchName,
          students: 0,
          active: 0,
          fees: 0,
          collected: 0,
          pending: 0
        };
      }
      
      const fees = student.fees || 0;
      const balance = student.balance || 0;
      const pendingAmount = Math.max(0, fees - balance);
      const collectedAmount = fees - pendingAmount;
      
      batchData[batchName].students += 1;
      batchData[batchName].fees += fees;
      batchData[batchName].collected += collectedAmount;
      batchData[batchName].pending += pendingAmount;
      
      // Count active students (those with enrollment status = active or ongoing)
      if (student.status === 'active' || student.status === 'ongoing') {
        batchData[batchName].active += 1;
      }
    });

    // Convert to array and sort by student count (descending)
    const formattedData = Object.values(batchData)
      .sort((a, b) => b.students - a.students)
      .slice(0, 10); // Top 10 batches

    res.json({
      success: true,
      data: formattedData,
      totalBatches: Object.keys(batchData).length,
      totalStudents: students.length
    });
  } catch (err) {
    console.error("❌ Get enrollment by batch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get enrollment by course (Admissions count by course)
export const getEnrollmentByCourse = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    // Get all students
    const students = await Student.find({ tenantId });

    // Group students by course
    const courseData = {};
    
    students.forEach(student => {
      const courseName = student.course || 'Unassigned';
      
      if (!courseData[courseName]) {
        courseData[courseName] = {
          course: courseName,
          students: 0,
          active: 0
        };
      }
      
      courseData[courseName].students += 1;
      
      // Count active students
      if (student.status === 'active' || student.status === 'ongoing') {
        courseData[courseName].active += 1;
      }
    });

    // Convert to array and sort by student count (descending)
    const formattedData = Object.values(courseData).sort((a, b) => b.students - a.students);

    res.json({
      success: true,
      data: formattedData,
      totalCourses: formattedData.length,
      totalStudents: students.length
    });
  } catch (err) {
    console.error("❌ Get enrollment by course error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get expenses trend by month
export const getExpensesTrendByMonth = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { months = 6, period = "monthly" } = req.query;
    const monthsCount = parseInt(months) || 6;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Get expenses within date range
    const expenses = await Expense.find({
      tenantId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Build monthly data
    const monthlyData = {};
    
    // First, populate with all months in range (with 0 expenses)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      let key;
      if (period === "quarterly") {
        const quarter = Math.ceil((month + 1) / 3);
        key = `Q${quarter} ${year}`;
      } else if (period === "annual") {
        key = `${year}`;
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = `${monthNames[month]} ${year}`;
      }
      
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, expenses: 0 };
      }
      
      // Only increment month for monthly period
      if (period === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (period === "quarterly") {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    // Add expenses to respective months
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const year = expenseDate.getFullYear();
      const month = expenseDate.getMonth();
      
      let key;
      if (period === "quarterly") {
        const quarter = Math.ceil((month + 1) / 3);
        key = `Q${quarter} ${year}`;
      } else if (period === "annual") {
        key = `${year}`;
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        key = `${monthNames[month]} ${year}`;
      }
      
      if (monthlyData[key]) {
        monthlyData[key].expenses += expense.amount || 0;
      }
    });

    // Convert to array format and sort
    const formattedData = Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

    res.json({
      success: true,
      data: formattedData,
      period,
      totalExpenses: formattedData.reduce((sum, item) => sum + item.expenses, 0)
    });
  } catch (err) {
    console.error("❌ Get expenses trend error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

