'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Staff Layout with Role Guard
 * 
 * Protects all /dashboard/staff/* routes
 * Only allows: staff, employee, teacher, manager, counsellor, adsManager, accountant, marketing
 * 
 * NOTE: This layout ONLY provides role validation.
 * The actual sidebar and layout come from the parent /dashboard/layout.tsx
 * Staff users see the SAME sidebar as admins, just with role-based permissions.
 */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const allowedRoles = ['staff', 'employee', 'teacher', 'manager', 'counsellor', 'adsManager', 'accountant', 'marketing'];
      if (!allowedRoles.includes(user.role)) {
        console.log('❌ Access denied to /dashboard/staff for role:', user.role);
        router.push('/dashboard');
      } else {
        console.log('✅ Access granted to /dashboard/staff for role:', user.role);
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
  const allowedRoles = ['staff', 'employee', 'teacher', 'manager', 'counsellor', 'adsManager', 'accountant', 'marketing'];
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // Render children WITHOUT any custom layout
  // The parent /dashboard/layout.tsx handles the sidebar
  return <>{children}</>;
}
