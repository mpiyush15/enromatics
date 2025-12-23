'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      manager: 'Manager',
      accountant: 'Accountant',
      teacher: 'Teacher',
      marketing: 'Marketing',
      staff: 'Staff',
      employee: 'Employee',
      counsellor: 'Counsellor',
      adsManager: 'Ads Manager',
      student: 'Student',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <span className="text-4xl">👋</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xl text-gray-600">
              {getRoleDisplay(user?.role || '')}
            </p>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <p className="text-gray-700 text-lg">
              Use the sidebar to navigate through the application and access your modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
