'use client';
import React, { useState, useEffect, useRef, memo } from 'react';
import { Task } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import { Badge, STATUS_CONFIG, PRIORITY_CONFIG } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';

type Props = {
  task: Task;
  members: any[];
  role: string;
  onClick: () => void;
  color: string;
};

/* ── Tiny themed dropdown for table cells ─────────────────────── */
function CellMenu({ trigger, children, disabled }: { trigger: React.ReactNode; children: React.ReactNode; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center justify-center w-full h-full">
      <button
        onClick={e => { e.stopPropagation(); if (!disabled) setOpen(v => !v); }}
        className="flex items-center justify-center w-full h-full"
        disabled={disabled}
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-[100] mt-1 min-w-[130px] bg-[#0f1929] border border-[#334155] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] overflow-hidden py-1">
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  onClick: (e: any) => {
                    e.stopPropagation();
                    (child.props as any).onClick?.(e);
                    setOpen(false);
                  },
                })
              : child
          )}
        </div>
      )}
    </div>
  );
}

export const TaskRow = memo(function TaskRow({ task, members, role, onClick, color }: Props) {
  const isViewer = role === 'VIEWER';

  const updateField = async (field: string, value: any) => {
    if (isViewer) return;
    const supabase = createClient();
    await supabase.from('Task').update({ [field]: value }).eq('id', task.id);
  };

  const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
  const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];

  return (
    <div className="group h-[44px] flex items-center border-b border-[#1e293b] hover:bg-[#0d1628] transition-colors relative">
      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: color, opacity: 0.5 }} />

      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#475569] cursor-grab text-[14px]">⣿</div>

      {/* Checkbox */}
      <div className="w-[40px] shrink-0 text-center flex justify-center pl-2">
        <label className="flex items-center cursor-pointer" title={isViewer ? 'Read-only' : 'Mark done'}>
          <input
            type="checkbox"
            checked={task.status === 'DONE'}
            onChange={e => updateField('status', e.target.checked ? 'DONE' : 'TODO')}
            disabled={isViewer}
            className="peer sr-only"
          />
          <div className="w-4 h-4 rounded-[4px] border-2 border-[#334155] bg-[#050810] peer-checked:bg-[#10b981] peer-checked:border-[#10b981] transition-all flex items-center justify-center shadow-inner hover:border-[#6366f1]">
            <svg className="w-3 h-3 text-[#050810] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </label>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-[300px] flex items-center px-4 cursor-pointer" onClick={onClick}>
        <span className={`text-[13px] font-[500] truncate block w-full transition-colors ${task.status === 'DONE' ? 'text-[#64748b] line-through' : 'text-[#f1f5f9] group-hover:text-[#a5b4fc]'}`}>
          {task.title}
        </span>
      </div>

      {/* Status */}
      <div className="w-[120px] shrink-0 border-l border-r border-[#1e293b] border-opacity-50">
        <CellMenu disabled={isViewer} trigger={<Badge label={statusConfig.label} color={statusConfig.color} bgColor={statusConfig.bg} dotColor={statusConfig.dot} />}>
          {(['TODO', 'WORKING', 'DONE'] as const).map(s => {
            const c = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => updateField('status', s)} className="w-full px-3 py-2 hover:bg-[#1e293b] transition-colors text-left">
                <Badge label={c.label} color={c.color} bgColor={c.bg} dotColor={c.dot} />
              </button>
            );
          })}
        </CellMenu>
      </div>

      {/* Priority */}
      <div className="w-[110px] shrink-0 border-r border-[#1e293b] border-opacity-50">
        <CellMenu disabled={isViewer} trigger={<Badge label={priorityConfig.label} color={priorityConfig.color} bgColor={priorityConfig.bg} dotColor={priorityConfig.dot} />}>
          {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map(p => {
            const c = PRIORITY_CONFIG[p];
            return (
              <button key={p} onClick={() => updateField('priority', p)} className="w-full px-3 py-2 hover:bg-[#1e293b] transition-colors text-left">
                <Badge label={c.label} color={c.color} bgColor={c.bg} dotColor={c.dot} />
              </button>
            );
          })}
        </CellMenu>
      </div>

      {/* Assignee */}
      <div className="w-[140px] shrink-0 border-r border-[#1e293b] border-opacity-50">
        <CellMenu
          disabled={isViewer}
          trigger={
            task.assignee ? (
              <div className="flex items-center gap-2 px-3">
                <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size={22} />
                <span className="text-[12px] text-[#e2e8f0] truncate max-w-[70px]">{task.assignee.name.split(' ')[0]}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3">
                <div className="w-6 h-6 rounded-full border border-dashed border-[#475569] flex items-center justify-center text-[#475569] text-xs">?</div>
                <span className="text-[12px] text-[#475569]">Unassigned</span>
              </div>
            )
          }
        >
          <button onClick={() => updateField('assigneeId', null)} className="w-full px-3 py-2 text-xs text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors text-left">
            Unassigned
          </button>
          {members.map(m => (
            <button key={m.userId} onClick={() => updateField('assigneeId', m.userId)} className="w-full px-3 py-2 text-xs text-[#e2e8f0] hover:bg-[#1e293b] transition-colors flex items-center gap-2">
              <Avatar name={m.user?.name || '?'} avatarUrl={m.user?.avatarUrl} size={16} />
              {m.user?.name || m.user?.email}
            </button>
          ))}
        </CellMenu>
      </div>

      {/* Progress */}
      <div className="w-[150px] shrink-0 px-4 flex items-center gap-2 relative border-r border-[#1e293b] border-opacity-50 group/progress">
        <div className="flex-1">
          <ProgressBar progress={task.progress || 0} height={8} />
        </div>
        {!isViewer && (
          <input
            type="range" min="0" max="100" step="10"
            value={task.progress || 0}
            onChange={e => updateField('progress', parseInt(e.target.value, 10))}
            className="absolute inset-x-0 inset-y-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
        <span className="text-[11px] font-mono text-[#94a3b8] w-8 text-right hidden group-hover/progress:inline-block">{task.progress || 0}%</span>
      </div>

      {/* Start Date */}
      <div className="w-[110px] shrink-0 text-center px-2 relative font-mono text-[11px] text-[#cbd5e1] border-r border-[#1e293b] border-opacity-50 flex justify-center items-center">
        {!isViewer && (
          <input
            type="date"
            value={task.startDate ? task.startDate.split('T')[0] : ''}
            onChange={e => updateField('startDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
        {task.startDate ? new Date(task.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
      </div>

      {/* Due Date */}
      <div className="w-[110px] shrink-0 text-center px-2 relative font-mono text-[11px] flex justify-center items-center">
        {!isViewer && (
          <input
            type="date"
            value={task.dueDate ? task.dueDate.split('T')[0] : ''}
            onChange={e => updateField('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
        {task.dueDate ? (
          <span className={task.status !== 'DONE' && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-[#ef4444] font-bold' : 'text-[#cbd5e1]'}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        ) : '-'}
      </div>
    </div>
  );
});
