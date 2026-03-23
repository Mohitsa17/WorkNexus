import React, { memo } from 'react';

type ProgressBarProps = {
  progress: number;
  height?: number;
  className?: string;
  showLabel?: boolean;
};

export const ProgressBar = memo(function ProgressBar({ progress, height = 6, className = '', showLabel = false }: ProgressBarProps) {
  const p = Math.max(0, Math.min(100, progress || 0));
  
  let color = '#6366f1'; // indigo
  if (p === 100) color = '#10b981'; // green
  else if (p <= 50) color = '#f59e0b'; // amber

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <div className="flex-1 bg-[#1e293b] rounded-full overflow-hidden" style={{ height }}>
        <div 
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${p}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[12px] font-medium text-[#94a3b8] w-8 text-right">{p}%</span>
      )}
    </div>
  );
});
