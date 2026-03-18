import React from 'react';
import { Clock, MapPin, User, Mail, Phone, Badge } from 'lucide-react';

interface EnquiryCardProps {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  course: string;
  status: 'new' | 'contacted' | 'interested' | 'enrolled' | 'rejected';
  enquiryDate: string;
  message: string;
  location?: string;
}

const StatusConfig = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'New Lead', badge: 'bg-blue-100' },
  contacted: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Contacted', badge: 'bg-yellow-100' },
  interested: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Interested', badge: 'bg-purple-100' },
  enrolled: { bg: 'bg-green-50', text: 'text-green-700', label: 'Enrolled', badge: 'bg-green-100' },
  rejected: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Rejected', badge: 'bg-gray-100' },
};

export const EnquiryCard: React.FC<EnquiryCardProps> = ({
  id,
  studentName,
  email,
  phone,
  course,
  status,
  enquiryDate,
  message,
  location,
}) => {
  const statusConfig = StatusConfig[status];

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/50 p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Status Badge */}
      <div className="absolute top-6 right-6">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.badge} ${statusConfig.text}`}>
          <span className={`w-2 h-2 rounded-full ${statusConfig.text === 'text-blue-700' ? 'bg-blue-700' : statusConfig.text === 'text-yellow-700' ? 'bg-yellow-700' : statusConfig.text === 'text-purple-700' ? 'bg-purple-700' : statusConfig.text === 'text-green-700' ? 'bg-green-700' : 'bg-gray-700'}`}></span>
          {statusConfig.label}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="pr-32">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {studentName}
          </h3>
          <p className="text-sm font-medium text-blue-600 mt-1">{course}</p>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {message}
        </p>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-700 truncate hover:text-clip">{email}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm text-gray-700">{phone}</p>
            </div>
          </div>
        </div>

        {/* Location & Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              {location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
            <Clock className="w-4 h-4 text-gray-400" />
            {enquiryDate}
          </div>
        </div>
      </div>

      {/* Hover Action Indicator */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/0 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};
