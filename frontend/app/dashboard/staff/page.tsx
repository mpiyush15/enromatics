'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Staff Dashboard Entry Point
 * 
 * Staff users access the SAME dashboard as admins (with same sidebar)
 * Just redirects to /dashboard/home - sidebar will show role-based menu items
 */
export default function StaffDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect staff to main dashboard home
    // The sidebar will automatically show menu items based on their role permissions
    router.push('/dashboard/home');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
