"use client";

interface Recommendation {
  id: string;
  action: string;
  priority: string;
  message: string;
  expectedImpact: string;
  affectedCount: number;
  button?: {
    label: string;
    action: string;
  };
}

export default function AIInsightCard({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Show top 2 recommendations
  const topRecs = recommendations.slice(0, 2);

  return (
    <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-300/30 dark:border-purple-700/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">🧠</span>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Insights</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Smart recommendations for today</p>
        </div>
      </div>

      <div className="space-y-4">
        {topRecs.map((rec, idx) => (
          <div key={rec.id} className="bg-white/5 dark:bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {idx + 1}. {rec.message}
              </p>
              {rec.priority === "high" && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200">
                  HIGH
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              💡 {rec.expectedImpact}
            </p>
            {rec.button && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Action triggered:", rec.button?.action);
                }}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                {rec.button.label} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
