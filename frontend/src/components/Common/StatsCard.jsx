import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary', loading }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600'
  };

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 dark:bg-dark-700 rounded w-24"></div>
          <div className="h-12 w-12 bg-gray-200 dark:bg-dark-700 rounded-xl"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`p-3 bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend && (
          <div className="flex items-center gap-1">
            {trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;