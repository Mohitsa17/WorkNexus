'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

const EMOJIS = ['🌐','🎨','🚀','📌','💼','🏆','⚡','🔥','🎯','📊','🛠','📱','🎓','🏢','💡','🔬','🌱','🎪','🛒','🔮'];

export function NewProjectModal({ workspaceId, onClose, onSuccess }: { workspaceId: string, onClose: () => void, onSuccess?: (id: string) => void }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[2]); // Rocket default
  const [loading, setLoading] = useState(false);
  const { success, error, loading: loadingToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    const toastId = loadingToast('Creating project...');
    
    try {
      const supabase = createClient();
      
      const { data, error: pbError } = await supabase
        .from('Project')
        .insert({ name, emoji, workspaceId })
        .select()
        .single();
        
      if (pbError) throw pbError;

      removeToast(toastId);
      success('Project created!');
      if (onSuccess) onSuccess(data.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      removeToast(toastId);
      error(err.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-[400px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-[#1e293b]">
          <h2 className="text-[16px] font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors text-xl">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1e293b] border border-[#334155] rounded-xl flex items-center justify-center text-3xl shadow-inner">
              {emoji}
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-semibold text-[#94a3b8] block mb-1 uppercase tracking-widest">Project Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Marketing Campaign" 
                maxLength={50}
                required
                autoFocus
                className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Choose Icon</label>
            <div className="grid grid-cols-10 gap-2 bg-[#050810] p-3 rounded-xl border border-[#1e293b]">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-1 rounded-md transition-all flex items-center justify-center ${emoji === e ? 'bg-[#334155] scale-110 shadow-sm' : 'hover:bg-[#1e293b] grayscale hover:grayscale-0 opacity-60 hover:opacity-100'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="px-5 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
