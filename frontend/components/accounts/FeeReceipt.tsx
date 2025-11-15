"use client";

import { useRef } from "react";

interface ReceiptProps {
  payment: {
    _id: string;
    amount: number;
    method: string;
    date: string;
    receiptNumber: string;
    feeType: string;
    month?: string;
    academicYear?: string;
    transactionId?: string;
    remarks?: string;
    studentId: {
      name: string;
      rollNumber: string;
      email: string;
      phone: string;
      batch: string;
      course: string;
      address?: string;
      fees: number;
      balance: number;
    };
  };
  tenantInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  onClose?: () => void;
}

export default function FeeReceipt({ payment, tenantInfo, onClose }: ReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Fee Receipt - ${payment.receiptNumber}</title>
              <style>
                @media print {
                  @page { size: A4; margin: 0; }
                  body { margin: 0; padding: 0; }
                }
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: white;
                }
                .receipt-container {
                  width: 210mm;
                  min-height: 297mm;
                  margin: 0 auto;
                  padding: 20mm;
                  background: white;
                  box-sizing: border-box;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 3px solid #2563eb;
                  padding-bottom: 20px;
                }
                .logo {
                  width: 80px;
                  height: 80px;
                  margin: 0 auto 10px;
                }
                .school-name {
                  font-size: 28px;
                  font-weight: bold;
                  color: #1e40af;
                  margin: 10px 0;
                }
                .school-details {
                  font-size: 12px;
                  color: #666;
                  line-height: 1.6;
                }
                .receipt-title {
                  font-size: 24px;
                  font-weight: bold;
                  text-align: center;
                  margin: 20px 0;
                  color: #1f2937;
                  text-transform: uppercase;
                  background: #f3f4f6;
                  padding: 10px;
                  border-radius: 8px;
                }
                .receipt-number {
                  text-align: right;
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 20px;
                }
                .section {
                  margin: 20px 0;
                }
                .section-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #2563eb;
                  margin-bottom: 10px;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 5px;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin: 15px 0;
                }
                .info-item {
                  display: flex;
                  gap: 10px;
                }
                .info-label {
                  font-weight: bold;
                  color: #374151;
                  min-width: 120px;
                }
                .info-value {
                  color: #1f2937;
                }
                .payment-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                .payment-table th,
                .payment-table td {
                  border: 1px solid #d1d5db;
                  padding: 12px;
                  text-align: left;
                }
                .payment-table th {
                  background: #f3f4f6;
                  font-weight: bold;
                  color: #374151;
                }
                .amount-section {
                  background: #eff6ff;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border: 2px solid #2563eb;
                }
                .amount-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 10px 0;
                  font-size: 16px;
                }
                .total-amount {
                  font-size: 24px;
                  font-weight: bold;
                  color: #1e40af;
                  margin-top: 15px;
                  padding-top: 15px;
                  border-top: 2px solid #2563eb;
                }
                .amount-words {
                  font-style: italic;
                  color: #666;
                  margin-top: 10px;
                  font-size: 14px;
                }
                .footer {
                  margin-top: 50px;
                  padding-top: 20px;
                  border-top: 2px solid #e5e7eb;
                }
                .signature-section {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 50px;
                }
                .signature-box {
                  text-align: center;
                  min-width: 200px;
                }
                .signature-line {
                  border-top: 2px solid #000;
                  margin-top: 50px;
                  padding-top: 5px;
                  font-size: 12px;
                  color: #666;
                }
                .notes {
                  margin-top: 30px;
                  padding: 15px;
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  font-size: 12px;
                  color: #92400e;
                }
                .future-features {
                  margin-top: 20px;
                  padding: 15px;
                  background: #f0fdf4;
                  border-left: 4px solid #10b981;
                  font-size: 11px;
                  color: #065f46;
                }
                .watermark {
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  font-size: 80px;
                  color: rgba(0, 0, 0, 0.03);
                  font-weight: bold;
                  z-index: -1;
                  pointer-events: none;
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  const numberToWords = (num: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";

    let words = "";
    
    if (num >= 10000000) {
      words += numberToWords(Math.floor(num / 10000000)) + " Crore ";
      num %= 10000000;
    }
    if (num >= 100000) {
      words += numberToWords(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }
    if (num >= 1000) {
      words += numberToWords(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }
    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num >= 10) {
      words += teens[num - 10] + " ";
      return words.trim();
    }
    if (num > 0) {
      words += ones[num] + " ";
    }

    return words.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Action Buttons */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Fee Receipt Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
            >
              🖨️ Print
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
              title="Coming Soon"
            >
              📧 Email
            </button>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
              title="Coming Soon"
            >
              📱 WhatsApp
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* A4 Receipt Content */}
        <div ref={printRef} className="receipt-container" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "20mm", background: "white" }}>
          <div className="watermark">PAID</div>

          {/* Header */}
          <div className="header" style={{ textAlign: "center", marginBottom: "30px", borderBottom: "3px solid #2563eb", paddingBottom: "20px" }}>
            {tenantInfo?.logo && (
              <div className="logo" style={{ width: "80px", height: "80px", margin: "0 auto 10px", background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
                🎓
              </div>
            )}
            <div className="school-name" style={{ fontSize: "28px", fontWeight: "bold", color: "#1e40af", margin: "10px 0" }}>
              {tenantInfo?.name || "Your Institute Name"}
            </div>
            <div className="school-details" style={{ fontSize: "12px", color: "#666", lineHeight: "1.6" }}>
              {tenantInfo?.address || "Institute Address"}<br />
              Phone: {tenantInfo?.phone || "+91 XXXXX XXXXX"} | Email: {tenantInfo?.email || "info@institute.com"}
            </div>
          </div>

          {/* Receipt Title */}
          <div className="receipt-title" style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", margin: "20px 0", color: "#1f2937", textTransform: "uppercase", background: "#f3f4f6", padding: "10px", borderRadius: "8px" }}>
            FEE RECEIPT
          </div>

          {/* Receipt Number and Date */}
          <div className="receipt-number" style={{ textAlign: "right", fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            <strong>Receipt No:</strong> {payment.receiptNumber}<br />
            <strong>Date:</strong> {new Date(payment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          </div>

          {/* Student Information */}
          <div className="section">
            <div className="section-title" style={{ fontSize: "14px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px", borderBottom: "2px solid #e5e7eb", paddingBottom: "5px" }}>
              Student Information
            </div>
            <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", margin: "15px 0" }}>
              <div className="info-item">
                <span className="info-label" style={{ fontWeight: "bold", color: "#374151", minWidth: "120px" }}>Name:</span>
                <span className="info-value" style={{ color: "#1f2937" }}>{payment.studentId.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ fontWeight: "bold", color: "#374151", minWidth: "120px" }}>Roll Number:</span>
                <span className="info-value" style={{ color: "#1f2937" }}>{payment.studentId.rollNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ fontWeight: "bold", color: "#374151", minWidth: "120px" }}>Course:</span>
                <span className="info-value" style={{ color: "#1f2937" }}>{payment.studentId.course}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ fontWeight: "bold", color: "#374151", minWidth: "120px" }}>Batch:</span>
                <span className="info-value" style={{ color: "#1f2937" }}>{payment.studentId.batch}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ fontWeight: "bold", color: "#374151", minWidth: "120px" }}>Email:</span>
                <span className="info-value" style={{ color: "#1f2937" }}>{payment.studentId.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ fontWeight: "bold", color: "#374151", minWidth: "120px" }}>Phone:</span>
                <span className="info-value" style={{ color: "#1f2937" }}>{payment.studentId.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="section">
            <div className="section-title" style={{ fontSize: "14px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px", borderBottom: "2px solid #e5e7eb", paddingBottom: "5px" }}>
              Payment Details
            </div>
            <table className="payment-table" style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "left", background: "#f3f4f6", fontWeight: "bold", color: "#374151" }}>Fee Type</th>
                  <th style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "left", background: "#f3f4f6", fontWeight: "bold", color: "#374151" }}>Period</th>
                  <th style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "left", background: "#f3f4f6", fontWeight: "bold", color: "#374151" }}>Payment Mode</th>
                  <th style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "right", background: "#f3f4f6", fontWeight: "bold", color: "#374151" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "left" }}>{payment.feeType || "Tuition Fee"}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "left" }}>{payment.month || payment.academicYear || "-"}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "left", textTransform: "uppercase" }}>{payment.method}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: "12px", textAlign: "right", fontWeight: "bold" }}>{formatCurrency(payment.amount)}</td>
                </tr>
              </tbody>
            </table>

            {payment.transactionId && (
              <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                <strong>Transaction ID:</strong> {payment.transactionId}
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="amount-section" style={{ background: "#eff6ff", padding: "20px", borderRadius: "8px", margin: "20px 0", border: "2px solid #2563eb" }}>
            <div className="amount-row" style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", fontSize: "16px" }}>
              <span>Total Fees:</span>
              <span style={{ fontWeight: "bold" }}>{formatCurrency(payment.studentId.fees)}</span>
            </div>
            <div className="amount-row" style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", fontSize: "16px" }}>
              <span>Total Paid:</span>
              <span style={{ fontWeight: "bold", color: "#059669" }}>{formatCurrency(payment.studentId.balance)}</span>
            </div>
            <div className="total-amount" style={{ fontSize: "24px", fontWeight: "bold", color: "#1e40af", marginTop: "15px", paddingTop: "15px", borderTop: "2px solid #2563eb", display: "flex", justifyContent: "space-between" }}>
              <span>Balance Due:</span>
              <span>{formatCurrency(payment.studentId.fees - payment.studentId.balance)}</span>
            </div>
            <div className="amount-words" style={{ fontStyle: "italic", color: "#666", marginTop: "10px", fontSize: "14px" }}>
              Amount Paid (in words): <strong>{numberToWords(Math.floor(payment.amount))} Rupees Only</strong>
            </div>
          </div>

          {/* Remarks */}
          {payment.remarks && (
            <div className="notes" style={{ marginTop: "30px", padding: "15px", background: "#fef3c7", borderLeft: "4px solid #f59e0b", fontSize: "12px", color: "#92400e" }}>
              <strong>Remarks:</strong> {payment.remarks}
            </div>
          )}

          {/* Future Features Notice */}
          <div className="future-features" style={{ marginTop: "20px", padding: "15px", background: "#f0fdf4", borderLeft: "4px solid #10b981", fontSize: "11px", color: "#065f46" }}>
            <strong>📧 Email & 📱 WhatsApp Delivery:</strong> Coming Soon! You'll be able to send this receipt directly to students via email and WhatsApp.
          </div>

          {/* Footer */}
          <div className="footer" style={{ marginTop: "50px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
            <div className="signature-section" style={{ display: "flex", justifyContent: "space-between", marginTop: "50px" }}>
              <div className="signature-box" style={{ textAlign: "center", minWidth: "200px" }}>
                <div className="signature-line" style={{ borderTop: "2px solid #000", marginTop: "50px", paddingTop: "5px", fontSize: "12px", color: "#666" }}>
                  Student Signature
                </div>
              </div>
              <div className="signature-box" style={{ textAlign: "center", minWidth: "200px" }}>
                <div className="signature-line" style={{ borderTop: "2px solid #000", marginTop: "50px", paddingTop: "5px", fontSize: "12px", color: "#666" }}>
                  Authorized Signatory
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "30px", fontSize: "11px", color: "#999" }}>
              This is a computer-generated receipt. No signature required.<br />
              For any queries, please contact the accounts department.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
