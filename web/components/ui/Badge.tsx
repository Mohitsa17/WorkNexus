import React, { memo } from 'react';

type BadgeProps = {
  label: string;
  color: string;
  bgColor: string;
  dotColor?: string;
  className?: string;
  onClick?: () => void;
};

export const Badge = memo(function Badge({ label, color, bgColor, dotColor, className = '', onClick }: BadgeProps) {
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${onClick ? 'cursor-pointer hover:brightness-110' : ''} ${className}`}
      style={{ color, backgroundColor: bgColor }}
    >
      {dotColor && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }}></div>}
      {label}
    </div>
  );
});

// Helpers based on prompt schema
export const STATUS_CONFIG = {
  TODO: { label: 'Todo', color: '#94a3b8', bg: '#1e293b', dot: '#475569' },
  WORKING: { label: 'Working', color: '#60a5fa', bg: '#1e3a5f', dot: '#3b82f6' },
  DONE: { label: 'Done', color: '#34d399', bg: '#064e3b', dot: '#10b981' }
};

export const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#f87171', bg: '#450a0a', dot: '#f87171' },
  HIGH: { label: 'High', color: '#fb923c', bg: '#431407', dot: '#fb923c' },
  MEDIUM: { label: 'Medium', color: '#fbbf24', bg: '#451a03', dot: '#fbbf24' },
  LOW: { label: 'Low', color: '#94a3b8', bg: '#1e293b', dot: '#94a3b8' }
};
