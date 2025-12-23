'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Student Layout with Role Guard
 * 
 * Protects all /dashboard/student/* routes
 * Only allows: student
 * Redirects others to /dashboard
 */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'student') {
      console.log('❌ Access denied to /dashboard/student for role:', user?.role);
      router.push('/dashboard');
    } else if (!loading && user) {
      console.log('✅ Access granted to /dashboard/student for role:', user.role);
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
  if (!user || user.role !== 'student') {
    return null;
  }

  // Render children for authorized users
  return <>{children}</>;
}
