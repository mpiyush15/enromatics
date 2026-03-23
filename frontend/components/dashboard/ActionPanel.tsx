"use client";

interface DailyAction {
  priority: "high" | "medium" | "low";
  icon: string;
  title: string;
  time?: string;
  description?: string;
  action: string;
}

export default function ActionPanel({ actions }: { actions: DailyAction[] }) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-white/10 border border-gray-200/30 dark:border-white/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Actions</h3>
      </div>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className={`
              flex items-start gap-3 p-3 rounded-lg border
              ${
                action.priority === "high"
                  ? "bg-red-50/50 dark:bg-red-900/10 border-red-200/30 dark:border-red-700/30"
                  : action.priority === "medium"
                  ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/30 dark:border-amber-700/30"
                  : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/30 dark:border-blue-700/30"
              }
            `}
          >
            <span className="text-xl">{action.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {action.title}
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
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
