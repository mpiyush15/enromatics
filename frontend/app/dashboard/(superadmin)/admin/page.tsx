/**
 * Admin Dashboard - Main entry point for superadmin users
 * Stays in superadmin folder (no redirect)
 */
export default function AdminDashboard() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Welcome to Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">SuperAdmin Control Panel</p>
      </div>
    </div>
  );
}
