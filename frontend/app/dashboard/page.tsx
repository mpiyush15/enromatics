'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Dashboard Root - Redirects to role-specific dashboard
 * 
 * Routes:
 * - SuperAdmin → /dashboard/tenants (or stays for now)
 * - Admin/TenantAdmin → /dashboard/admin
 * - Staff roles → /dashboard/staff
 * - Student → /dashboard/student
 */
export default function DashboardRoot() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      console.log('🔄 Redirecting user based on role:', user.role);
      
      if (user.role === 'SuperAdmin') {
        // SuperAdmin can stay at /dashboard or go to /dashboard/tenants
        console.log('✅ SuperAdmin - redirecting to /dashboard/home');
        router.push('/dashboard/home');
      } else if (user.role === 'admin' || user.role === 'tenantAdmin') {
        console.log('✅ Admin - redirecting to /dashboard/home');
        router.push('/dashboard/home'); // Admin uses main dashboard with sidebar
      } else if (['staff', 'employee', 'teacher', 'manager', 'counsellor', 'adsManager', 'accountant', 'marketing'].includes(user.role)) {
        console.log('✅ Staff - redirecting to /dashboard/home');
        router.push('/dashboard/home'); // Staff uses same dashboard with sidebar (role-based menu)
      } else if (user.role === 'student') {
        console.log('✅ Student - redirecting to /dashboard/student');
        router.push('/dashboard/student'); // Only students get separate portal
      } else {
        console.log('❌ Unknown role:', user.role);
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}