import React, { useState } from 'react';

// src/pages/GlassBox.tsx - Add exclusion management UI

export interface ExclusionRule {
  pattern: string | RegExp;
  description: string;
  isCaseSensitive?: boolean;
  enabled?: boolean;
}

export const GlassBox: React.FC = () => {
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [showExclusionManager, setShowExclusionManager] = useState(false);
  const data = true;

  const ExclusionManager: React.FC = () => {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 mb-6 border border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">📝 Exclusion Rules Manager</h2>
          <button 
            onClick={() => setShowExclusionManager(!showExclusionManager)}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white"
          >
            {showExclusionManager ? 'Hide' : 'Manage Exclusions'}
          </button>
        </div>
        
        {showExclusionManager && (
          <div className="space-y-4">
            {/* Add New Rule */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                value={newRulePattern}
                onChange={(e) => setNewRulePattern(e.target.value)}
                placeholder="Pattern (regex or text)"
                className="px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
              />
              <input
                type="text"
                value={newRuleDescription}
                onChange={(e) => setNewRuleDescription(e.target.value)}
                placeholder="Description"
                className="px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={() => {
                  // Add rule logic
                  if (newRulePattern && newRuleDescription) {
                    setExclusionRules([...exclusionRules, {
                      pattern: newRulePattern,
                      description: newRuleDescription,
                      enabled: true
                    }]);
                  }
                  setNewRulePattern('');
                  setNewRuleDescription('');
                }}
                className="px-4 py-2 bg-green-600 rounded-lg text-white"
              >
                Add Rule
              </button>
            </div>
            
            {/* Current Rules */}
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2">Pattern</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2">Status</th>
                    <th className="text-center py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map through rules */}
                  <tr className="border-b border-gray-700/50">
                    <td className="py-2 text-gray-300">DESIGN AND CONSTRUCTION</td>
                    <td className="py-2 text-gray-400">Project title</td>
                    <td className="py-2 text-center text-green-400">Enabled</td>
                    <td className="py-2 text-center">
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                  {exclusionRules.map((rule, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50">
                      <td className="py-2 text-gray-300">{rule.pattern.toString()}</td>
                      <td className="py-2 text-gray-400">{rule.description}</td>
                      <td className="py-2 text-center text-green-400">{rule.enabled ? 'Enabled' : 'Disabled'}</td>
                      <td className="py-2 text-center">
                        <button className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Glass Box Admin</h1>
      {data && <ExclusionManager />}
    </div>
  );
};
