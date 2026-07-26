import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  status: string;
  stage: 'uploading' | 'searching' | 'analyzing' | 'generating';
}

const stageLabels = {
  uploading: 'Uploading document...',
  searching: 'Searching academic databases...',
  analyzing: 'Analyzing with AI...',
  generating: 'Generating report...',
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  status,
  stage,
}) => {
  // Determine color based on progress
  const getColor = () => {
    if (progress < 30) return 'bg-blue-600';
    if (progress < 60) return 'bg-indigo-600';
    if (progress < 90) return 'bg-purple-600';
    return 'bg-green-600';
  };

  // Determine stage icon
  const getStageIcon = () => {
    switch (stage) {
      case 'uploading': return '📤';
      case 'searching': return '🔍';
      case 'analyzing': return '🧠';
      case 'generating': return '📄';
      default: return '⏳';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{getStageIcon()}</span>
        <div>
          <p className="text-sm font-medium text-gray-700">{stageLabels[stage] || status}</p>
          <p className="text-xs text-gray-400">{status}</p>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${getColor()} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="mt-3 flex justify-between text-xs text-gray-400">
        <span>⬤ Upload</span>
        <span>⬤ Search</span>
        <span>⬤ Analyze</span>
        <span>⬤ Report</span>
      </div>
    </div>
  );
};