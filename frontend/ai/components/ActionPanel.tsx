"use client";

import Link from "next/link";

interface DailyAction {
  priority: "high" | "medium" | "low";
  icon?: string;
  title?: string;
  task?: string;
  type?: string;
  time?: string;
  description?: string;
  action?: string;
  actionUrl?: string;
}

export default function ActionPanel({ actions }: { actions: DailyAction[] }) {
  if (!actions || actions.length === 0) {
    return null;
  }

  const getActionIcon = (action: DailyAction) => {
    if (action.icon) return action.icon;
    if (action.type === "collection") return "💰";
    if (action.type === "followup") return "📞";
    if (action.type === "attendance") return "✓";
    return "📋";
  };

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-white/10 border border-gray-200/30 dark:border-white/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Today's Actions
        </h3>
      </div>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <Link key={idx} href={action.actionUrl || "#"}>
            <div
              className={`
                flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${
                  action.priority === "high"
                    ? "bg-red-50/50 dark:bg-red-900/10 border-red-200/30 dark:border-red-700/30 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                    : action.priority === "medium"
                    ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/30 dark:border-amber-700/30 hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                    : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/30 dark:border-blue-700/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/20"
                }
              `}
            >
              <span className="text-xl">{getActionIcon(action)}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {action.title || action.task || "Action"}
                </p>
                {action.time && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    ⏰ {action.time}
                  </p>
                )}
                {action.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                )}
              </div>
              {action.priority === "high" && (
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
