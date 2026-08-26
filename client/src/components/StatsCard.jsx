import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    civic: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    yellow: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const currentStyle = colorMap[color] || colorMap.blue;
  const trendIsPositive = trend && trend > 0;
  const trendIsNegative = trend && trend < 0;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-medium text-gray-500 line-clamp-1">{title}</span>
        {Icon && (
          <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", currentStyle)}>
            <Icon size={20} className="shrink-0" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{value}</h2>
        {trend !== undefined && (
          <span className={clsx(
            "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
            trendIsPositive ? "text-emerald-700 bg-emerald-50" : 
            trendIsNegative ? "text-rose-700 bg-rose-50" : "text-gray-600 bg-gray-50"
          )}>
            {trendIsPositive ? <ArrowUpRight size={12} className="mr-0.5 shrink-0" /> : 
             trendIsNegative ? <ArrowDownRight size={12} className="mr-0.5 shrink-0" /> : null}
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
