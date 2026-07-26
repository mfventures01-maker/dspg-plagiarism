import React from 'react';

export const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">SuperAdmin AI Operations Console</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white shadow rounded-lg border-t-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">System Health</h3>
          <p className="text-2xl font-bold text-green-600">Operational</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border-t-4 border-indigo-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Total AI Calls</h3>
          <p className="text-2xl font-bold">1,245</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border-t-4 border-yellow-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Fallback Rate</h3>
          <p className="text-2xl font-bold">0.4%</p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg border-t-4 border-red-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Failure Rate</h3>
          <p className="text-2xl font-bold">0.02%</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Executions (Ledger)</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900">Execution ID</th>
              <th className="px-6 py-3 font-medium text-gray-900">Provider</th>
              <th className="px-6 py-3 font-medium text-gray-900">Status</th>
              <th className="px-6 py-3 font-medium text-gray-900">Latency</th>
              <th className="px-6 py-3 font-medium text-gray-900">Tokens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-gray-500" colSpan={5}>Ledger records will appear here in production...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
