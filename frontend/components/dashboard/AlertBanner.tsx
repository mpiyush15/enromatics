"use client";

import Link from "next/link";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  actionUrl?: string;
  count?: number;
  severity?: string;
}

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Show top 3 alerts
  const topAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-2 mb-6">
      {topAlerts.map((alert) => (
        <Link key={alert.id} href={alert.actionUrl || "#"}>
          <div
            className={`
              backdrop-blur-md rounded-xl p-4 border transition-all cursor-pointer
              ${
                alert.type === "critical"
                  ? "bg-red-500/15 dark:bg-red-900/20 border-red-300/40 dark:border-red-700/40 hover:bg-red-500/25"
                  : alert.type === "warning"
                  ? "bg-amber-500/15 dark:bg-amber-900/20 border-amber-300/40 dark:border-amber-700/40 hover:bg-amber-500/25"
                  : "bg-blue-500/15 dark:bg-blue-900/20 border-blue-300/40 dark:border-blue-700/40 hover:bg-blue-500/25"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">
                {alert.type === "critical" ? "🔴" : alert.type === "warning" ? "🟡" : "🔵"}
              </span>
              <div className="flex-1">
                <p
                  className={`
                    font-semibold text-sm
                    ${
                      alert.type === "critical"
                        ? "text-red-700 dark:text-red-200"
                        : alert.type === "warning"
                        ? "text-amber-700 dark:text-amber-200"
                        : "text-blue-700 dark:text-blue-200"
                    }
                  `}
                >
                  {alert.message}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/20 dark:bg-white/10">
                {alert.count || 1}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
