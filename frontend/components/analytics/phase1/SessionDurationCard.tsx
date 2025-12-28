"use client";

import { useState } from "react";
import useSWR from "swr";

interface SessionData {
  avgDuration: number;
  totalSessions: number;
  medianDuration: number;
  minDuration: number;
  maxDuration: number;
  byDevice: Array<{ device: string; avgDuration: number; totalSessions: number }>;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function SessionDurationCard() {
  const [timeRange, setTimeRange] = useState("today");
  const { data, isLoading, error } = useSWR<SessionData>(
    `/api/analytics/phase1/session-duration?timeRange=${timeRange}`,
    fetcher
  );

  if (isLoading) return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-48"></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-lg">Error loading session duration</div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Duration</h3>
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

      <div className="text-4xl font-bold text-blue-600 mb-2">{formatSeconds(data.avgDuration)}</div>
      <p className="text-gray-600 text-sm mb-6">Average time per session</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-gray-600 text-xs uppercase">Median</p>
          <p className="text-lg font-semibold">{formatSeconds(data.medianDuration)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase">Min</p>
          <p className="text-lg font-semibold">{formatSeconds(data.minDuration)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase">Max</p>
          <p className="text-lg font-semibold">{formatSeconds(data.maxDuration)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 text-sm">By Device</h4>
        {data.byDevice.map((d) => (
          <div key={d.device} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 capitalize">{d.device}</span>
            <span className="font-medium">{formatSeconds(d.avgDuration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
