'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/OnboardingWizard';

export default function OnboardingPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkTenantAuth();
  }, []);

  const checkTenantAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push('/login');
        return;
      }

      const user = await res.json();
      
      // Check if user has tenantId (is a tenant user) and is tenantAdmin
      if (!user.tenantId || (user.role !== 'tenantAdmin' && user.role !== 'SuperAdmin')) {
        setError('Access Denied: TenantAdmin privileges required');
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    } catch (err) {
      console.error('Auth check failed:', err);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#fee2e2',
        color: '#991b1b',
        borderRadius: '8px',
        margin: '20px',
      }}>
        <h2>⛔ {error}</h2>
        <p>Only TenantAdmin users can access this page.</p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#991b1b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Complete Your Onboarding</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Set up your institute branding, add classes, and get your portal ready to use.
      </p>
      <OnboardingWizard />
    </div>
  );
}
