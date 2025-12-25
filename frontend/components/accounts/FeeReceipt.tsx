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
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const htmlContent = content.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${payment.receiptNumber}</title>
          <style>
            @media print {
              @page { size: A8 landscape; margin: 3mm; }
              body { margin: 0; padding: 0; }
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 7px;
              line-height: 1.3;
              color: #000;
            }
            .receipt {
              width: 100%;
              padding: 5px;
              border: 2px solid #000;
            }
            
            /* Header */
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 3px;
              margin-bottom: 4px;
            }
            .institute-name {
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .contact-info {
              font-size: 6px;
            }
            
            /* Title */
            .title {
              text-align: center;
              font-size: 9px;
              font-weight: bold;
              background: #000;
              color: #fff;
              padding: 2px;
              margin-bottom: 4px;
            }
            
            /* Receipt Info */
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 6px;
              font-weight: bold;
            }
            
            /* Details Table */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 4px;
            }
            td {
              padding: 2px 3px;
              font-size: 7px;
              vertical-align: top;
            }
            .label {
              font-weight: bold;
              width: 35%;
            }
            .value {
              width: 65%;
            }
            tr {
              border-bottom: 1px dotted #ccc;
            }
            
            /* Amount Box */
            .amount-box {
              text-align: center;
              border: 2px solid #000;
              padding: 4px;
              margin: 5px 0;
              background: #f5f5f5;
            }
            .amount-label {
              font-size: 6px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .amount-value {
              font-size: 12px;
              font-weight: bold;
            }
            
            /* Footer */
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 5px;
              padding-top: 3px;
              border-top: 1px solid #000;
            }
            .thank-you {
              font-size: 6px;
              font-style: italic;
            }
            .signature-box {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 50px;
              margin-bottom: 2px;
            }
            .signature-label {
              font-size: 5px;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-semibold">Fee Receipt</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition"
            >
              🖨️ Print
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Receipt Preview */}
        <div ref={printRef} className="p-8 bg-gray-100">
          <div className="receipt max-w-2xl mx-auto bg-white border-2 border-black p-6">
            
            {/* Header */}
            <div className="header text-center border-b-2 border-black pb-3 mb-4">
              <div className="institute-name text-2xl font-bold mb-2 uppercase">
                {tenantInfo?.name || "INSTITUTE NAME"}
              </div>
              <div className="contact-info text-sm">
                {tenantInfo?.address || "Institute Address"}<br />
                Phone: {tenantInfo?.phone || "N/A"} | Email: {tenantInfo?.email || "N/A"}
              </div>
            </div>

            {/* Title */}
            <div className="title text-center text-lg font-bold bg-black text-white py-2 mb-4">
              FEE RECEIPT
            </div>

            {/* Receipt Info */}
            <div className="receipt-info flex justify-between mb-4 text-sm font-bold">
              <div>Receipt No: {payment.receiptNumber}</div>
              <div>Date: {formatDate(payment.date)}</div>
            </div>

            {/* Details Table */}
            <table className="w-full mb-4">
              <tbody>
                <tr>
                  <td className="label font-bold">Student Name:</td>
                  <td className="value">{payment.studentId.name}</td>
                </tr>
                <tr>
                  <td className="label font-bold">Roll Number:</td>
                  <td className="value">{payment.studentId.rollNumber}</td>
                </tr>
                <tr>
                  <td className="label font-bold">Course:</td>
                  <td className="value">{payment.studentId.course}</td>
                </tr>
                <tr>
                  <td className="label font-bold">Batch:</td>
                  <td className="value">{payment.studentId.batch}</td>
                </tr>
                <tr>
                  <td className="label font-bold">Fee Type:</td>
                  <td className="value uppercase">{payment.feeType}</td>
                </tr>
                {payment.month && (
                  <tr>
                    <td className="label font-bold">Month:</td>
                    <td className="value">{payment.month}</td>
                  </tr>
                )}
                {payment.academicYear && (
                  <tr>
                    <td className="label font-bold">Academic Year:</td>
                    <td className="value">{payment.academicYear}</td>
                  </tr>
                )}
                <tr>
                  <td className="label font-bold">Payment Method:</td>
                  <td className="value uppercase">{payment.method}</td>
                </tr>
                {payment.transactionId && (
                  <tr>
                    <td className="label font-bold">Transaction ID:</td>
                    <td className="value font-mono text-sm">{payment.transactionId}</td>
                  </tr>
                )}
                {payment.remarks && (
                  <tr>
                    <td className="label font-bold">Remarks:</td>
                    <td className="value">{payment.remarks}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Amount Box */}
            <div className="amount-box text-center border-2 border-black p-4 my-6 bg-gray-100">
              <div className="amount-label text-sm font-bold mb-2">AMOUNT PAID</div>
              <div className="amount-value text-3xl font-bold">{formatCurrency(payment.amount)}</div>
            </div>

            {/* Footer */}
            <div className="footer flex justify-between items-end mt-6 pt-3 border-t border-black">
              <div className="thank-you text-sm italic">
                Thank you for your payment!
              </div>
              <div className="signature-box text-center">
                <div className="signature-line border-t border-black w-32 mb-2 ml-auto"></div>
                <div className="signature-label text-xs">Authorized Signature</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
