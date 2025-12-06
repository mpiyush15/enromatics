'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  change?: number;
  changeLabel?: string;
}

const colorClasses: Record<string, string> = {
  blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  green: 'border-green-500 bg-green-50 dark:bg-green-950',
  purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
  orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950'
};

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  change,
  changeLabel = 'change'
}: StatCardProps) {
  const isPositive = change && change >= 0;
  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-6 rounded-lg shadow-md bg-white dark:bg-gray-900 border-l-4 ${colorClass} hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h2>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-4xl text-gray-400 opacity-50">{icon}</div>}
      </div>
    </div>
  );
}
