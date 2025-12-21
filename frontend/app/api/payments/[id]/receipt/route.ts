/**
 * BFF Payment Receipt Generation Route
 * 
 * GET /api/payments/[id]/receipt - Generate and download payment receipt PDF
 * 
 * This route:
 * 1. Fetches payment and student details from backend
 * 2. Generates a professional PDF receipt using jsPDF
 * 3. Uploads PDF to S3
 * 4. Returns PDF for download or S3 URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: paymentId } = params;
    const cookies = extractCookies(request);

    console.log('📄 Generating receipt for payment:', paymentId);

    // Fetch payment details from backend
    const paymentResponse = await fetch(
      `${BACKEND_URL}/api/payments/${paymentId}/details`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
      }
    );

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      return NextResponse.json(
        { success: false, message: error.message || 'Payment not found' },
        { status: paymentResponse.status }
      );
    }

    const paymentData = await paymentResponse.json();
    const { payment, student, institute } = paymentData;

    // Generate PDF
    const doc = new jsPDF();
    
    // Header - Institute Name
    doc.setFillColor(59, 130, 246); // Blue gradient
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(institute?.name || 'Educational Institute', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (institute?.address) {
      doc.text(institute.address, 105, 28, { align: 'center' });
    }
    if (institute?.phone || institute?.email) {
      const contactInfo = [institute.phone, institute.email].filter(Boolean).join(' | ');
      doc.text(contactInfo, 105, 34, { align: 'center' });
    }

    // Receipt Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FEE PAYMENT RECEIPT', 105, 55, { align: 'center' });

    // Receipt Number and Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const receiptNo = `REC-${payment._id.substring(payment._id.length - 8).toUpperCase()}`;
    const receiptDate = new Date(payment.date || payment.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    doc.text(`Receipt No: ${receiptNo}`, 20, 65);
    doc.text(`Date: ${receiptDate}`, 150, 65);

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);

    // Student Details Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Details', 20, 80);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 88;
    
    const studentDetails = [
      ['Name:', student.name],
      ['Email:', student.email],
      ['Phone:', student.phone || 'N/A'],
      ['Course:', student.course || 'N/A'],
      ['Batch:', student.batchName || 'N/A'],
      ['Roll No:', student.rollNumber || 'N/A'],
    ];

    studentDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, yPos);
      yPos += 7;
    });

    // Payment Details Section
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const paymentDetails = [
      ['Payment Method:', (payment.method || 'cash').replace('_', ' ').toUpperCase()],
      ['Transaction Date:', new Date(payment.date || payment.createdAt).toLocaleString('en-IN')],
      ['Remarks:', payment.remarks || 'No remarks'],
    ];

    paymentDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, yPos);
      yPos += 7;
    });

    // Amount Table
    yPos += 10;
    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Amount (₹)']],
      body: [
        ['Fee Payment', payment.amount.toLocaleString('en-IN')],
      ],
      foot: [['Total Amount Paid', `₹${payment.amount.toLocaleString('en-IN')}`]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
      footStyles: { fillColor: [34, 197, 94], fontSize: 12, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 50, halign: 'right' },
      },
    });

    // Balance Summary (if available)
    if (student.fees !== undefined) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Fee Summary', 20, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let summaryY = finalY + 8;
      
      const totalFees = student.fees || 0;
      const totalPaid = (student.fees || 0) - (student.balance || 0);
      const balance = student.balance || 0;

      doc.text(`Total Fees:`, 25, summaryY);
      doc.text(`₹${totalFees.toLocaleString('en-IN')}`, 160, summaryY, { align: 'right' });
      summaryY += 7;
      
      doc.text(`Total Paid:`, 25, summaryY);
      doc.setTextColor(34, 197, 94);
      doc.text(`₹${totalPaid.toLocaleString('en-IN')}`, 160, summaryY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      summaryY += 7;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Balance Due:`, 25, summaryY);
      doc.setTextColor(239, 68, 68);
      doc.text(`₹${balance.toLocaleString('en-IN')}`, 160, summaryY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated receipt and does not require a signature.', 105, pageHeight - 20, { align: 'center' });
    doc.text('For any queries, please contact the accounts department.', 105, pageHeight - 15, { align: 'center' });
    
    // Authorized Signature
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.line(130, pageHeight - 35, 180, pageHeight - 35);
    doc.text('Authorized Signature', 155, pageHeight - 30, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Upload to S3 (call backend to handle S3 upload)
    const uploadResponse = await fetch(
      `${BACKEND_URL}/api/payments/${paymentId}/upload-receipt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify({
          pdfBase64,
          filename: `receipt-${receiptNo}.pdf`,
          studentId: student._id,
        }),
      }
    );

    let receiptUrl = null;
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      receiptUrl = uploadData.receiptUrl;
      console.log('✅ Receipt uploaded to S3:', receiptUrl);
    } else {
      console.warn('⚠️ Failed to upload receipt to S3, will provide download only');
    }

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${receiptNo}.pdf"`,
        'X-Receipt-URL': receiptUrl || '',
      },
    });

  } catch (error: any) {
    console.error('❌ Receipt generation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
