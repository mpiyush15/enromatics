"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 border-l-4 ${color || "border-blue-500"}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h2>
        </div>
        {icon && <div className="text-3xl text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
