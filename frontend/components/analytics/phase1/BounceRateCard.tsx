"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

interface BounceRateData {
  bounceRate: number;
  totalSessions: number;
  bouncedSessions: number;
  byDevice: Array<{ device: string; bounceRate: string; bounced: number; total: number }>;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BounceRateCard() {
  const [timeRange, setTimeRange] = useState("today");
  const { data, isLoading, error } = useSWR<BounceRateData>(
    `/api/analytics/phase1/bounce-rate?timeRange=${timeRange}`,
    fetcher
  );

  if (isLoading) return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-48"></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-lg">Error loading bounce rate</div>;
  if (!data) return null;

  const getBounceColor = (rate: number) => {
    if (rate < 30) return "text-green-600";
    if (rate < 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bounce Rate</h3>
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

      <div className="text-4xl font-bold mb-2">
        <span className={getBounceColor(data.bounceRate)}>{data.bounceRate}%</span>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        {data.bouncedSessions} of {data.totalSessions} sessions
      </p>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 text-sm">By Device</h4>
        {data.byDevice.map((d) => (
          <div key={d.device} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">{d.device}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${d.bounceRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{d.bounceRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
