/**
 * Admin Dashboard - Main entry point for superadmin users
 * Stays in superadmin folder (no redirect)
 */
import SuperAdminOverview from '../overview/page';

export default function AdminDashboard() {
  return <SuperAdminOverview />;
}
