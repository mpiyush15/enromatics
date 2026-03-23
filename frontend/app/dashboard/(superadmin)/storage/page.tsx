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
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        router.push('/login');
        return;
      }

      // Try to access the storage report endpoint - if it fails, user doesn't have access
      const res = await fetch('/api/storage/report', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        // User is authenticated but not SuperAdmin
        setError('Access Denied: SuperAdmin privileges required');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Other auth errors - redirect to login
        console.log('❌ Access check failed:', res.status);
        router.push('/login');
        return;
      }

      console.log('✅ SuperAdmin access granted');
      setIsAuthorized(true);
      setLoading(false);
    } catch (err) {
      console.error('❌ Access check failed:', err);
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
