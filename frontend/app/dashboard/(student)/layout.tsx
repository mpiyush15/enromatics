'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Student Layout with Role Guard
 * Protects all /dashboard/(student)/* routes
 * Only allows: student
 * Redirects others to their respective dashboards
 */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.role?.toLowerCase();
      
      // Only students can access
      if (userRole === 'student') {
        console.log('✅ Student Access Granted');
        setIsAuthorized(true);
        return;
      }
      
      // SuperAdmin goes to superadmin dashboard
      if (userRole === 'superadmin') {
        console.log('❌ Access Denied - SuperAdmin should use /dashboard/admin');
        setIsAuthorized(false);
        router.push('/dashboard/admin');
        return;
      }
      
      // Tenant users go to tenant dashboard
      console.log('❌ Access Denied - Non-student users should use /dashboard/home');
      setIsAuthorized(false);
      router.push('/dashboard/home');
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

  // Show error for unauthorized users
  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Access Denied</div>
          <p className="text-gray-600 mt-2">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  // Block unauthorized users
  if (!user || user.role?.toLowerCase() !== 'student') {
    return null;
  }

  // Render children for authorized students
  return <>{children}</>;
}
