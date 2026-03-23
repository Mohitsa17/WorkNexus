'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ToastProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useCurrentUser();
  const { workspaces, loading: wsLoading, refetch } = useWorkspaces(user?.id);
  const router = useRouter();
  const { success } = useToast();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    // Demo data creation for first-time user
    const checkAndCreateDemo = async () => {
      if (userLoading || wsLoading || !user) return;
      
      const hasChecked = localStorage.getItem('checked_demo');
      if (hasChecked === 'true') return;

      if (workspaces.length === 0) {
        localStorage.setItem('checked_demo', 'true');
        const supabase = createClient();
        
        // Setup Demo Workspace
        const newWorkspaceId = crypto.randomUUID();
        const { error: wError } = await supabase.from('Workspace').insert({ id: newWorkspaceId, name: 'Demo Workspace', color: '#10b981' });
        if (!wError) {
          await supabase.from('WorkspaceMember').insert({ userId: user.id, workspaceId: newWorkspaceId, role: 'ADMIN' });
          const { data: p } = await supabase.from('Project').insert({ name: 'Getting Started', emoji: '🚀', workspaceId: newWorkspaceId }).select().single();
          
          if (p) {
            // Setup default tasks
            const t1 = await supabase.from('Task').insert({ title: 'Welcome! Try changing a status ✅', status: 'TODO', priority: 'MEDIUM', group: 'Onboarding', dueDate: new Date(Date.now() + 7*86400000).toISOString(), assigneeId: user.id, projectId: p.id, progress: 0 }).select().single();
            await supabase.from('Task').insert({ title: 'Add a comment to this task 💬', status: 'TODO', priority: 'LOW', group: 'Onboarding', dueDate: new Date(Date.now() + 7*86400000).toISOString(), assigneeId: user.id, projectId: p.id, progress: 0 });
            await supabase.from('Task').insert({ title: 'Invite a team member 👥', status: 'TODO', priority: 'HIGH', group: 'Onboarding', dueDate: new Date(Date.now() + 14*86400000).toISOString(), assigneeId: user.id, projectId: p.id, progress: 0 });
            await supabase.from('Task').insert({ title: 'Create your first real project 🚀', status: 'TODO', priority: 'HIGH', group: 'Onboarding', dueDate: new Date(Date.now() + 14*86400000).toISOString(), assigneeId: user.id, projectId: p.id, progress: 0 });
            
            if (t1.data) {
              await supabase.from('Comment').insert({ text: 'Welcome to WorkNexus! 👋 \nThis is a sample comment. Click any task to open its details.', userId: user.id, taskId: t1.data.id });
              await supabase.from('ActivityLog').insert({ action: 'Task created', userId: user.id, taskId: t1.data.id });
            }
          }
          success('Demo workspace automatically created for you!');
          refetch(); // Reload sidebar data
        }
      } else {
        localStorage.setItem('checked_demo', 'true');
      }
    };
    
    checkAndCreateDemo();
  }, [userLoading, wsLoading, user, workspaces, refetch, success]);

  if (userLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050810]">
        <div className="w-12 h-12 border-4 border-[#1e293b] border-t-[#6366f1] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#050810] overflow-hidden text-[#f1f5f9] font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-auto bg-[#050810]">
        {children}
      </main>
    </div>
  );
}
