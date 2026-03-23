import React from 'react';

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string | null;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, actionLabel, onAction, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center h-full w-full ${className}`}>
      <div className="text-[48px] mb-4 drop-shadow-lg">{icon}</div>
      <h3 className="text-white text-[16px] font-[600] mb-2">{title}</h3>
      <p className="text-[#94a3b8] text-[14px] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-4 py-2 border border-[#6366f1] text-[#6366f1] rounded-lg text-[13px] font-[600] hover:bg-[#6366f1] hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
