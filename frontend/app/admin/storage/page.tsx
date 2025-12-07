import StorageUsageReport from '@/components/admin/StorageUsageReport';

export default function StorageUsagePage() {
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
