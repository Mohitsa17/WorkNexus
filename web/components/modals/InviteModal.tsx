'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function InviteModal({ workspaceId, workspaceName, onClose }: {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN'>('EDITOR');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useCurrentUser();
  const { success, error, loading: loadingToast, removeToast } = useToast();

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user) return;

    setLoading(true);
    const toastId = loadingToast('Creating invitation...');

    try {
      const supabase = createClient();

      // Check if already a member — use maybeSingle() (never throws 406)
      const { data: existUser } = await supabase
        .from('User').select('id').eq('email', email.toLowerCase()).maybeSingle();

      if (existUser) {
        const { data: isMember } = await supabase
          .from('WorkspaceMember').select('id')
          .eq('userId', existUser.id).eq('workspaceId', workspaceId).maybeSingle();
        if (isMember) throw new Error('This person is already a member of this workspace.');
      }

      // Save invitation to DB
      const token = crypto.randomUUID();
      const { error: invError } = await supabase.from('Invitation').insert({
        email: email.toLowerCase(),
        role,
        workspaceId,
        invitedByUserId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (invError) throw invError;

      const link = `${window.location.origin}/invite/${token}`;

      // Try email silently — never crash the flow if it fails
      try {
        const res = await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role, workspaceName, inviterName: user.name, token }),
        });
        const result = await res.json();
        if (result.emailSent) {
          removeToast(toastId);
          success(`Invitation email sent to ${email} ✓`);
          setInviteLink(link); // still show link as backup
          return;
        }
      } catch {
        // Email sending failed silently — show link instead
      }

      // Fallback — always show the invite link
      removeToast(toastId);
      setInviteLink(link);
      success('Invitation created! Copy the link below and share it 👇');
    } catch (err: any) {
      console.error(err);
      removeToast(toastId);
      error(err.message || 'Error creating invitation');
    } finally {
      setLoading(false);
    }
  };

  // ── If invite link is ready, show share panel ──────────────────
  if (inviteLink) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-[480px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-5 border-b border-[#1e293b]">
            <h2 className="text-[16px] font-bold text-white">Invitation Created ✓</h2>
            <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors text-xl">✕</button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Big success icon */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-3xl shadow-[0_0_24px_rgba(99,102,241,0.4)]">
                🔗
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Invite link ready for <span className="text-[#a5b4fc]">{email}</span></p>
                <p className="text-[#64748b] text-sm mt-1">Send it via WhatsApp, email, or any messenger</p>
              </div>
            </div>

            {/* Link input + copy */}
            <div className="bg-[#050810] border border-[#334155] rounded-xl p-3 flex items-center gap-3">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 bg-transparent text-[#94a3b8] text-xs focus:outline-none min-w-0"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyLink}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-[#10b981] text-white' : 'bg-[#6366f1] hover:bg-[#818cf8] text-white'}`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            {/* Share via quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`You've been invited to join ${workspaceName} on WorkNexus! Click here: ${inviteLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-[#0f1929] border border-[#1e293b] rounded-xl hover:border-[#25D366] hover:bg-[#25D36615] transition-all group"
              >
                <span className="text-xl">💬</span>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#25D366] transition-colors">WhatsApp</div>
                  <div className="text-xs text-[#475569]">Send link directly</div>
                </div>
              </a>
              <a
                href={`mailto:${email}?subject=${encodeURIComponent(`Join ${workspaceName} on WorkNexus`)}&body=${encodeURIComponent(`Hi!\n\nI've invited you to join ${workspaceName} on WorkNexus.\n\nClick here to accept: ${inviteLink}\n\nThis link expires in 7 days.`)}`}
                className="flex items-center gap-2 p-3 bg-[#0f1929] border border-[#1e293b] rounded-xl hover:border-[#6366f1] hover:bg-[#6366f115] transition-all group"
              >
                <span className="text-xl">📧</span>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#a5b4fc] transition-colors">Email App</div>
                  <div className="text-xs text-[#475569]">Open in mail client</div>
                </div>
              </a>
            </div>

            <p className="text-center text-[#475569] text-xs">
              🔒 Link expires in 7 days · Only works for <span className="text-[#94a3b8]">{email}</span>
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default form view ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-[480px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-[#1e293b]">
          <h2 className="text-[16px] font-bold text-white">Invite to {workspaceName}</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          <div>
            <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
              autoFocus
              className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#94a3b8] block mb-2 uppercase tracking-widest">Access Role</label>
            <div className="flex flex-col gap-2">
              {([
                { value: 'VIEWER', label: 'Viewer', desc: 'Can view all tasks and projects' },
                { value: 'EDITOR', label: 'Editor', desc: 'Can create and edit tasks, add comments' },
                { value: 'ADMIN',  label: 'Admin',  desc: 'Full access including member management' },
              ] as const).map(r => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${role === r.value ? 'bg-[#6366f115] border-[#6366f1]' : 'bg-[#050810] border-[#1e293b] hover:border-[#334155]'}`}
                >
                  <input type="radio" name="role" checked={role === r.value} onChange={() => setRole(r.value)} className="mt-1" />
                  <div>
                    <div className={`font-semibold text-sm ${role === r.value ? 'text-[#a5b4fc]' : 'text-white'}`}>{r.label}</div>
                    <div className="text-xs text-[#94a3b8] mt-0.5">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#1e293b]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#94a3b8] hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-5 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating...' : 'Generate Invite Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
