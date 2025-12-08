import SubscriptionPayment from "../models/SubscriptionPayment.js";
import Tenant from "../models/Tenants.js";
import { uploadToS3, getSignedDownloadUrl, getInvoiceS3Key } from "../services/s3Service.js";
import PDFDocument from "pdfkit";

/**
 * Get payment history for a tenant
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Build query - include all statuses by default, or filter by specific status
    const query = { tenantId };
    if (status && ["success", "failed", "pending", "refunded"].includes(status)) {
      query.status = status;
    }
    // By default show all payment attempts (success, failed, pending, refunded)

    const payments = await SubscriptionPayment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SubscriptionPayment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment history" });
  }
};

/**
 * Get single payment details
 */
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await SubscriptionPayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
};

/**
 * Generate PDF invoice and upload to S3
 */
export const generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await SubscriptionPayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // If invoice already exists, return the signed URL
    if (payment.invoiceGenerated && payment.invoiceS3Key) {
      const signedUrl = await getSignedDownloadUrl(payment.invoiceS3Key);
      return res.json({ 
        success: true, 
        invoiceUrl: signedUrl,
        invoiceNumber: payment.invoiceNumber
      });
    }

    // Get tenant info
    const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(payment, tenant);
    
    // Upload to S3
    const s3Key = getInvoiceS3Key(payment.tenantId, payment.invoiceNumber);
    const uploadResult = await uploadToS3(pdfBuffer, s3Key, "application/pdf");
    
    // Update payment record
    payment.invoiceS3Key = s3Key;
    payment.invoiceUrl = uploadResult.url;
    payment.invoiceGenerated = true;
    await payment.save();

    // Get signed URL for download
    const signedUrl = await getSignedDownloadUrl(s3Key);

    res.json({ 
      success: true, 
      invoiceUrl: signedUrl,
      invoiceNumber: payment.invoiceNumber
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ success: false, message: "Failed to generate invoice" });
  }
};

/**
 * Download invoice (get signed URL)
 */
export const downloadInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await SubscriptionPayment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!payment.invoiceGenerated || !payment.invoiceS3Key) {
      // Generate invoice first
      const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
      const pdfBuffer = await generateInvoicePDF(payment, tenant);
      const s3Key = getInvoiceS3Key(payment.tenantId, payment.invoiceNumber);
      await uploadToS3(pdfBuffer, s3Key, "application/pdf");
      
      payment.invoiceS3Key = s3Key;
      payment.invoiceGenerated = true;
      await payment.save();
    }

    const signedUrl = await getSignedDownloadUrl(payment.invoiceS3Key);
    
    res.json({ 
      success: true, 
      downloadUrl: signedUrl,
      invoiceNumber: payment.invoiceNumber,
      filename: `${payment.invoiceNumber}.pdf`
    });
  } catch (error) {
    console.error("Error downloading invoice:", error);
    res.status(500).json({ success: false, message: "Failed to download invoice" });
  }
};

/**
 * Create a payment record (called after successful payment)
 */
export const createPaymentRecord = async (paymentData) => {
  try {
    const payment = new SubscriptionPayment(paymentData);
    await payment.save();
    return payment;
  } catch (error) {
    console.error("Error creating payment record:", error);
    throw error;
  }
};

/**
 * Generate PDF invoice
 */
async function generateInvoicePDF(payment, tenant) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Company Header
      doc.fontSize(20).text("Enromatics", { align: "center" });
      doc.fontSize(10).text("Education Management Platform", { align: "center" });
      doc.moveDown();
      
      // Invoice title
      doc.fontSize(16).text("TAX INVOICE", { align: "center" });
      doc.moveDown();

      // Invoice details box
      doc.fontSize(10);
      doc.text(`Invoice Number: ${payment.invoiceNumber}`, 50, 150);
      doc.text(`Invoice Date: ${formatDate(payment.invoiceDate || payment.createdAt)}`, 50, 165);
      doc.text(`Payment Status: ${payment.status.toUpperCase()}`, 50, 180);
      
      if (payment.paidAt) {
        doc.text(`Payment Date: ${formatDate(payment.paidAt)}`, 50, 195);
      }

      // Bill To
      doc.text("Bill To:", 350, 150);
      const tenantName = payment.tenantSnapshot?.instituteName || tenant?.name || "Customer";
      const tenantEmail = payment.tenantSnapshot?.email || tenant?.email || "";
      doc.text(tenantName, 350, 165);
      doc.text(tenantEmail, 350, 180);
      if (payment.tenantSnapshot?.gstin) {
        doc.text(`GSTIN: ${payment.tenantSnapshot.gstin}`, 350, 195);
      }

      // Line separator
      doc.moveTo(50, 220).lineTo(550, 220).stroke();

      // Table header
      const tableTop = 240;
      doc.font("Helvetica-Bold");
      doc.text("Description", 50, tableTop);
      doc.text("Period", 200, tableTop);
      doc.text("Amount", 450, tableTop, { align: "right" });
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table content
      doc.font("Helvetica");
      const itemTop = tableTop + 25;
      
      const planDescription = `${payment.planName} Plan (${payment.billingCycle})`;
      const period = `${formatDate(payment.periodStart)} - ${formatDate(payment.periodEnd)}`;
      
      doc.text(planDescription, 50, itemTop);
      doc.text(period, 200, itemTop);
      doc.text(`₹${payment.amount.toLocaleString("en-IN")}`, 450, itemTop, { align: "right" });

      // Totals
      const totalsTop = itemTop + 50;
      doc.moveTo(350, totalsTop).lineTo(550, totalsTop).stroke();
      
      doc.text("Subtotal:", 350, totalsTop + 10);
      doc.text(`₹${payment.amount.toLocaleString("en-IN")}`, 450, totalsTop + 10, { align: "right" });
      
      if (payment.tax > 0) {
        doc.text("GST (18%):", 350, totalsTop + 25);
        doc.text(`₹${payment.tax.toLocaleString("en-IN")}`, 450, totalsTop + 25, { align: "right" });
      }
      
      doc.font("Helvetica-Bold");
      doc.text("Total:", 350, totalsTop + 45);
      doc.text(`₹${payment.totalAmount.toLocaleString("en-IN")}`, 450, totalsTop + 45, { align: "right" });

      // Payment info
      if (payment.gatewayPaymentId) {
        doc.font("Helvetica");
        doc.fontSize(9);
        doc.text(`Transaction ID: ${payment.gatewayPaymentId}`, 50, totalsTop + 80);
        doc.text(`Payment Method: ${payment.paymentMethod}`, 50, totalsTop + 95);
      }

      // Footer
      doc.fontSize(9);
      doc.text("Thank you for your business!", 50, 700, { align: "center" });
      doc.text("For support, contact: support@enromatics.com", 50, 715, { align: "center" });
      
      // Company details
      doc.fontSize(8);
      doc.text("Enromatics | Pixels Technology | Mumbai, India", 50, 740, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
