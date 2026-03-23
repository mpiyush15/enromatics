'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * TenantAdmin Layout with Role Guard
 * Protects all /dashboard/(tenantadmin)/* routes
 * Only allows: tenantadmin, manager, accountant, teacher, staff, etc. (tenant users)
 */
export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.role?.toLowerCase();
      
      // Superadmin can't access tenant pages
      if (userRole === 'superadmin') {
        console.log('❌ Access Denied - SuperAdmin cannot access tenant pages');
        setIsAuthorized(false);
        router.push('/dashboard/admin');
        return;
      }
      
      // Students go to student portal
      if (userRole === 'student') {
        console.log('❌ Access Denied - Students should use /student/dashboard');
        setIsAuthorized(false);
        router.push('/student/dashboard');
        return;
      }
      
      // All other roles (tenantadmin, manager, teacher, staff, etc.) are allowed
      console.log('✅ Tenant User Access Granted:', userRole);
      setIsAuthorized(true);
    }
  }, [user, loading, router]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">Access Denied - Please log in</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold mb-2">❌ Access Denied</p>
          <p className="text-gray-600 mb-4">You don't have permission to access this area</p>
          <p className="text-gray-500 text-sm">Your role: <span className="font-mono">{user.role}</span></p>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block">
            Back to Dashboard →
          </a>
        </div>
      </div>
    );
  }

  // Only render children if explicitly authorized
  if (isAuthorized === true) {
    return <>{children}</>;
  }

  // Default loading state while determining authorization
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying access...</p>
      </div>
    </div>
  );
}
