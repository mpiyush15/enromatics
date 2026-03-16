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
    instituteName?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    contact?: {
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    };
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

  // Get institute details from tenantInfo
  const instituteName = tenantInfo?.instituteName || tenantInfo?.name || "Institute Name";
  const institutePhone = tenantInfo?.contact?.phone || tenantInfo?.phone || "N/A";
  const instituteEmail = tenantInfo?.contact?.email || tenantInfo?.email || "N/A";
  const instituteAddress = tenantInfo?.contact?.address || tenantInfo?.address || "Address not provided";
  const instituteCity = tenantInfo?.contact?.city || "";
  const instituteState = tenantInfo?.contact?.state || "";

  const fullAddress = [instituteAddress, instituteCity, instituteState].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Fee Receipt</h2>
            <p className="text-blue-100 text-sm mt-1">Receipt #{payment.receiptNumber}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition flex items-center gap-2"
            >
              🖨️ Print
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Receipt Preview */}
        <div ref={printRef} className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="receipt max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            
            {/* Header Section */}
            <div className="border-b-4 border-blue-600 pb-6 mb-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{instituteName}</h1>
                <div className="text-gray-600 text-sm space-y-1">
                  <p>📍 {fullAddress}</p>
                  <p>📱 {institutePhone} | 📧 {instituteEmail}</p>
                </div>
              </div>
            </div>

            {/* Receipt Title */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-lg">
                FEE RECEIPT
              </div>
              <p className="text-gray-500 text-sm mt-3">Date: {formatDate(payment.date)}</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Student Information */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 text-blue-600">Student Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">STUDENT NAME</p>
                    <p className="text-gray-900 font-semibold">{payment.studentId.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">ROLL NUMBER</p>
                    <p className="text-gray-900 font-semibold">{payment.studentId.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">COURSE</p>
                    <p className="text-gray-900 font-semibold">{payment.studentId.course}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">BATCH</p>
                    <p className="text-gray-900 font-semibold">{payment.studentId.batch}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 text-blue-600">Payment Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">FEE TYPE</p>
                    <p className="text-gray-900 font-semibold capitalize">{payment.feeType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">PAYMENT METHOD</p>
                    <p className="text-gray-900 font-semibold capitalize">{payment.method}</p>
                  </div>
                  {payment.academicYear && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">ACADEMIC YEAR</p>
                      <p className="text-gray-900 font-semibold">{payment.academicYear}</p>
                    </div>
                  )}
                  {payment.month && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">MONTH</p>
                      <p className="text-gray-900 font-semibold">{payment.month}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Paid - Highlighted */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">Amount Paid</p>
              <p className="text-4xl font-bold text-blue-600">{formatCurrency(payment.amount)}</p>
            </div>

            {/* Additional Details */}
            {(payment.transactionId || payment.remarks) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
                {payment.transactionId && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-semibold uppercase">TRANSACTION ID</p>
                    <p className="text-gray-900 font-mono text-sm">{payment.transactionId}</p>
                  </div>
                )}
                {payment.remarks && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">REMARKS</p>
                    <p className="text-gray-900 text-sm">{payment.remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-6 mt-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-600 text-xs italic">Thank you for your payment!</p>
                  <p className="text-gray-500 text-xs mt-2">Receipt generated on: {formatDate(new Date().toISOString())}</p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-32 mb-2"></div>
                  <p className="text-xs text-gray-600 font-semibold">Authorized By</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
