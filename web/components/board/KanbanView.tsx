'use client';
import React, { useState } from 'react';
import { Task } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import { Badge, STATUS_CONFIG, PRIORITY_CONFIG } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';

type Props = {
  tasks: Task[];
  members: any[];
  role: string;
  onTaskClick: (id: string) => void;
  onNewTask: () => void;
};

const COLUMNS = [
  { id: 'TODO', label: 'Todo', color: '#94a3b8' },
  { id: 'WORKING', label: 'Working', color: '#f59e0b' },
  { id: 'DONE', label: 'Done', color: '#10b981' },
];

export function KanbanView({ tasks, members, role, onTaskClick, onNewTask }: Props) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const isViewer = role === 'VIEWER';

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    if (isViewer) {
      e.preventDefault();
      return;
    }
    setDragTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Small transparent image to avoid big ghosting
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (isViewer) return;
    setDragOverCol(colId);
  };

  const onDragLeave = () => {
    setDragOverCol(null);
  };

  const onDrop = async (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (isViewer) return;
    setDragOverCol(null);
    if (!dragTaskId) return;

    // Optimistic / Actual DB update handled by parent realtime subscription, but we must update Supabase
    const supabase = createClient();
    await supabase.from('Task').update({ status: colId }).eq('id', dragTaskId);
    setDragTaskId(null);
  };

  return (
    <div className="h-full flex overflow-x-auto overflow-y-hidden p-6 gap-6 scrollbar-thin scrollbar-thumb-[#1e293b]">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const isDragOver = dragOverCol === col.id;

        return (
          <div 
            key={col.id}
            className={`flex flex-col flex-1 min-w-[320px] max-w-[400px] h-full bg-[#0a111e] rounded-xl border transition-all duration-300 ${isDragOver ? 'border-[#6366f1] shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[#1e293b]'}`}
            onDragOver={(e) => onDragOver(e, col.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, col.id)}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b] shrink-0 group">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: col.color }}></div>
                 <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">{col.label}</h3>
                 <span className="text-[11px] font-semibold text-[#64748b] bg-[#1e293b] px-2 py-0.5 rounded-full ml-1">
                   {colTasks.length}
                 </span>
               </div>
               {!isViewer && (
                 <button onClick={onNewTask} className="text-[#64748b] hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Add task">
                   +
                 </button>
               )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none relative">
              {isDragOver && (
                <div className="absolute inset-4 border-2 border-dashed border-[#6366f1] rounded-xl pointer-events-none z-10 opacity-30"></div>
              )}

              {colTasks.map(t => {
                const priority = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG];
                const status = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
                const isDragging = dragTaskId === t.id;

                return (
                  <div
                    key={t.id}
                    draggable={!isViewer}
                    onDragStart={(e) => onDragStart(e, t.id)}
                    onClick={() => onTaskClick(t.id)}
                    className={`bg-[#0d1628] rounded-xl border border-[#1e293b] p-4 cursor-grab hover:border-[#334155] hover:-translate-y-1 transition-all shadow-md relative group/card overflow-hidden ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
                  >
                    {/* Priority Stripe */}
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: priority.color, opacity: 0.8 }}></div>
                    
                    <h4 className="text-[13px] font-semibold text-[#e2e8f0] mb-3 leading-snug pr-6">{t.title}</h4>
                    
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                       <Badge label={status.label} color={status.color} bgColor={status.bg} dotColor={status.dot} />
                       {t.group && <span className="text-[10px] font-semibold text-[#94a3b8] bg-[#1e293b] px-2 py-0.5 rounded-full">{t.group}</span>}
                    </div>

                    {t.progress > 0 && (
                      <div className="mb-4">
                        <ProgressBar progress={t.progress} height={4} />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                       <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {t.assignee ? (
                            <>
                              <Avatar name={t.assignee.name} avatarUrl={t.assignee.avatarUrl} size={20} />
                              <span className="text-[11px] font-medium text-[#94a3b8] truncate">{t.assignee.name.split(' ')[0]}</span>
                            </>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-dashed border-[#475569] flex items-center justify-center text-[#475569] text-[10px]">?</div>
                          )}
                       </div>

                       {t.dueDate && (
                          <div className={`text-[11px] font-semibold flex items-center gap-1 ${t.status !== 'DONE' && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0)) ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                             📅 {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                       )}
                    </div>
                  </div>
                );
              })}

              {!isViewer && (
                <button onClick={onNewTask} className="mt-2 w-full h-10 rounded-xl border border-dashed border-[#334155] text-sm text-[#64748b] hover:text-[#e2e8f0] hover:border-[#6366f1] hover:bg-[#6366f110] transition-all font-semibold shrink-0">
                  + Add task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
