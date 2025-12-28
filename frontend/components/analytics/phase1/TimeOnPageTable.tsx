"use client";

import { useState } from "react";
import useSWR from "swr";

interface PageMetric {
  page: string;
  avgTimeOnPage: number;
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: number;
}

interface TimeOnPageData {
  pages: PageMetric[];
  totalPagesAnalyzed: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function TimeOnPageTable() {
  const [timeRange, setTimeRange] = useState("today");
  const { data, isLoading, error } = useSWR<TimeOnPageData>(
    `/api/analytics/phase1/time-on-page?timeRange=${timeRange}&limit=10`,
    fetcher
  );

  if (isLoading) return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-64"></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-lg">Error loading time on page</div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Time on Page</h3>
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Page</th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700">Avg Time</th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700">Views</th>
              <th className="text-right py-2 px-2 font-semibold text-gray-700">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.pages.map((page) => (
              <tr key={page.page} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 text-gray-900 truncate">{page.page}</td>
                <td className="text-right py-3 px-2 font-medium">{formatSeconds(page.avgTimeOnPage)}</td>
                <td className="text-right py-3 px-2">{page.totalViews}</td>
                <td className="text-right py-3 px-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      page.bounceRate < 30
                        ? "bg-green-100 text-green-800"
                        : page.bounceRate < 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {page.bounceRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
