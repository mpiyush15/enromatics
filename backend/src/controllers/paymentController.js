import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

export const addPayment = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId, amount, method = "cash", status = "success", date } = req.body;

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });
    if (!studentId || !amount) return res.status(400).json({ message: "studentId and amount are required" });

    const payment = await Payment.create({
      tenantId,
      studentId,
      amount: Number(amount),
      method,
      status,
      date: date ? new Date(date) : new Date(),
    });

    // Update student's balance (sum of payments made)
    // We'll increment balance by the amount paid
    await Student.findOneAndUpdate({ _id: studentId, tenantId }, { $inc: { balance: Number(amount) } });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const payment = await Payment.findOne({ _id: id, tenantId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // If payment was successful, decrement student's balance
    if (payment.status === "success") {
      await Student.findOneAndUpdate({ _id: payment.studentId, tenantId }, { $inc: { balance: -Number(payment.amount) } });
    }

    await payment.remove();

    res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (err) {
    console.error("Delete payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceipt = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.student?.tenantId;
    const { id } = req.params; // payment id

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const payment = await Payment.findOne({ _id: id, tenantId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // If called by student, ensure they own this payment
    if (req.student) {
      if (String(payment.studentId) !== String(req.student._id)) {
        return res.status(403).json({ message: "Not authorized to view this receipt" });
      }
    }

    const student = await Student.findById(payment.studentId);
    // tenant info
    const Tenant = await import("../models/Tenant.js");
    const tenant = await Tenant.default.findOne({ tenantId });

    const instituteName = tenant?.name || "Institute";

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${payment._id}</title>
        <style>body{font-family: Arial, sans-serif; padding:20px} .header{display:flex;justify-content:space-between} .box{border:1px solid #ddd;padding:16px;border-radius:6px}</style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>${instituteName}</h2>
            <div>${tenant?.email || ""}</div>
            <div>${tenant?.address || ""}</div>
          </div>
          <div>
            <strong>Receipt</strong>
            <div>ID: ${payment._id}</div>
            <div>Date: ${new Date(payment.date).toLocaleString()}</div>
          </div>
        </div>
        <hr />
        <div class="box">
          <h3>Student</h3>
          <div>Name: ${student?.name || "-"}</div>
          <div>Email: ${student?.email || "-"}</div>
          <div>Roll Number: ${student?.rollNumber || "-"}</div>
        </div>
        <div class="box" style="margin-top:12px">
          <h3>Payment Details</h3>
          <div>Amount: ₹${payment.amount}</div>
          <div>Method: ${payment.method}</div>
          <div>Status: ${payment.status}</div>
        </div>
      </body>
    </html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${payment._id}.html`);
    res.send(html);
  } catch (err) {
    console.error("Get receipt error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
