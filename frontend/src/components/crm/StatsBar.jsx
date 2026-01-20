import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Database } from 'lucide-react';
import { getTimelineStats } from '../../services/api';
import { formatNumber } from '../../utils/dateUtils';

const StatsBar = ({ dbName, collName }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [dbName, collName]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getTimelineStats(dbName, collName);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Leads',
      value: stats.total,
      icon: Database,
      color: 'blue'
    },
    {
      label: 'Today',
      value: stats.today,
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'This Week',
      value: stats.week,
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'This Month',
      value: stats.month,
      icon: Users,
      color: 'orange'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stat.value)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsBar;
