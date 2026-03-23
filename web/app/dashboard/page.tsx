'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { createClient } from '@/lib/supabase/client';
import { Task, Project } from '@/lib/supabase/queries';
import { Badge, STATUS_CONFIG, PRIORITY_CONFIG } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DashboardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      const supabase = createClient();
      
      // Fetch user's tasks
      const { data: tData } = await supabase.from('Task').select('*, project:Project(*)').eq('assigneeId', user.id).order('dueDate', { ascending: true });
      if (tData) setTasks(tData as any[]);

      // Recent Projects (last 5)
      const { data: pData } = await supabase.from('Project').select('*, workspace:Workspace(*), tasks:Task(progress)').order('createdAt', { ascending: false }).limit(5);
      if (pData) setProjects(pData as any[]);

      // Activity Chart data logic (last 7 days completed tasks)
      const { data: aData } = await supabase.from('ActivityLog').select('createdAt').eq('userId', user.id).ilike('action', '%Done%');
      const counts: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        counts[d.toISOString().split('T')[0]] = 0;
      }
      aData?.forEach(log => {
        const dateStr = log.createdAt.split('T')[0];
        if (counts[dateStr] !== undefined) counts[dateStr]++;
      });
      setActivityMap(counts);
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 animate-pulse">
        <div className="h-8 w-64 bg-[#1e293b] rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#1e293b] rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Stats calc
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'WORKING').length;
  const completed = tasks.filter(t => t.status === 'DONE').length;
  const overdue = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const dueSoonTasks = tasks.filter(t => t.status !== 'DONE').slice(0, 6);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-[800] text-white tracking-tight mb-2">{greeting}, {firstName} 👋</h1>
        <p className="text-[#94a3b8]">Here's an overview of your work</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon="✅" label="Total Tasks" count={totalTasks} color="#10b981" />
        <StatCard icon="⚡" label="In Progress" count={inProgress} color="#f59e0b" />
        <StatCard icon="🎯" label="Completed" count={completed} color="#6366f1" />
        <div className={`bg-[#0c1525] border ${overdue > 0 ? 'border-[#ef444450] shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-[#1e293b]'} rounded-2xl p-5 relative overflow-hidden flex items-center justify-between animate-fade-in-up`} style={{ animationDelay: '300ms' }}>
          <div>
            <p className="text-[#94a3b8] text-sm font-semibold mb-1">Overdue</p>
            <h3 className="text-3xl font-bold text-white">{overdue}</h3>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-[#ef4444] bg-opacity-10 text-[#ef4444]">⚠️</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-[#0c1525] border border-[#1e293b] rounded-2xl p-6 mb-10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-[14px] font-[600] text-white mb-6 tracking-wide">Activity this week</h3>
        <div className="h-[120px] flex items-end gap-2 sm:gap-4 md:gap-8">
          {Object.entries(activityMap).map(([date, count], i) => {
             const max = Math.max(...Object.values(activityMap), 5);
             const height = (count / max) * 100;
             const dateObj = new Date(date);
             return (
                <div key={date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                   <div className="w-full max-w-[40px] bg-gradient-to-t from-[#6366f140] to-[#8b5cf690] rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-125" style={{ height: `${height}%`, minHeight: '4px' }}></div>
                   <span className="text-[10px] text-[#475569] font-medium mt-2">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                   {/* Tooltip */}
                   <div className="absolute top-0 -translate-y-[150%] opacity-0 group-hover:opacity-100 bg-[#1e293b] text-white text-[11px] px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap">
                     {count} completed
                   </div>
                </div>
             );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Recent Projects */}
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-[600] text-white tracking-wide">Recent Projects</h3>
           </div>
           
           <div className="flex flex-col gap-3">
              {projects.length === 0 ? (
                <div className="bg-[#0c1525] border border-[#1e293b] border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl mb-2">📌</span>
                  <p className="text-[#94a3b8] text-sm">No projects yet — create one in any workspace</p>
                </div>
              ) : (
                projects.map(p => {
                  const avgProgress = p.tasks?.length ? p.tasks.reduce((acc: number, t: any) => acc + (t.progress||0), 0) / p.tasks.length : 0;
                  return (
                    <Link key={p.id} href={`/project/${p.id}`} className="bg-[#0c1525] border border-[#1e293b] rounded-xl p-4 flex flex-col hover:border-[#334155] hover:bg-[#0f1929] transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-xl shadow-inner">{p.emoji}</div>
                           <div>
                             <h4 className="font-semibold text-white text-[14px] mb-0.5 group-hover:text-[#818cf8] transition-colors">{p.name}</h4>
                             <p className="text-[11px] text-[#94a3b8]">{p.workspace?.name}</p>
                           </div>
                         </div>
                         <div className="text-[11px] text-[#475569] font-semibold bg-[#1e293b] px-2 py-1 rounded">
                           {p.tasks?.length || 0} tasks
                         </div>
                      </div>
                      <ProgressBar progress={avgProgress} height={6} showLabel />
                    </Link>
                  );
                })
              )}
           </div>
        </div>

        {/* My Tasks Due Soon */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-[600] text-white tracking-wide">My Tasks Due Soon</h3>
              <Link href="/mywork" className="text-[12px] text-[#818cf8] font-medium hover:underline">View all →</Link>
           </div>
           
           <div className="flex flex-col gap-2">
              {dueSoonTasks.length === 0 ? (
                <div className="bg-[#0c1525] border border-[#1e293b] border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl mb-2">🎉</span>
                  <p className="text-[#94a3b8] text-sm">Nothing due soon — you're all caught up!</p>
                </div>
              ) : (
                dueSoonTasks.map(t => {
                  const prio = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG];
                  const stat = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
                  const isOverdue = t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <Link key={t.id} href={`/project/${t.projectId}`} className="bg-[#0c1525] border border-[#1e293b] rounded-xl p-3 flex items-center gap-4 hover:border-[#334155] transition-colors relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: prio.color }}></div>
                      
                      <div className="flex-1 min-w-0 pl-1">
                        <h4 className="font-medium text-white text-[13px] truncate mb-1">{t.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[#94a3b8] text-[11px] truncate">{t.project?.name}</span>
                          <span className="text-[#475569] text-[10px]">•</span>
                          {t.dueDate && (
                             <span className={`text-[11px] ${isOverdue ? 'text-[#ef4444] font-semibold' : 'text-[#64748b]'}`}>
                               {isOverdue ? 'Overdue' : new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </span>
                          )}
                        </div>
                      </div>
                      
                      <Badge label={stat.label} color={stat.color} bgColor={stat.bg} dotColor={stat.dot} className="hidden sm:flex" />
                    </Link>
                  );
                })
              )}
           </div>
        </div>

      </div>

    </div>
  );
}

function StatCard({ icon, label, count, color }: { icon: string, label: string, count: number, color: string }) {
  return (
    <div className="bg-[#0c1525] border border-[#1e293b] rounded-2xl p-5 relative overflow-hidden flex items-center justify-between group hover:border-[#334155] transition-colors animate-fade-in-up">
      <div>
        <p className="text-[#94a3b8] text-sm font-semibold mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white">{count}</h3>
      </div>
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
    </div>
  );
}
