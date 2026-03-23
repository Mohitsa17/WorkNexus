'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function InviteModal({ workspaceId, workspaceName, onClose }: { workspaceId: string, workspaceName: string, onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN'>('EDITOR');
  const [loading, setLoading] = useState(false);
  const { user } = useCurrentUser();
  const { success, error, loading: loadingToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;
    
    setLoading(true);
    const toastId = loadingToast('Sending invitation...');
    
    try {
      const supabase = createClient();
      
      // Basic validation: check if already a member
      const { data: existUser } = await supabase.from('User').select('id').eq('email', email).single();
      if (existUser) {
        const { data: isMember } = await supabase.from('WorkspaceMember').select('id').eq('userId', existUser.id).eq('workspaceId', workspaceId).single();
        if (isMember) {
           throw new Error('This person is already a member of this workspace.');
        }
      }

      // Generate a token natively or let Supabase default handle it (we'll just use a uuid gen client side here or wait for db trigger. Since schema implies default token gen, we'll insert without token maybe? Actually let's just make one to pass to API)
      const mockToken = crypto.randomUUID();

      const { error: invError } = await supabase.from('Invitation').insert({
        email, role, workspaceId, invitedByUserId: user.id, token: mockToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      if (invError) throw invError;

      // Trigger /api/invite
      fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, workspaceName, inviterName: user.name, token: mockToken })
      }).catch(console.error); // Ignore fire-and-forget error

      removeToast(toastId);
      success(`Invitation sent to ${email} ✓`);
      onClose();
    } catch (err: any) {
      console.error(err);
      removeToast(toastId);
      error(err.message || 'Error sending invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-[480px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-[#1e293b]">
          <h2 className="text-[16px] font-bold text-white">Invite to {workspaceName}</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors text-xl">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6">
          <div>
            <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com" 
              required
              autoFocus
              className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            />
          </div>
          
          <div>
            <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Access Role</label>
            <div className="flex flex-col gap-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${role === 'VIEWER' ? 'bg-[#6366f115] border-[#6366f1] shadow-[inset_0_0_10px_rgba(99,102,241,0.1)]' : 'bg-[#050810] border-[#1e293b] hover:border-[#334155]'}`}>
                <input type="radio" name="role" checked={role === 'VIEWER'} onChange={() => setRole('VIEWER')} className="mt-1" />
                <div>
                  <div className={`font-semibold text-sm ${role === 'VIEWER' ? 'text-[#a5b4fc]' : 'text-white'}`}>Viewer</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">Can view all tasks and projects</div>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${role === 'EDITOR' ? 'bg-[#6366f115] border-[#6366f1] shadow-[inset_0_0_10px_rgba(99,102,241,0.1)]' : 'bg-[#050810] border-[#1e293b] hover:border-[#334155]'}`}>
                <input type="radio" name="role" checked={role === 'EDITOR'} onChange={() => setRole('EDITOR')} className="mt-1" />
                <div>
                  <div className={`font-semibold text-sm ${role === 'EDITOR' ? 'text-[#a5b4fc]' : 'text-white'}`}>Editor</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">Can create and edit tasks, add comments</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${role === 'ADMIN' ? 'bg-[#6366f115] border-[#6366f1] shadow-[inset_0_0_10px_rgba(99,102,241,0.1)]' : 'bg-[#050810] border-[#1e293b] hover:border-[#334155]'}`}>
                <input type="radio" name="role" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} className="mt-1" />
                <div>
                  <div className={`font-semibold text-sm ${role === 'ADMIN' ? 'text-[#a5b4fc]' : 'text-white'}`}>Admin</div>
                  <div className="text-xs text-[#94a3b8] mt-0.5">Full access including member management</div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !email.trim()} className="px-5 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all">
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
