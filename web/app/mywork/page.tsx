'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyTasks } from '@/hooks/useTasks';
import { Badge, STATUS_CONFIG, PRIORITY_CONFIG } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MyWorkPage() {
  const { user } = useCurrentUser();
  const [filter, setFilter] = useState<'All' | 'Todo' | 'Working' | 'Done' | 'Overdue'>('All');
  const { tasks, loading } = useMyTasks(user?.id);

  if (loading) {
    return <div className="p-8 bg-[#050810] min-h-screen"><div className="w-8 h-8 rounded-full border-2 border-[#1e293b] border-t-[#6366f1] animate-spin"></div></div>;
  }

  const today = new Date(new Date().setHours(0,0,0,0));

  let filteredTasks = tasks;
  if (filter === 'Todo') filteredTasks = tasks.filter(t => t.status === 'TODO');
  if (filter === 'Working') filteredTasks = tasks.filter(t => t.status === 'WORKING');
  if (filter === 'Done') filteredTasks = tasks.filter(t => t.status === 'DONE');
  if (filter === 'Overdue') filteredTasks = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < today);

  // Group by project
  const groups: Record<string, typeof filteredTasks> = {};
  filteredTasks.forEach(t => {
    const k = t.projectId;
    if (!groups[k]) groups[k] = [];
    groups[k].push(t);
  });
  
  const TABS = ['All', 'Todo', 'Working', 'Done', 'Overdue'] as const;

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen bg-[#050810]">
      <div className="mb-8">
        <h1 className="text-3xl font-[800] text-white tracking-tight mb-2">My Work</h1>
        <p className="text-[#94a3b8] text-base">All tasks assigned to you across every workspace</p>
      </div>

      <div className="flex items-center gap-3 mb-8 border-b border-[#1e293b] pb-4 overflow-x-auto scrollbar-none">
        {TABS.map(t => {
          let count = tasks.length;
          if (t === 'Todo') count = tasks.filter(x => x.status === 'TODO').length;
          if (t === 'Working') count = tasks.filter(x => x.status === 'WORKING').length;
          if (t === 'Done') count = tasks.filter(x => x.status === 'DONE').length;
          if (t === 'Overdue') count = tasks.filter(x => x.status !== 'DONE' && x.dueDate && new Date(x.dueDate) < today).length;

          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${filter === t ? 'bg-[#6366f1] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-[#0f1929] text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#e2e8f0]'}`}
            >
              {t} <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === t ? 'bg-white/20' : 'bg-[#1e293b]'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState 
          icon="📋" 
          title={filter === 'Overdue' ? '🎉 Nothing overdue!' : 'No tasks assigned'} 
          description={filter === 'Overdue' ? 'You are on top of it!' : 'No tasks match this filter. Take a break!'} 
        />
      ) : (
        <div className="flex flex-col gap-10">
          {Object.values(groups).map((projTasks, i) => {
            const proj = projTasks[0].project;
            return (
              <div key={proj?.id || i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl bg-[#1e293b] w-8 h-8 rounded-lg flex items-center justify-center">{proj?.emoji}</span>
                  <Link href={`/project/${proj?.id}`} className="text-lg font-bold text-white hover:text-[#818cf8] transition-colors">{proj?.name}</Link>
                  <span className="text-[12px] text-[#475569] font-semibold bg-[#0f1929] px-2 py-0.5 rounded-full ml-2">{projTasks.length}</span>
                </div>

                <div className="bg-[#0c1525] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
                  {projTasks.map((t, idx) => {
                    const status = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
                    const priority = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG];
                    const isOverdue = t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE';

                    return (
                      <div key={t.id} className={`group flex items-center p-3 sm:p-4 gap-3 md:gap-6 hover:bg-[#0f1929] transition-colors relative ${idx !== projTasks.length - 1 ? 'border-b border-[#1e293b]' : ''}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: priority.color }}></div>
                        
                        <div className="w-6 flex justify-center shrink-0 pl-1">
                           <div className="w-4 h-4 rounded-sm border-2 transition-colors cursor-pointer" style={{ borderColor: status.color, backgroundColor: t.status === 'DONE' ? status.color : 'transparent' }}>
                              {t.status === 'DONE' && <svg className="w-3 h-3 text-[#050810] m-auto mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                           </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <Link href={`/project/${t.projectId}`} className="flex-1 text-[#f1f5f9] text-[15px] font-semibold hover:text-[#818cf8] truncate transition-colors">
                            {t.status === 'DONE' ? <s className="text-[#64748b]">{t.title}</s> : t.title}
                          </Link>
                          
                          <div className="hidden lg:flex w-[180px]">
                            <ProgressBar progress={t.progress || 0} height={6} showLabel />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {t.dueDate && (
                             <div className={`text-[12px] whitespace-nowrap w-20 text-right ${isOverdue ? 'text-[#ef4444] font-bold' : new Date(t.dueDate).toDateString() === new Date().toDateString() ? 'text-[#f59e0b] font-semibold' : 'text-[#64748b]'}`}>
                               {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </div>
                          )}
                          <div className="hidden sm:block">
                            <Badge label={status.label} color={status.color} bgColor={status.bg} dotColor={status.dot} />
                          </div>
                          <div className="hidden md:block">
                            <Badge label={priority.label} color={priority.color} bgColor={priority.bg} dotColor={priority.dot} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
