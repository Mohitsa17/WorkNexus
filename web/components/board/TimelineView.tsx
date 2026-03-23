'use client';
import React, { useMemo } from 'react';
import { Task } from '@/lib/supabase/queries';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';

type Props = {
  tasks: Task[];
  members: any[];
  role: string;
  onTaskClick: (id: string) => void;
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

export function TimelineView({ tasks, members, role, onTaskClick }: Props) {
  // Only tasks that have both start and due dates
  const timedTasks = tasks.filter(t => t.startDate && t.dueDate).sort((a,b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  // Generate grid logic
  const gridParams = useMemo(() => {
    if (timedTasks.length === 0) return null;
    
    let minT = new Date(timedTasks[0].startDate!).getTime();
    let maxT = new Date(timedTasks[0].dueDate!).getTime();

    timedTasks.forEach(t => {
      const s = new Date(t.startDate!).getTime();
      const d = new Date(t.dueDate!).getTime();
      if (s < minT) minT = s;
      if (d > maxT) maxT = d;
    });

    // Add padding (7 days before, 14 days after)
    minT -= 7 * 86400000;
    maxT += 14 * 86400000;

    const minDate = new Date(minT);
    const maxDate = new Date(maxT);
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000);

    const ds: Date[] = [];
    for(let i=0; i<totalDays; i++) {
       const d = new Date(minDate);
       d.setDate(minDate.getDate() + i);
       ds.push(d);
    }
    
    return { minDate, maxDate, ds, totalDays };
  }, [timedTasks]);

  if (!gridParams) {
    return (
      <EmptyState 
         icon="⏱️"
         title="No timeline data yet"
         description="Set start and due dates on your tasks and they will appear perfectly scheduled here."
      />
    );
  }

  const { ds, minDate } = gridParams;
  const CELL_WIDTH = 34; // px per day

  return (
    <div className="h-full flex overflow-hidden bg-[#0c1525]">
      {/* Left Panel: Task List */}
      <div className="w-[280px] shrink-0 border-r border-[#1e293b] flex flex-col font-sans bg-[#0c1525] z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
         <div className="h-12 border-b border-[#1e293b] flex items-center px-4 shrink-0 bg-[#080d18]">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Timeline Tasks</span>
         </div>
         <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pb-24">
            {timedTasks.map(t => (
              <div key={t.id} className="h-12 border-b border-[#1e293b] flex items-center px-4 hover:bg-[#0f1929] cursor-pointer transition-colors" onClick={() => onTaskClick(t.id)}>
                 {t.assignee ? <Avatar name={t.assignee.name} avatarUrl={t.assignee.avatarUrl} size={20} className="mr-2 shrink-0" /> : <div className="w-5 h-5 rounded-full bg-[#1e293b] border border-dashed border-[#475569] mr-2 shrink-0"></div>}
                 <span className={`text-[13px] font-semibold truncate ${t.status === 'DONE' ? 'text-[#64748b] line-through' : 'text-[#f1f5f9]'}`}>
                   {t.title}
                 </span>
              </div>
            ))}
         </div>
      </div>

      {/* Right Panel: Gantt Chart */}
      <div className="flex-1 overflow-auto flex flex-col scrollbar-thin scrollbar-thumb-[#1e293b] relative">
         <div className="flex">
            {/* Header Row */}
            <div className="sticky top-0 z-20 flex bg-[#080d18] border-b border-[#1e293b] shadow-sm select-none min-w-max h-12">
               {ds.map(d => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div key={d.toISOString()} className={`shrink-0 flex flex-col items-center justify-center border-r border-[#1e293b] transition-colors relative ${isWeekend ? 'bg-[#0f1525]' : 'bg-[#080d18]'}`} style={{ width: CELL_WIDTH }}>
                       {d.getDate() === 1 && <span className="absolute top-0 text-[10px] font-bold text-[#6366f1] leading-none whitespace-nowrap mt-1 -translate-x-1/2 left-0">{d.toLocaleDateString(undefined, {month:'short'})}</span>}
                       <span className={`text-[12px] font-bold mt-3 ${isToday ? 'text-[#ef4444]' : 'text-[#94a3b8]'}`}>{d.getDate()}</span>
                       {isToday && <div className="absolute bottom-0 w-full h-1 bg-[#ef4444] rounded-t-sm"></div>}
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Grid Body */}
         <div className="relative min-w-max flex-1 pb-24" style={{ width: ds.length * CELL_WIDTH }}>
            {/* Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
                {ds.map(d => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={d.toISOString()} className={`shrink-0 border-r border-[#1e293b] h-full ${isWeekend ? 'bg-[rgba(255,255,255,0.015)]' : ''} ${isToday ? 'bg-[rgba(239,68,68,0.05)] border-[#ef444450]' : ''}`} style={{ width: CELL_WIDTH }}></div>
                  );
                })}
            </div>

            {/* Task Bars */}
            {timedTasks.map((t, i) => {
               const color = COLORS[i % COLORS.length];
               const start = new Date(t.startDate!).getTime();
               const end = new Date(t.dueDate!).getTime();
               const offsetDays = (start - minDate.getTime()) / 86400000;
               const durationDays = Math.max((end - start) / 86400000 + 1, 1);
               
               const left = offsetDays * CELL_WIDTH;
               const width = durationDays * CELL_WIDTH;

               return (
                 <div key={t.id} className="h-12 border-b border-[#1e293b] relative group hover:bg-[#1e293b]/30">
                    <div 
                      className="absolute top-2.5 h-7 rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all group-hover:brightness-125 z-10"
                      style={{ 
                        left: `${left + 4}px`, 
                        width: `${width - 8}px`,
                        backgroundColor: `${color}40`,
                        borderColor: `${color}80`
                      }}
                      onClick={() => onTaskClick(t.id)}
                    >
                       <div className="absolute left-0 top-0 bottom-0 transition-all" style={{ width: `${t.progress || 0}%`, backgroundColor: `${color}90` }}></div>
                       <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white truncate drop-shadow-md z-20 pointer-events-none mix-blend-lighten">
                          {t.title}
                       </span>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>
    </div>
  );
}
