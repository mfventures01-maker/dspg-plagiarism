import React from 'react';

interface ProviderMetric {
  name: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  retrieved: number;
  accepted: number;
  rejected: number;
  time: number;
}

interface ProviderStatusProps {
  metrics: ProviderMetric[];
}

export const ProviderStatus: React.FC<ProviderStatusProps> = ({ metrics }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return '✅';
      case 'FAILED': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="provider-status-dashboard">
      <h3 className="text-lg font-semibold mb-3">🔍 Provider Search Results</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{metric.name}</span>
              <span className={`text-lg ${getStatusColor(metric.status)}`}>
                {getStatusIcon(metric.status)}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{metric.retrieved}</span>
              <span className="text-gray-500 text-sm ml-1">papers</span>
            </div>
            <div className="text-xs text-gray-400">
              {metric.time}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
