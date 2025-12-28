"use client";

import { useState } from "react";
import useSWR from "swr";

interface UserTypesData {
  summary: {
    newUsers: number;
    returningUsers: number;
    total: number;
    newPercent: number;
    returningPercent: number;
  };
  bySource: Array<{
    source: string;
    newUsers: number;
    returningUsers: number;
    newPercent: string;
    returningPercent: string;
  }>;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UserTypesCard() {
  const [timeRange, setTimeRange] = useState("today");
  const { data, isLoading, error } = useSWR<UserTypesData>(
    `/api/analytics/phase1/user-types?timeRange=${timeRange}`,
    fetcher
  );

  if (isLoading) return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-48"></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-lg">Error loading user types</div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">User Types</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-gray-600 text-sm mb-1">New Users</p>
          <p className="text-3xl font-bold text-blue-600">{data.summary.newUsers}</p>
          <p className="text-gray-600 text-xs mt-1">{data.summary.newPercent}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <p className="text-gray-600 text-sm mb-1">Returning</p>
          <p className="text-3xl font-bold text-purple-600">{data.summary.returningUsers}</p>
          <p className="text-gray-600 text-xs mt-1">{data.summary.returningPercent}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">By Traffic Source</h4>
        {data.bySource.slice(0, 5).map((s) => (
          <div key={s.source} className="flex items-center justify-between text-sm border-b pb-2">
            <span className="text-gray-600 capitalize">{s.source}</span>
            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {s.newPercent}% new
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                {s.returningPercent}% ret
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
