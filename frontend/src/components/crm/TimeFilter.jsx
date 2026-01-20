import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const TimeFilter = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { value: '1h', label: 'Last Hour', icon: Clock },
    { value: '24h', label: 'Last 24 Hours', icon: Clock },
    { value: '7d', label: 'Last 7 Days', icon: Calendar },
    { value: '30d', label: 'Last 30 Days', icon: Calendar },
    { value: 'all', label: 'All Time', icon: Calendar }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => {
        const Icon = range.icon;
        const isActive = selectedRange === range.value;

        return (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            <Icon size={16} />
            <span>{range.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TimeFilter;
