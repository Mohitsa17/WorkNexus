'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { WorkspaceMember } from '@/lib/supabase/queries';
import { useProjects } from '@/hooks/useProjects';
import { NewProjectModal } from '@/components/modals/NewProjectModal';

type Props = {
  member: WorkspaceMember;
  expanded: boolean;
};

export function WorkspaceItem({ member, expanded }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { workspace } = member;
  const { projects, loading } = useProjects(workspace?.id || '');

  useEffect(() => {
    // Restore state from localStorage
    if (workspace?.id) {
      const stored = localStorage.getItem(`workspace_open_${workspace.id}`);
      if (stored === 'true') setIsOpen(true);
    }
  }, [workspace?.id]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (workspace?.id) localStorage.setItem(`workspace_open_${workspace.id}`, String(next));
  };

  const [showNewProjModal, setShowNewProjModal] = useState(false);

  if (!workspace || !expanded) {
    // Collapsed state: just show the dot
    return (
      <div className="w-8 h-8 mx-auto flex items-center justify-center cursor-pointer hover:bg-[#0f1929] rounded-lg transition-colors" title={workspace?.name}>
        <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: workspace?.color || '#6366f1' }}></div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="group flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#0f1929] cursor-pointer transition-colors" onClick={toggleOpen}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: workspace.color }}></div>
          <span className="text-sm font-semibold text-[#e2e8f0] truncate">{workspace.name}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowNewProjModal(true); }}
            className="text-[#94a3b8] hover:text-white px-1"
            title="Create Project"
          >
            +
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-[#1e293b] pl-2">
          {loading ? (
            <div className="px-2 py-1 text-xs text-[#475569] animate-pulse">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="px-2 py-1 text-xs text-[#475569]">No projects</div>
          ) : (
            projects.map(p => {
              const isActive = pathname === `/project/${p.id}`;
              return (
                <div key={p.id} className="group relative flex items-center">
                  <Link 
                    href={`/project/${p.id}`}
                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-[#6366f115] text-[#a5b4fc] font-semibold' : 'text-[#94a3b8] hover:bg-[#0f1929] hover:text-[#e2e8f0]'}`}
                  >
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.name}</span>
                  </Link>
                  <button className="absolute right-2 opacity-0 group-hover:opacity-100 text-[#475569] hover:text-white transition-opacity hidden">···</button>
                </div>
              );
            })
          )}
          
          <button 
            onClick={() => setShowNewProjModal(true)}
            className="text-left px-2 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#a5b4fc] transition-colors mt-1"
          >
            + Add project
          </button>
        </div>
      )}

      {showNewProjModal && (
         <NewProjectModal 
           workspaceId={workspace.id} 
           onClose={() => setShowNewProjModal(false)} 
           onSuccess={(id: string) => {
             setShowNewProjModal(false);
             router.push(`/project/${id}`);
           }}
         />
      )}
    </div>
  );
}
