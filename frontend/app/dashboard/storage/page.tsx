'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StorageUsageReport from '@/components/admin/StorageUsageReport';

export default function StorageUsagePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSuperAdminAccess();
  }, []);

  const checkSuperAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found in localStorage');
        router.push('/login');
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include', // Include cookies as fallback
      });

      if (!res.ok) {
        console.log('❌ Auth endpoint returned:', res.status);
        router.push('/login');
        return;
      }

      const user = await res.json();
      console.log('👤 User data received:', { email: user.email, role: user.role });
      
      // Check if user is SuperAdmin (case-insensitive)
      if (!user.role || user.role.toLowerCase() !== 'superadmin') {
        console.log('❌ User role is:', user.role, '| Expected: SuperAdmin');
        setError(`Access Denied: SuperAdmin privileges required. Your role: ${user.role}`);
        setLoading(false);
        return;
      }

      console.log('✅ SuperAdmin access granted for:', user.email);
      setIsAuthorized(true);
      setLoading(false);
    } catch (err) {
      console.error('❌ Auth check failed:', err);
      setError('Authentication failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
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
        <p>Only SuperAdmin users can access this page.</p>
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
    <div style={{ padding: '20px' }}>
      <h1>S3 Storage Usage Report</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Monitor storage usage across all tenants for billing and capacity planning
      </p>
      <StorageUsageReport />
    </div>
  );
}
