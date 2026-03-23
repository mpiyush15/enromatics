'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Dashboard Root - Redirects to role-specific dashboard (3 system roles)
 * Routes use (role) groups for organization
 * 
 * Routes:
 * - SuperAdmin → /dashboard/(superadmin)/admin
 * - TenantAdmin → /dashboard/(tenantadmin)/home
 * - Student → /dashboard/(student)
 */
export default function DashboardRoot() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      console.log('🔄 Redirecting user based on role:', user.role);
      
      if (user.role?.toLowerCase() === 'superadmin') {
        console.log('✅ SuperAdmin - redirecting to /dashboard/admin');
        router.push('/dashboard/admin');
      } else if (user.role?.toLowerCase() === 'tenantadmin') {
        console.log('✅ TenantAdmin - redirecting to /dashboard/home');
        router.push('/dashboard/home');
      } else if (user.role?.toLowerCase() === 'student') {
        console.log('✅ Student - redirecting to /dashboard/student');
        router.push('/dashboard/student');
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