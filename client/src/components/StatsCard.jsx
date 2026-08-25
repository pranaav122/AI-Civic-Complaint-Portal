import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'civic', subtitle }) => {
  const colorMap = {
    civic: 'bg-civic-100 text-civic-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const trendIsPositive = trend && trend > 0;
  const trendIsNegative = trend && trend < 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && (
          <div className={clsx("p-2 rounded-lg", colorMap[color] || colorMap.civic)}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        {trend !== undefined && (
          <span className={clsx(
            "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
            trendIsPositive ? "text-green-700 bg-green-50" : 
            trendIsNegative ? "text-red-700 bg-red-50" : "text-gray-600 bg-gray-50"
          )}>
            {trendIsPositive ? <ArrowUpRight size={12} className="mr-0.5" /> : 
             trendIsNegative ? <ArrowDownRight size={12} className="mr-0.5" /> : null}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
};

export default StatsCard;
