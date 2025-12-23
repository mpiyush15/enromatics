'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Admin Layout with Role Guard
 * 
 * Protects all /dashboard/admin/* routes
 * Only allows: admin, tenantAdmin, SuperAdmin
 * Redirects others to /dashboard
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const allowedRoles = ['admin', 'tenantAdmin', 'SuperAdmin'];
      if (!allowedRoles.includes(user.role)) {
        console.log('❌ Access denied to /dashboard/admin for role:', user.role);
        router.push('/dashboard');
      } else {
        console.log('✅ Access granted to /dashboard/admin for role:', user.role);
      }
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Block unauthorized users
  const allowedRoles = ['admin', 'tenantAdmin', 'SuperAdmin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // Render children for authorized users
  return <>{children}</>;
}
