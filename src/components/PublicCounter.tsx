// src/components/PublicCounter.tsx
import React, { useState, useEffect } from 'react';

interface CounterStats {
  totalProjects: number;
  todayProjects: number;
  thisWeekProjects: number;
  thisMonthProjects: number;
  averageDaily: number;
  lastProjectTimestamp: string;
}

export const PublicCounter: React.FC = () => {
  const [stats, setStats] = useState<CounterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/counter/stats');
        if (response.ok) {
          const result = await response.json();
          setStats(result.data);
        } else {
          setError('Failed to load stats');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-32 mx-auto"></div>
        <div className="h-4 bg-gray-700 rounded w-48 mx-auto mt-2"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
        <div className="text-center text-gray-400 text-sm">📊 Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/80 to-green-700/80 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <div className="text-2xl font-bold text-white">
              {stats.totalProjects.toLocaleString()}
            </div>
            <div className="text-xs text-green-300">Total Projects Analyzed</div>
          </div>
        </div>

        <div className="flex gap-6 text-center">
          <div>
            <div className="text-lg font-semibold text-yellow-300">
              {stats.todayProjects}
            </div>
            <div className="text-xs text-gray-300">Today</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-300">
              {stats.thisWeekProjects}
            </div>
            <div className="text-xs text-gray-300">This Week</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-300">
              {stats.thisMonthProjects}
            </div>
            <div className="text-xs text-gray-300">This Month</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-300">
              {stats.averageDaily}
            </div>
            <div className="text-xs text-gray-300">Avg / Day</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-right">
          Last: {new Date(stats.lastProjectTimestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
