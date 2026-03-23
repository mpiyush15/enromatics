'use client';

import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function StudentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role?.toLowerCase() === 'student') {
      // Redirect to student home or dashboard
      router.push('/app/student/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500">Redirecting to student dashboard...</p>
    </div>
  );
}
