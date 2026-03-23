/**
 * Student Dashboard - Main entry point for student users
 * Stays in student folder (no redirect)
 */
export default function StudentDashboard() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Welcome to Student Dashboard</h1>
        <p className="mt-4 text-gray-600">Your Learning Portal</p>
      </div>
    </div>
  );
}
