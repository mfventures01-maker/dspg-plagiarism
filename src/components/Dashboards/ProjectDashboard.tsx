import React from 'react';

export const ProjectDashboard: React.FC = () => {
  return (
    <div className="p-8 font-sans max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Project Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Project Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-semibold">Jane Doe</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supervisor</p>
              <p className="font-semibold">Dr. Smith</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Institution</p>
              <p className="font-semibold">University of Oroh</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Faculty</p>
              <p className="font-semibold">Computer Science</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-indigo-500">
          <h2 className="text-xl font-bold mb-4">Analysis Status</h2>
          <p className="text-3xl font-bold text-green-600 mb-2">Certified</p>
          <p className="text-sm text-gray-600">Provider: Gemini</p>
          <p className="text-sm text-gray-600">Tokens: 4,230</p>
        </div>
      </div>
    </div>
  );
};
