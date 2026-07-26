import React from 'react';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="p-8 font-sans max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Submissions</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Submission History</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-semibold">Assignment 1 - Final Draft.pdf</p>
              <p className="text-sm text-gray-500">Submitted: 2026-07-22</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Report Ready</span>
              <p className="text-sm text-gray-600 mt-1">Similarity: 12%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
