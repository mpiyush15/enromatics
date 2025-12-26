"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SubscriptionPlansRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main plans page
    router.push('/plans');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting to pricing page...</p>
      </div>
    </div>
  );
}
