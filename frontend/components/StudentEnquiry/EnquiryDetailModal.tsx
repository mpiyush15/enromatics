import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';

interface EnquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry?: {
    id: string;
    studentName: string;
    email: string;
    phone: string;
    course: string;
    status: 'new' | 'contacted' | 'interested' | 'enrolled' | 'rejected';
    enquiryDate: string;
    message: string;
    location?: string;
  };
}

const statusColors = {
  new: 'bg-blue-600',
  contacted: 'bg-yellow-600',
  interested: 'bg-purple-600',
  enrolled: 'bg-green-600',
  rejected: 'bg-gray-600',
};

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({ isOpen, onClose, enquiry }) => {
  if (!isOpen || !enquiry) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-gray-200/50">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{enquiry.studentName}</h2>
                <p className="text-blue-600 font-medium mt-2">{enquiry.course}</p>
              </div>
              <span className={`${statusColors[enquiry.status]} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${enquiry.email}`} className="text-gray-900 hover:text-blue-600 transition-colors">
                    {enquiry.email}
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${enquiry.phone}`} className="text-gray-900 hover:text-blue-600 transition-colors">
                    {enquiry.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enquiry.location && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{enquiry.location}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Enquiry Date</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/50">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{enquiry.enquiryDate}</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</label>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <p className="text-gray-900 leading-relaxed">{enquiry.message}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200/50">
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
              <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-semibold">
                Schedule Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
