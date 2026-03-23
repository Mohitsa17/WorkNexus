'use client';
import React, { useState, useEffect, use } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getProject, getTasksForProject, getWorkspaceWithMembers, getUserRoleInWorkspace, Task } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { InviteModal } from '@/components/modals/InviteModal';
import { NewTaskModal } from '@/components/modals/NewTaskModal';
import { Avatar } from '@/components/ui/Avatar';
import dynamic from 'next/dynamic';

const TableView = dynamic(() => import('@/components/board/TableView').then(m => m.TableView), { ssr: false });
const KanbanView = dynamic(() => import('@/components/board/KanbanView').then(m => m.KanbanView), { ssr: false });
const TimelineView = dynamic(() => import('@/components/board/TimelineView').then(m => m.TimelineView), { ssr: false });
const TaskDrawer = dynamic(() => import('@/components/board/TaskDrawer').then(m => m.TaskDrawer), { ssr: false });

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { user } = useCurrentUser();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [role, setRole] = useState<string>('VIEWER');
  
  const [view, setView] = useState<'Table'|'Kanban'|'Timeline'>('Table');
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(true);

  const { error } = useToast();

  useEffect(() => {
    if (!user || !projectId) return;

    const load = async () => {
      try {
        const p = await getProject(projectId);
        if (!p) return;
        setProject(p);
        
        const [t, wRes, r] = await Promise.all([
          getTasksForProject(projectId),
          getWorkspaceWithMembers(p.workspaceId),
          getUserRoleInWorkspace(user.id, p.workspaceId)
        ]);
        
        setTasks(t as any);
        setMembers(wRes.members || []);
        setRole(r || 'VIEWER');
      } catch (err: any) {
        error('Error loading project');
      } finally {
        setLoading(false);
      }
    };
    load();

    const supabase = createClient();
    const ch = supabase.channel(`project-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Task', filter: `projectId=eq.${projectId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new as Task]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(ch); };
  }, [user, projectId, error]);

  const updateProjectName = async (newName: string) => {
    if (!newName.trim() || newName === project.name || role === 'VIEWER') return;
    setProject({ ...project, name: newName });
    const supabase = createClient();
    await supabase.from('Project').update({ name: newName }).eq('id', project.id);
  };

  if (loading || !project) {
    return (
      <div className="flex-1 h-screen flex flex-col pt-4">
        <div className="h-14 px-6 mb-4 flex gap-4 animate-pulse">
           <div className="w-8 h-8 rounded-lg bg-[#1e293b]"></div>
           <div className="w-48 h-8 rounded-lg bg-[#1e293b]"></div>
        </div>
        <div className="flex-1 bg-[#0c1525] border-t border-[#1e293b] p-6">
           <div className="space-y-4 animate-pulse">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-[#1e293b] rounded-lg"></div>)}
           </div>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050810]">
      {/* Top Bar */}
      <div className="h-16 border-b border-[#1e293b] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-xl shadow-inner hover:bg-[#334155] transition-colors" disabled={role === 'VIEWER'}>
            {project.emoji}
          </button>
          
          <div className="flex flex-col justify-center max-w-[300px]">
             <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-semibold tracking-wide uppercase">
               <span className="truncate">{project.workspace?.name}</span>
               <span>/</span>
             </div>
             <input 
               type="text" 
               defaultValue={project.name}
               onBlur={(e) => updateProjectName(e.target.value)}
               disabled={role === 'VIEWER'}
               className="bg-transparent text-lg font-bold text-white border-b border-transparent hover:border-[#334155] focus:border-[#6366f1] focus:outline-none truncate w-full transition-colors cursor-text disabled:cursor-default"
             />
          </div>
          
          <span className="ml-2 px-2 py-0.5 rounded bg-[#0f1929] text-[#94a3b8] text-[11px] font-bold border border-[#1e293b]">
            {tasks.length} tasks
          </span>

          <div className="ml-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${live ? 'bg-[#10b981] shadow-[#10b981]' : 'bg-[#ef4444] shadow-[#ef4444]'}`}></div>
            <span className="text-[10px] uppercase font-bold text-[#94a3b8]">{live ? 'Live' : 'Reconnecting...'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2">
            {members.slice(0, 4).map((m, i) => (
              <div key={m.userId} className="rounded-full border-2 border-[#050810] shadow-sm relative hover:z-10 transition-transform hover:-translate-y-1">
                <Avatar name={m.user?.name} avatarUrl={m.user?.avatarUrl} size={28} />
              </div>
            ))}
            {members.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-[#050810] bg-[#1e293b] text-[#94a3b8] text-[11px] font-bold flex items-center justify-center relative -ml-2 z-0">
                +{members.length - 4}
              </div>
            )}
          </div>
          
          {role === 'ADMIN' && (
            <button onClick={() => setShowInviteModal(true)} className="px-3 py-1.5 rounded-lg border border-[#334155] text-sm text-[#e2e8f0] font-semibold hover:bg-[#1e293b] hover:border-[#64748b] transition-all flex items-center gap-1.5 shadow-sm">
              <span className="text-[#818cf8]">+</span> Invite
            </button>
          )}

          <div className="h-6 w-[1px] bg-[#1e293b]"></div>

          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors">🔍</span>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 focus:w-64 bg-[#0c1525] border border-[#1e293b] rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all duration-300 shadow-inner"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="h-14 border-b border-[#1e293b] flex items-center justify-between px-6 shrink-0 bg-[#080d18] z-10 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-1 h-full">
           <button onClick={() => setView('Table')} className={`h-full px-4 flex items-center gap-2 border-b-2 transition-all ${view === 'Table' ? 'border-[#6366f1] text-[#a5b4fc] font-semibold bg-[linear-gradient(180deg,transparent_0%,rgba(99,102,241,0.1)_100%)]' : 'border-transparent text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}>
             ⊞ Table
           </button>
           <button onClick={() => setView('Kanban')} className={`h-full px-4 flex items-center gap-2 border-b-2 transition-all ${view === 'Kanban' ? 'border-[#6366f1] text-[#a5b4fc] font-semibold bg-[linear-gradient(180deg,transparent_0%,rgba(99,102,241,0.1)_100%)]' : 'border-transparent text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}>
             ⊟ Kanban
           </button>
           <button onClick={() => setView('Timeline')} className={`h-full px-4 flex items-center gap-2 border-b-2 transition-all ${view === 'Timeline' ? 'border-[#6366f1] text-[#a5b4fc] font-semibold bg-[linear-gradient(180deg,transparent_0%,rgba(99,102,241,0.1)_100%)]' : 'border-transparent text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}>
             ▬ Timeline
           </button>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-3 py-1.5 rounded-lg border border-[#334155] text-xs font-semibold text-[#94a3b8] hover:text-white hover:border-[#64748b] hover:bg-[#1e293b] transition-all hidden md:block">
             Group: Status
           </button>
           <button className="px-3 py-1.5 rounded-lg border border-[#334155] text-xs font-semibold text-[#94a3b8] hover:text-white hover:border-[#64748b] hover:bg-[#1e293b] transition-all hidden md:block">
             Filter
           </button>
           <button 
             onClick={() => setShowNewTaskModal(true)}
             disabled={role === 'VIEWER'}
             className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
           >
             + New Task
           </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0c1525]">
        {view === 'Table' && <TableView tasks={filteredTasks} members={members} role={role} onTaskClick={setFocusedTaskId} onNewTask={() => setShowNewTaskModal(true)} />}
        {view === 'Kanban' && <KanbanView tasks={filteredTasks} members={members} role={role} onTaskClick={setFocusedTaskId} onNewTask={() => setShowNewTaskModal(true)} />}
        {view === 'Timeline' && <TimelineView tasks={filteredTasks} members={members} role={role} onTaskClick={setFocusedTaskId} />}
        
        {/* Task Drawer overlay */}
        {focusedTaskId && (
          <div className="absolute inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setFocusedTaskId(null)}></div>
            <TaskDrawer taskId={focusedTaskId} members={members} role={role} onClose={() => setFocusedTaskId(null)} />
          </div>
        )}
      </div>

      {showInviteModal && <InviteModal workspaceId={project.workspaceId} workspaceName={project.workspace?.name} onClose={() => setShowInviteModal(false)} />}
      {showNewTaskModal && <NewTaskModal projectId={project.id} workspaceId={project.workspaceId} onClose={() => setShowNewTaskModal(false)} />}
    </div>
  );
}
