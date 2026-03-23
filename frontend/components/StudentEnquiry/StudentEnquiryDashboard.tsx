'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, BarChart3 } from 'lucide-react';
import { EnquiryCard } from './EnquiryCard';
import { StatsCard } from './StatsCard';
import { FilterPanel } from './FilterPanel';
import { useAllEnquiries, useEnquiryStats } from '@/hooks/useEnquiry';

interface Enquiry {
  _id?: string;
  id?: string;
  name?: string;
  studentName?: string;
  email: string;
  phone: string;
  courseInterest?: string;
  course?: string;
  status: 'new' | 'contacted' | 'interested' | 'enrolled' | 'rejected';
  enquiryDate?: string;
  createdAt?: string;
  notes?: string;
  message?: string;
  location?: string;
}

const mockEnquiries: Enquiry[] = [
  {
    _id: '1',
    studentName: 'Arjun Sharma',
    email: 'arjun@example.com',
    phone: '+91 98765 43210',
    course: 'Advanced Web Development',
    status: 'new',
    enquiryDate: '2 hours ago',
    message: 'Interested in learning React and Node.js with hands-on projects...',
    location: 'Mumbai',
  },
  {
    _id: '2',
    studentName: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 87654 32109',
    course: 'UI/UX Design Masterclass',
    status: 'interested',
    enquiryDate: '5 hours ago',
    message: 'Want to switch career from graphic design to UX design...',
    location: 'Bangalore',
  },
  {
    _id: '3',
    studentName: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 76543 21098',
    course: 'Data Science Bootcamp',
    status: 'contacted',
    enquiryDate: '1 day ago',
    message: 'Looking for a comprehensive data science program with ML...',
    location: 'Delhi',
  },
  {
    _id: '4',
    studentName: 'Sneha Gupta',
    email: 'sneha@example.com',
    phone: '+91 65432 10987',
    course: 'Advanced Web Development',
    status: 'enrolled',
    enquiryDate: '3 days ago',
    message: 'Enrolled and excited to start the journey in web development...',
    location: 'Pune',
  },
  {
    _id: '5',
    studentName: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 54321 09876',
    course: 'Mobile App Development',
    status: 'new',
    enquiryDate: '4 hours ago',
    message: 'Want to learn Flutter and create cross-platform apps...',
    location: 'Hyderabad',
  },
];

export const StudentEnquiryDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch real enquiry data from backend
  const { data: apiEnquiries, loading } = useAllEnquiries(selectedStatus);
  const { data: statsData } = useEnquiryStats();

  // Normalize enquiry data from API
  const enquiries = useMemo(() => {
    return (apiEnquiries || mockEnquiries).map((e: any) => ({
      ...e,
      _id: e._id || e.id,
      studentName: e.name || e.studentName,
      course: e.courseInterest || e.course,
      enquiryDate: e.createdAt || e.enquiryDate,
      message: e.notes || e.message,
    }));
  }, [apiEnquiries]);

  // Filter enquiries by search
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry: Enquiry) => {
      const name = enquiry.studentName || '';
      const email = enquiry.email || '';
      const course = enquiry.course || '';
      
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [enquiries, searchQuery]);

  // Use real stats from API or fallback to mock data
  const stats = useMemo(() => {
    if (statsData?.byStatus) {
      return {
        total: statsData.total || 0,
        new: statsData.byStatus.new || 0,
        enrolled: statsData.byStatus.enrolled || 0,
        conversion: statsData.conversionRate || 0,
      };
    }
    return {
      total: enquiries.length,
      new: enquiries.filter((e: Enquiry) => e.status === 'new').length,
      enrolled: enquiries.filter((e: Enquiry) => e.status === 'enrolled').length,
      conversion: enquiries.length > 0 
        ? Math.round((enquiries.filter((e: Enquiry) => e.status === 'enrolled').length / enquiries.length) * 100)
        : 0,
    };
  }, [statsData, enquiries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Title & Actions */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Student Enquiries
                </h1>
                <p className="text-gray-600 mt-2">Manage and track all student enquiries in one place</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
                <Plus className="w-4 h-4" />
                New Enquiry
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading enquiries...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Total Enquiries"
              value={stats.total}
              icon={<BarChart3 className="w-5 h-5" />}
              color="blue"
            />
            <StatsCard
              label="New Leads"
              value={stats.new}
              icon={<BarChart3 className="w-5 h-5" />}
              color="yellow"
            />
            <StatsCard
              label="Enrollments"
              value={stats.enrolled}
              icon={<BarChart3 className="w-5 h-5" />}
              color="green"
            />
            <StatsCard
              label="Conversion Rate"
              value={`${stats.conversion}%`}
              icon={<BarChart3 className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
          )}

          {/* Enquiries Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {filteredEnquiries.length} Enquiries Found
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEnquiries.map((enquiry) => (
                <EnquiryCard key={enquiry.id} {...enquiry} />
              ))}
            </div>

            {filteredEnquiries.length === 0 && (
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-gray-200/50">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">No enquiries found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
