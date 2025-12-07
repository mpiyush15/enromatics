// Frontend SuperAdmin S3 usage dashboard component

'use client';

import { useState, useEffect } from 'react';

export type StorageReport = {
  tenantId: string;
  instituteName: string;
  plan: string;
  subscriptionStatus: string;
  usageGB: number;
  capGB: number | null;
  percentUsed: number;
  billingCycle: string;
};

export type StorageSummary = {
  totalTenants: number;
  totalUsageGB: number;
  totalCapGB: number | string;
  averageUsagePerTenant: number;
};

export default function StorageUsageReport() {
  const [report, setReport] = useState<StorageReport[]>([]);
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStorageReport();
  }, []);

  const fetchStorageReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/storage/report');
      if (!res.ok) throw new Error('Failed to fetch storage report');
      const data = await res.json();
      setSummary(data.summary);
      setReport(data.report || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>S3 Storage Usage Report</h1>
      <p style={{ fontSize: '12px', color: '#666' }}>Generated at {new Date().toLocaleString()}</p>

      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Tenants</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.totalTenants}</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Usage</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.totalUsageGB} GB</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Capacity</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {typeof summary.totalCapGB === 'number' ? `${summary.totalCapGB} GB` : 'Unlimited'}
            </div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Per Tenant</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.averageUsagePerTenant} GB</div>
          </div>
        </div>
      )}

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Institute Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Usage (GB)</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Cap (GB)</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>% Used</th>
          </tr>
        </thead>
        <tbody>
          {report.map((row) => (
            <tr key={row.tenantId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px' }}>{row.instituteName}</td>
              <td style={{ padding: '12px', textTransform: 'capitalize' }}>{row.plan}</td>
              <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                <span style={{
                  background: row.subscriptionStatus === 'active' ? '#d1fae5' : '#fed7aa',
                  color: row.subscriptionStatus === 'active' ? '#065f46' : '#92400e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  {row.subscriptionStatus}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{row.usageGB.toFixed(2)}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                {row.capGB ? row.capGB : '∞'}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <span style={{
                  background: row.percentUsed > 80 ? '#fee2e2' : row.percentUsed > 50 ? '#fef3c7' : '#dbeafe',
                  color: row.percentUsed > 80 ? '#991b1b' : row.percentUsed > 50 ? '#92400e' : '#1e40af',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {row.percentUsed}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '24px', fontSize: '12px', color: '#666' }}>
        <p>💡 Tip: Tenants using &gt;80% of their storage will see upgrade prompts in their portals.</p>
      </div>
    </div>
  );
}
