"use client";

import Link from "next/link";

interface Alert {
  id?: string;
  type?: "critical" | "warning" | "info";
  message?: string;
  title?: string;
  description?: string;
  actionUrl?: string;
  count?: number;
  severity?: "critical" | "warning" | "info";
}

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Show top 3 alerts
  const topAlerts = alerts.slice(0, 3);

  const getAlertType = (alert: Alert) => {
    return alert.severity || alert.type || "info";
  };

  return (
    <div className="space-y-2 mb-6">
      {topAlerts.map((alert, idx) => {
        const alertType = getAlertType(alert);
        return (
          <Link key={alert.id || idx} href={alert.actionUrl || "#"}>
            <div
              className={`
                backdrop-blur-md rounded-xl p-4 border transition-all cursor-pointer
                ${
                  alertType === "critical"
                    ? "bg-red-500/15 dark:bg-red-900/20 border-red-300/40 dark:border-red-700/40 hover:bg-red-500/25"
                    : alertType === "warning"
                    ? "bg-amber-500/15 dark:bg-amber-900/20 border-amber-300/40 dark:border-amber-700/40 hover:bg-amber-500/25"
                    : "bg-blue-500/15 dark:bg-blue-900/20 border-blue-300/40 dark:border-blue-700/40 hover:bg-blue-500/25"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">
                  {alertType === "critical" ? "🔴" : alertType === "warning" ? "🟡" : "🔵"}
                </span>
                <div className="flex-1">
                  <p
                    className={`
                      font-semibold text-sm
                      ${
                        alertType === "critical"
                          ? "text-red-700 dark:text-red-200"
                          : alertType === "warning"
                          ? "text-amber-700 dark:text-amber-200"
                          : "text-blue-700 dark:text-blue-200"
                      }
                    `}
                  >
                    {alert.title || alert.message}
                  </p>
                  {alert.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {alert.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
