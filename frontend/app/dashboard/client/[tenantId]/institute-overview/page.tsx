"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import { FaUsers, FaMoneyBillWave } from "react-icons/fa";
import useAuth from "@/hooks/useAuth";

export default function InstituteOverviewPage() {
  const { user } = useAuth();
  const { tenantId } = useParams();
  const [stats, setStats] = useState({ studentsCount: 0, totalRevenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return; // user is fetched via cookie/session
      console.log("Fetching overview stats for tenant:", tenantId);

      try {
        console.log("Making API request to fetch overview stats (cookies)...");
        const res = await fetch(`http://localhost:5050/api/dashboard/overview`, {
          credentials: "include", // send cookie set by backend
        });

        const data = await res.json();
        console.log("Received overview stats:", data);
        if (data.success) setStats(data.stats);
      } catch (error) {
        console.error("Error fetching overview stats:", error);
      }
    };

    fetchStats();
  }, [user, tenantId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Institute Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Students" value={stats.studentsCount} icon={<FaUsers />} color="border-blue-500" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={<FaMoneyBillWave />} color="border-green-500" />
      </div>
    </div>
  );
}
