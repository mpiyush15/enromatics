'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin Dashboard - Main entry point for admin users
 * Redirects to /dashboard/home (existing admin pages)
 */
export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to existing admin homepage
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
