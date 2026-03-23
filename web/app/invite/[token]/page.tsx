'use client';
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      // Must be logged in to accept
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    const checkInvite = async () => {
      const sb = createClient();
      const { data, error } = await sb.from('Invitation')
         .select('*, workspace:Workspace(*), inviter:User!invitedByUserId(*)')
         .eq('token', token)
         .single();
         
      if (error || !data) {
        setErrorMsg('Invalid or expired invitation link.');
      } else if (new Date(data.expiresAt) < new Date() || data.status !== 'PENDING') {
        setErrorMsg('This invitation has expired or already been used.');
      } else if (data.email.toLowerCase() !== user.email?.toLowerCase()) {
        setErrorMsg(`This invite was sent to ${data.email}. Please login with that account.`);
      } else {
        setInvite(data);
      }
      setLoading(false);
    };

    checkInvite();
  }, [token, user, userLoading, router]);

  const handleAccept = async () => {
    if (!invite || !user) return;
    setProcessing(true);
    const sb = createClient();
    
    // Add member
    const { error: memberErr } = await sb.from('WorkspaceMember').insert({
       workspaceId: invite.workspaceId,
       userId: user.id,
       role: invite.role
    });

    if (memberErr && !memberErr.message.includes('duplicate')) {
       setErrorMsg('Error joining workspace');
       setProcessing(false);
       return;
    }

    // Update invite status
    await sb.from('Invitation').update({ status: 'ACCEPTED' }).eq('id', invite.id);

    // Give them a welcome notification
    await sb.from('Notification').insert({
       userId: user.id,
       type: 'invite',
       message: `Welcome to ${invite.workspace?.name}! You joined as a ${invite.role.toLowerCase()}.`
    });

    router.push('/dashboard');
  };

  const handleDecline = async () => {
    if (!invite) return;
    setProcessing(true);
    const sb = createClient();
    await sb.from('Invitation').update({ status: 'DECLINED' }).eq('id', invite.id);
    router.push('/dashboard');
  };

  if (loading || userLoading) {
    return <div className="min-h-screen bg-[#050810] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#1e293b] border-t-[#6366f1] rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 selection:bg-[#6366f1] selection:text-white relative overflow-hidden">
       {/* Background glow */}
       <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#6366f1] opacity-[0.05] blur-[120px] rounded-full pointer-events-none"></div>

       <div className="w-full max-w-md bg-[#0c1525] border border-[#1e293b] rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-slide-in-up relative z-10 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.5)] mx-auto mb-6 shrink-0">
            ✉️
          </div>

          <h1 className="text-2xl font-[800] text-white tracking-tight mb-2">You've been invited!</h1>
          
          {errorMsg ? (
            <div className="mt-6 mb-6">
               <p className="text-[#ef4444] bg-[#ef444415] border border-[#ef444450] py-3 px-4 rounded-xl text-sm font-semibold inline-block">{errorMsg}</p>
               <div className="mt-8">
                  <button onClick={() => router.push('/dashboard')} className="text-[#6366f1] hover:text-[#818cf8] font-bold text-sm tracking-widest uppercase transition-colors">Return Home</button>
               </div>
            </div>
          ) : (
            <>
               <p className="text-[#a1a1aa] mb-8 text-[15px] leading-relaxed">
                 <strong className="text-white">{invite?.inviter?.name}</strong> has invited you to join the workspace <strong className="text-[#a5b4fc]">{invite?.workspace?.name}</strong> as an {invite?.role.toLowerCase()}.
               </p>

               <div className="flex flex-col gap-3 mt-4">
                  <button 
                    onClick={handleAccept} 
                    disabled={processing}
                    className="w-full py-3.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-[15px] font-[700] rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider h-14 flex items-center justify-center gap-2"
                  >
                    {processing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Accept Invitation'}
                  </button>
                  <button 
                    onClick={handleDecline}
                    disabled={processing}
                    className="w-full py-3.5 bg-transparent border-2 border-[#1e293b] text-[#94a3b8] hover:text-white hover:border-[#334155] rounded-xl text-[14px] font-[700] transition-colors outline-none h-14"
                  >
                    Decline
                  </button>
               </div>
            </>
          )}

       </div>
    </div>
  );
}
