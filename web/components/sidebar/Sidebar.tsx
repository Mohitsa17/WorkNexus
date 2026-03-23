'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WorkspaceItem } from './WorkspaceItem';
import { NewWorkspaceModal } from '../modals/NewWorkspaceModal';
import { Avatar } from '../ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import { getUnreadCount } from '@/lib/supabase/queries';
import { NewProjectModal } from '../modals/NewProjectModal';

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { user } = useCurrentUser();
  const { workspaces, refetch } = useWorkspaces(user?.id);
  const pathname = usePathname();
  const router = useRouter();
  
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      getUnreadCount(user.id).then(setUnreadCount);
      // Supabase realtime for notifications could go here, omitting for brevity
    }
  }, [user?.id]);

  const toggleSidebar = () => setExpanded(!expanded);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Home', icon: '⊞', href: '/dashboard' },
    { label: 'Inbox', icon: '🔔', href: '/inbox', badge: unreadCount > 0 ? unreadCount : null },
    { label: 'My Work', icon: '◉', href: '/mywork' },
  ];

  return (
    <>
      <div 
        className="relative h-screen bg-[#050810] border-r border-[#1e293b] flex flex-col shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-[width] !border-r"
        style={{ width: expanded ? 260 : 64 }}
      >
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1e293b] border border-[#334155] rounded-full flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#334155] hover:scale-110 transition-all z-50 shadow-md"
        >
          {expanded ? '‹' : '›'}
        </button>

        {/* Logo Header */}
        <Link href="/dashboard" className="h-16 flex items-center px-4 gap-3 border-b border-[#1e293b] overflow-hidden shrink-0 hover:bg-[#0f1929] transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0">
            ⬡
          </div>
          <span className={`text-[18px] font-[800] text-white tracking-tight whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            WorkNexus
          </span>
        </Link>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#1e293b] py-4 flex flex-col gap-6">
          
          {/* Main Nav */}
          <div className="px-2 flex flex-col gap-1">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="group relative" title={!expanded ? item.label : undefined}>
                  <div className={`flex items-center h-10 px-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-[#6366f115] text-[#a5b4fc] font-semibold' : 'text-[#94a3b8] hover:bg-[#0f1929] hover:text-[#e2e8f0]'}`}>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#6366f1] rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
                    <div className="w-6 flex justify-center text-lg">{item.icon}</div>
                    <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                      {item.label}
                    </span>
                    {item.badge && expanded && (
                      <div className="ml-auto bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        {item.badge}
                      </div>
                    )}
                    {item.badge && !expanded && (
                      <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="h-[1px] bg-[#0f1929] mx-4 shrink-0"></div>

          {/* Workspaces List */}
          <div className="flex-1 px-2 flex flex-col">
            {expanded && (
              <div className="px-3 mb-2 flex items-center justify-between group">
                <span className="text-[10px] uppercase text-[#475569] font-bold tracking-[0.5px]">Workspaces</span>
                <button onClick={() => setShowNewWorkspace(true)} className="text-[#94a3b8] hover:text-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity">+</button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {workspaces.map(w => (
                <WorkspaceItem key={w.workspaceId} member={w} expanded={expanded} />
              ))}
            </div>

            {expanded && (
              <button onClick={() => setShowNewWorkspace(true)} className="mt-3 px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#a5b4fc] text-left transition-colors flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-dashed border-[#475569] flex items-center justify-center">+</div>
                New Workspace
              </button>
            )}
          </div>

        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-[#1e293b] shrink-0">
          <div className="group relative rounded-xl p-2 hover:bg-[#0f1929] cursor-pointer transition-colors flex items-center gap-3">
            <Avatar name={user?.name || 'User'} avatarUrl={user?.avatarUrl} size={32} />
            <div className={`overflow-hidden transition-opacity duration-200 flex-1 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
               <p className="text-sm font-semibold text-white truncate">{user?.name || '...'}</p>
               <p className="text-xs text-[#94a3b8] truncate">{user?.email || '...'}</p>
            </div>
            
            {/* Simple dropdown mock for user settings */}
            <div className="hidden group-hover:block absolute bottom-full left-0 w-[240px] mb-2 bg-[#0c1525] border border-[#1e293b] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden z-[999]">
               <div className="p-2 flex flex-col gap-1">
                  <div className="px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#1e293b] hover:text-white rounded-lg transition-colors cursor-pointer">Profile Settings</div>
                  <div className="h-[1px] bg-[#1e293b] my-1"></div>
                  <div className="px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef444420] rounded-lg transition-colors cursor-pointer flex items-center gap-2" onClick={handleSignOut}>
                    ➔ Sign out
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showNewWorkspace && (
        <NewWorkspaceModal 
          onClose={() => setShowNewWorkspace(false)} 
          onSuccess={() => refetch()} 
        />
      )}
    </>
  );
}

// Workaround for hydration with dynamic import for NewProjectModal inside WorkspaceItem
// We'll put the inline import component in a small stub here for the sidebars use
import dynamic from 'next/dynamic';
export const DynamicProjectModal = dynamic(() => import('@/components/modals/NewProjectModal').then(m => m.NewProjectModal), { ssr: false });
