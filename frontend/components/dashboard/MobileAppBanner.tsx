import React from 'react';
import { Smartphone, Download, QrCode } from 'lucide-react';

interface MobileAppBannerProps {
  tenantId: string;
  className?: string;
}

export default function MobileAppBanner({ tenantId, className = '' }: MobileAppBannerProps) {
  const handleDownloadAPK = () => {
    // This would generate a tenant-specific APK download link
    const apkUrl = `https://enromatics.com/api/mobile/download-apk?tenantId=${tenantId}`;
    window.open(apkUrl, '_blank');
  };

  const handleViewQR = () => {
    // This would show a QR code for mobile app download
    const qrUrl = `https://enromatics.com/mobile-download?tenantId=${tenantId}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              📱 Mobile App Available
            </h3>
            <p className="text-sm text-gray-600">
              Students can register for scholarship exams using our mobile app
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewQR}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <QrCode size={16} />
            QR Code
          </button>
          <button
            onClick={handleDownloadAPK}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Download APK
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        💡 Mobile app syncs scholarship registrations with your web dashboard in real-time
      </div>
    </div>
  );
}