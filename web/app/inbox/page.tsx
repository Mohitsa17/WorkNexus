'use client';
import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { createClient } from '@/lib/supabase/client';
import { Notification } from '@/lib/supabase/queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';

export default function InboxPage() {
  const { user } = useCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchNots = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('Notification').select('*').eq('userId', user.id).order('createdAt', { ascending: false });
      setNotifications(data as any[] || []);
      setLoading(false);
    };
    fetchNots();
  }, [user]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('Notification').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('Notification').update({ read: true }).eq('userId', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const supabase = createClient();
    await supabase.from('Notification').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'assignment': return '👤';
      case 'done': return '✅';
      case 'invite': return '📩';
      default: return '🔔';
    }
  };

  if (loading) return <div className="p-8 bg-[#050810] min-h-screen"><div className="w-8 h-8 rounded-full border-2 border-[#1e293b] border-t-[#6366f1] animate-spin mx-auto mt-20"></div></div>;

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="p-8 max-w-[800px] mx-auto min-h-screen bg-[#050810]">
      <div className="flex items-center justify-between mb-8 border-b border-[#1e293b] pb-6">
        <div>
          <h1 className="text-3xl font-[800] text-white">Inbox</h1>
          <p className="text-[#94a3b8] text-base mt-1">Updates on your tasks and team activity</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllAsRead} className="px-4 py-2 bg-[#1e293b] text-[#94a3b8] hover:text-white rounded-lg text-sm font-semibold transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState 
          icon="🎉" 
          title="You're all caught up!" 
          description="No new notifications at the moment." 
        />
      ) : (
        <div className="flex flex-col gap-8">
          {unread.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#475569] mb-4">New</h3>
              <div className="flex flex-col gap-2">
                {unread.map(n => (
                  <NotifRow key={n.id} n={n} getIcon={getIcon} onClick={() => markAsRead(n.id)} onDelete={deleteNotif} />
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#475569] mb-4">Earlier</h3>
              <div className="flex flex-col gap-2">
                {read.map(n => (
                  <NotifRow key={n.id} n={n} getIcon={getIcon} onClick={() => {}} onDelete={deleteNotif} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifRow({ n, getIcon, onClick, onDelete }: { n: Notification, getIcon: any, onClick: any, onDelete: any }) {
  // Parsing relative time simply
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDiff = Math.floor((new Date(n.createdAt).getTime() - Date.now()) / 86400000);
  const timeStr = daysDiff === 0 ? 'Today' : rtf.format(daysDiff, 'day');

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-xl p-4 flex gap-4 cursor-pointer transition-all border ${!n.read ? 'bg-[#0c1a2e] border-[#1e3a5f] hover:border-[#3b82f6]' : 'bg-[#050810] border-[#1e293b] hover:border-[#334155] opacity-70'} group`}
    >
      {!n.read && <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
      
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${!n.read ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e293b] text-[#94a3b8]'}`}>
        {getIcon(n.type)}
      </div>

      <div className="flex-1 min-w-0 pr-8">
        <p className={`text-[15px] ${!n.read ? 'text-[#e2e8f0] font-medium' : 'text-[#cbd5e1]'}`}>
          {/* bolden first word (name) generally */}
          <span className="font-bold text-white">{n.message.split(' ')[0]}</span> {n.message.substring(n.message.indexOf(' ') + 1)}
        </p>
        <p className="text-[12px] text-[#475569] mt-1">{timeStr}</p>
      </div>

      <button onClick={(e) => onDelete(e, n.id)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-[#ef444415]">
        ✕
      </button>
    </div>
  );
}
