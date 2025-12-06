import PDFDocument from 'pdfkit';
import { uploadToS3, getInvoiceS3Key, getSignedDownloadUrl } from './s3Service.js';

// Plan names for display
const PLAN_NAMES = {
  free: 'Free',
  trial: 'Trial',
  test: 'Test',
  starter: 'Starter',
  professional: 'Professional',
  pro: 'Professional',
  enterprise: 'Enterprise',
};

/**
 * Generate invoice PDF and upload to S3
 * @param {Object} tenant - Tenant document
 * @returns {Promise<{pdfBuffer: Buffer, s3Url: string, s3Key: string}>}
 */
export const generateInvoicePdf = async (tenant) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Invoice - ${tenant.instituteName || tenant.name}`,
          Author: 'Enromatics',
        }
      });

      // Collect PDF data into buffer
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Generate invoice number
          const invoiceNumber = tenant.subscription?.invoiceNumber 
            ? `INV-${String(tenant.subscription.invoiceNumber).padStart(4, '0')}`
            : `INV-${tenant.tenantId.slice(-6).toUpperCase()}`;

          // Upload to S3
          const s3Key = getInvoiceS3Key(tenant.tenantId, invoiceNumber);
          const { url: s3Url } = await uploadToS3(pdfBuffer, s3Key, 'application/pdf');

          resolve({ pdfBuffer, s3Url, s3Key, invoiceNumber });
        } catch (s3Error) {
          console.error('S3 upload error in PDF generation:', s3Error);
          // Still return the PDF buffer even if S3 upload fails
          const pdfBuffer = Buffer.concat(chunks);
          resolve({ pdfBuffer, s3Url: null, s3Key: null, invoiceNumber: null });
        }
      });
      doc.on('error', reject);

      // Get invoice data
      const plan = tenant.plan || 'free';
      const billingCycle = tenant.subscription?.billingCycle || 'monthly';
      const amount = tenant.subscription?.amount || 0;
      const startDate = tenant.subscription?.startDate || tenant.createdAt;
      const endDate = tenant.subscription?.endDate;
      const invoiceNumber = tenant.subscription?.invoiceNumber 
        ? `INV-${String(tenant.subscription.invoiceNumber).padStart(4, '0')}`
        : `INV-${tenant.tenantId.slice(-6).toUpperCase()}`;

      // Colors
      const primaryColor = '#3b82f6';
      const textColor = '#333333';
      const lightGray = '#f5f5f5';

      // Header
      doc.fillColor(primaryColor)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('Enromatics', 50, 50);

      doc.fillColor(textColor)
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('INVOICE', 400, 50, { align: 'right' });

      doc.fontSize(12)
         .font('Helvetica')
         .text(`#${invoiceNumber}`, 400, 85, { align: 'right' });

      // Divider line
      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .moveTo(50, 110)
         .lineTo(550, 110)
         .stroke();

      // Bill To section
      doc.fillColor(primaryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('BILL TO', 50, 140);

      doc.fillColor(textColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(tenant.instituteName || tenant.name, 50, 155);

      doc.font('Helvetica')
         .fontSize(10)
         .text(tenant.name, 50, 172)
         .text(tenant.email, 50, 187);

      if (tenant.contact?.phone) {
        doc.text(tenant.contact.phone, 50, 202);
      }

      // Invoice Info section (right side)
      doc.fillColor(primaryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('INVOICE DETAILS', 350, 140);

      doc.fillColor(textColor)
         .fontSize(10)
         .font('Helvetica');

      doc.font('Helvetica-Bold').text('Invoice Date:', 350, 155);
      doc.font('Helvetica').text(new Date(startDate).toLocaleDateString('en-IN'), 440, 155);

      doc.font('Helvetica-Bold').text('Due Date:', 350, 170);
      doc.font('Helvetica').text(endDate ? new Date(endDate).toLocaleDateString('en-IN') : 'N/A', 440, 170);

      doc.font('Helvetica-Bold').text('Status:', 350, 185);
      const status = tenant.subscription?.status || 'inactive';
      doc.fillColor(status === 'active' ? '#166534' : '#991b1b')
         .text(status.toUpperCase(), 440, 185);

      // Items Table Header
      const tableTop = 260;
      doc.fillColor('#ffffff');
      doc.rect(50, tableTop, 500, 25).fill(primaryColor);

      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Description', 60, tableTop + 8)
         .text('Plan', 240, tableTop + 8)
         .text('Billing Cycle', 330, tableTop + 8)
         .text('Amount', 480, tableTop + 8, { align: 'right', width: 60 });

      // Items Table Row
      const rowTop = tableTop + 25;
      doc.fillColor(textColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Enromatics Subscription', 60, rowTop + 10)
         .text(PLAN_NAMES[plan] || plan, 240, rowTop + 10)
         .text(billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1), 330, rowTop + 10)
         .text(`₹${amount.toLocaleString()}`, 480, rowTop + 10, { align: 'right', width: 60 });

      // Row border
      doc.strokeColor('#eeeeee')
         .lineWidth(1)
         .moveTo(50, rowTop + 30)
         .lineTo(550, rowTop + 30)
         .stroke();

      // Total Row
      const totalTop = rowTop + 35;
      doc.fillColor(lightGray);
      doc.rect(50, totalTop, 500, 30).fill();

      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .moveTo(50, totalTop)
         .lineTo(550, totalTop)
         .stroke();

      doc.fillColor(textColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Total', 400, totalTop + 10)
         .text(`₹${amount.toLocaleString()}`, 480, totalTop + 10, { align: 'right', width: 60 });

      // Footer
      const footerTop = 700;
      doc.strokeColor('#eeeeee')
         .lineWidth(1)
         .moveTo(50, footerTop)
         .lineTo(550, footerTop)
         .stroke();

      doc.fillColor('#666666')
         .fontSize(10)
         .font('Helvetica')
         .text('Thank you for choosing Enromatics!', 50, footerTop + 15, { align: 'center', width: 500 })
         .text('For any queries, contact us at support@enromatics.com', 50, footerTop + 30, { align: 'center', width: 500 })
         .text(`© ${new Date().getFullYear()} Enromatics. All rights reserved.`, 50, footerTop + 50, { align: 'center', width: 500 });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get signed download URL for an invoice
 * @param {string} s3Key - The S3 key of the invoice PDF
 * @returns {Promise<string>} - Signed download URL
 */
export const getInvoiceDownloadUrl = async (s3Key) => {
  return await getSignedDownloadUrl(s3Key, 3600); // 1 hour expiry
};

export default { generateInvoicePdf, getInvoiceDownloadUrl };
