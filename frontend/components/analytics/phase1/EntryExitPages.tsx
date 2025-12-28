"use client";

import { useState } from "react";
import useSWR from "swr";

interface EntryExitPage {
  page: string;
  entries?: number;
  bounceRate?: number;
  avgSessionDuration?: number;
  exits?: number;
  uniqueVisitors?: number;
  avgTimeOnPage?: number;
}

interface EntryExitData {
  entryPages: EntryExitPage[];
  exitPages: EntryExitPage[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function EntryExitPages() {
  const [timeRange, setTimeRange] = useState("today");
  const { data, isLoading, error } = useSWR<EntryExitData>(
    `/api/analytics/phase1/entry-exit?timeRange=${timeRange}&limit=5`,
    fetcher
  );

  if (isLoading) return <div className="p-6 bg-gray-50 rounded-lg animate-pulse h-64"></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-lg">Error loading entry/exit pages</div>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Entry Pages */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Entry Pages</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>

        <div className="space-y-3">
          {data.entryPages.map((page) => (
            <div key={page.page} className="p-3 bg-blue-50 rounded">
              <p className="font-medium text-gray-900 text-sm truncate">{page.page}</p>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{page.entries} entries</span>
                <span>Bounce: {page.bounceRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exit Pages */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Pages</h3>

        <div className="space-y-3">
          {data.exitPages.map((page) => (
            <div key={page.page} className="p-3 bg-red-50 rounded">
              <p className="font-medium text-gray-900 text-sm truncate">{page.page}</p>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{page.exits} exits</span>
                <span>{page.uniqueVisitors} visitors</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
