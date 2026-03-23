'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#64748b'];

export function NewWorkspaceModal({ onClose, onSuccess }: { onClose: () => void, onSuccess?: (id: string) => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { user } = useCurrentUser();
  const { success, error, loading: loadingToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    
    setLoading(true);
    const toastId = loadingToast('Creating workspace...');
    
    try {
      const supabase = createClient();
      const newWorkspaceId = crypto.randomUUID();
      
      const { error: workspaceError } = await supabase
        .from('Workspace')
        .insert({ id: newWorkspaceId, name, color });
        
      if (workspaceError) throw workspaceError;

      const { error: memberError } = await supabase
        .from('WorkspaceMember')
        .insert({ userId: user.id, workspaceId: newWorkspaceId, role: 'ADMIN' });
        
      if (memberError) throw memberError;

      removeToast(toastId);
      success('Workspace created!');
      if (onSuccess) onSuccess(newWorkspaceId);
      onClose();
    } catch (err: any) {
      console.error(err);
      removeToast(toastId);
      error(err.message || 'Something went wrong — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-[400px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-[#1e293b]">
          <h2 className="text-[16px] font-bold text-white">Create Workspace</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-colors duration-300" style={{ backgroundColor: color }}>
              {name.charAt(0).toUpperCase() || 'W'}
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-semibold text-[#94a3b8] block mb-1 uppercase tracking-widest">Workspace Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp" 
                maxLength={50}
                required
                autoFocus
                className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Workspace Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f172a] scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="px-5 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all">
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
