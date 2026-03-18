import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200/50',
    icon: 'text-blue-600',
    text: 'text-blue-700',
    trend: 'text-blue-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200/50',
    icon: 'text-yellow-600',
    text: 'text-yellow-700',
    trend: 'text-yellow-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200/50',
    icon: 'text-green-600',
    text: 'text-green-700',
    trend: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200/50',
    icon: 'text-purple-600',
    text: 'text-purple-700',
    trend: 'text-purple-600',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  const config = colorConfig[color];

  return (
    <div
      className={`relative ${config.bg} border ${config.border} rounded-2xl p-6 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`${config.icon} opacity-60 group-hover:opacity-100 transition-opacity`}>
            {icon}
          </span>
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${config.text} bg-white bg-opacity-50`}>
            +12%
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>

        <p className={`text-xs font-medium ${config.trend}`}>
          ↑ Up from last month
        </p>
      </div>
    </div>
  );
};
