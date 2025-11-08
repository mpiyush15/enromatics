

import { redirect } from "next/navigation";


export default function DashboardHome() {
  
    redirect("/dashboard/home");
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📋 Dashboard</h1>
      <p className="mb-4">Welcome to the admin dashboard! Here you can manage all your leads.</p>
      <p className="mb-4">Use the sidebar to navigate through different sections.</p>
    </div>
  );
}