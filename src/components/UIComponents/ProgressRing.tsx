import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  type?: 'originality' | 'ai' | 'plagiarism';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  label,
  type = 'originality'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Color mapping based on type and score
  const getColor = () => {
    if (type === 'originality') {
      if (percentage >= 80) return 'text-[#10b981]'; // Emerald (Safe)
      if (percentage >= 50) return 'text-[#f59e0b]'; // Amber (Moderate)
      return 'text-[#ef4444]'; // Red (High Risk)
    } else {
      // For AI and Plagiarism, lower is better!
      if (percentage <= 20) return 'text-[#10b981]'; // Emerald (Safe)
      if (percentage <= 50) return 'text-[#f59e0b]'; // Amber (Moderate)
      return 'text-[#ef4444]'; // Red (High Risk)
    }
  };

  const getGradientId = () => `grad-${type}-${percentage}`;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-slate-100"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Animated Foreground Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${getColor()} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            {percentage}%
          </span>
          {label && (
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
