'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWorkspaceDetails } from '@/hooks/useWorkspaces';

export function NewTaskModal({ projectId, workspaceId, onClose }: { projectId: string, workspaceId: string, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'TODO' | 'WORKING' | 'DONE'>('TODO');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [group, setGroup] = useState('General');
  const [assigneeId, setAssigneeId] = useState('');
  
  const { user } = useCurrentUser();
  const { members } = useWorkspaceDetails(workspaceId);
  const { success, error, loading: loadingToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Default assignee to current user if available
  React.useEffect(() => {
    if (user && !assigneeId) setAssigneeId(user.id);
  }, [user, assigneeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    
    setLoading(true);
    const toastId = loadingToast('Creating task...');
    
    try {
      const supabase = createClient();
      
      const { data: taskData, error: pbError } = await supabase
        .from('Task')
        .insert({ 
          title, description, status, priority, group, 
          projectId, assigneeId: assigneeId || null, progress: 0 
        })
        .select()
        .single();
        
      if (pbError) throw pbError;

      // Activity log
      await supabase.from('ActivityLog').insert({
        taskId: taskData.id, userId: user.id, action: 'Task created'
      });

      // Notification
      if (assigneeId && assigneeId !== user.id) {
         await supabase.from('Notification').insert({
           userId: assigneeId, type: 'assignment', message: `${user.name} assigned you a task: ${title}`, read: false
         });
      }

      removeToast(toastId);
      success('Task created!');
      onClose();
    } catch (err: any) {
      console.error(err);
      removeToast(toastId);
      error(err.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-[600px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-slide-in-up flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1e293b] flex-shrink-0">
          <h2 className="text-[18px] font-bold text-white">New Task</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors text-xl">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-[#1e293b]">
            <div>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title" 
                required
                autoFocus
                className="w-full bg-transparent border-b border-[#1e293b] px-2 py-3 text-2xl font-bold text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Status</label>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option value="TODO">◯ Todo</option>
                  <option value="WORKING">◐ Working</option>
                  <option value="DONE">⬤ Done</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Priority</label>
                <select 
                  value={priority} onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Assignee</label>
                <select 
                  value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Group</label>
                <input 
                  type="text" value={group} onChange={(e) => setGroup(e.target.value)}
                  placeholder="e.g. Sprint 1"
                  className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Description</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                rows={4}
                className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] resize-none"
              />
            </div>
          </div>

          <div className="p-6 bg-[#080d18] flex justify-end gap-3 border-t border-[#1e293b] flex-shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} className="px-6 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-semibold rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 transition-all flex items-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
