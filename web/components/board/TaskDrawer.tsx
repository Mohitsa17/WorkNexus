'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getTaskDetails, Task, Comment, ActivityLog } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar } from '../ui/Avatar';
import { Badge, STATUS_CONFIG, PRIORITY_CONFIG } from '../ui/Badge';
import { useToast } from '../ui/Toast';

type Props = {
  taskId: string;
  members: any[];
  role: string;
  onClose: () => void;
};

/* ── Reusable themed dropdown ───────────────────────────────────── */
function PropSelect({
  label,
  trigger,
  isViewer,
  children,
}: {
  label: string;
  trigger: React.ReactNode;
  isViewer: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative bg-[#080d18] border border-[#1e293b] rounded-lg p-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1">{label}</div>
      <button
        onClick={() => !isViewer && setOpen(v => !v)}
        disabled={isViewer}
        className="flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
      >
        {trigger}
        {!isViewer && <span className="text-[#475569] ml-auto text-[10px]">▾</span>}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-[200] min-w-[140px] bg-[#0f1929] border border-[#334155] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] overflow-hidden py-1">
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  onClick: (...args: any[]) => {
                    (child.props as any).onClick?.(...args);
                    setOpen(false);
                  },
                })
              : child
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Drawer ────────────────────────────────────────────────── */
export function TaskDrawer({ taskId, members, role, onClose }: Props) {
  const { user } = useCurrentUser();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'Updates' | 'Activity'>('Updates');
  const [newComment, setNewComment] = useState('');
  const { error } = useToast();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await getTaskDetails(taskId);
        if (t) {
          setTask(t as any);
          setComments(t.comments as any || []);
          setLogs(t.logs as any || []);
        }
      } catch {
        error('Error loading task details');
      } finally {
        setLoading(false);
      }
    };
    load();

    const sb = createClient();
    const ch = sb.channel(`task-${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Comment', filter: `taskId=eq.${taskId}` }, () => {
        getTaskDetails(taskId).then(t => { if (t) setComments(t.comments as any || []); });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ActivityLog', filter: `taskId=eq.${taskId}` }, () => {
        getTaskDetails(taskId).then(t => { if (t) setLogs(t.logs as any || []); });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Task', filter: `id=eq.${taskId}` }, payload => {
        setTask(prev => prev ? { ...prev, ...payload.new } as any : null);
      })
      .subscribe();

    return () => { sb.removeChannel(ch); };
  }, [taskId, error]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const updateField = async (field: keyof Task, val: any) => {
    if (role === 'VIEWER' || !task || !user) return;
    setTask({ ...task, [field]: val } as any);
    const sb = createClient();
    await sb.from('Task').update({ [field]: val }).eq('id', taskId);
    let action = `Updated ${field}`;
    if (field === 'status') action = `Changed status to ${val}`;
    if (field === 'assigneeId') action = `Assigned to ${members.find(m => m.userId === val)?.user?.name || 'Unassigned'}`;
    if (action !== `Updated ${field}`) {
      await sb.from('ActivityLog').insert({ taskId, userId: user.id, action });
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user || !task || role === 'VIEWER') return;
    const txt = newComment;
    setNewComment('');
    const sb = createClient();
    const { data: cData } = await sb.from('Comment').insert({ taskId, userId: user.id, text: txt }).select('*, user:User(*)').single();
    if (cData) {
      setComments([cData as any, ...comments]);
      if (task.assigneeId && task.assigneeId !== user.id) {
        await sb.from('Notification').insert({
          userId: task.assigneeId,
          type: 'comment',
          message: `${user.name} commented on "${task.title}": ${txt.substring(0, 30)}...`,
        });
      }
    }
  };

  if (loading || !task) {
    return (
      <div ref={drawerRef} className="w-[460px] h-full bg-[#080d18] flex flex-col p-6 gap-4 animate-slide-in-right shadow-[inset_1px_0_0_#1e293b]">
        <div className="h-8 w-64 bg-[#1e293b] rounded animate-pulse" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[#1e293b] rounded-lg animate-pulse w-full" />)}
      </div>
    );
  }

  const isViewer = role === 'VIEWER';
  const statusCfg = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
  const priorityCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];

  return (
    <div
      ref={drawerRef}
      className="w-[90vw] sm:w-[460px] h-full bg-[#0a111e] flex flex-col overflow-y-auto animate-slide-in-right shadow-[inset_1px_0_0_#1e293b,-20px_0_60px_rgba(0,0,0,0.9)] text-sm"
    >
      {/* ── Header ── */}
      <div className="px-5 py-3 flex items-center justify-between shrink-0 bg-[#080d18] border-b border-[#1e293b] sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <button
            onClick={() => updateField('status', task.status === 'DONE' ? 'TODO' : 'DONE')}
            disabled={isViewer}
            className="w-5 h-5 rounded border-2 border-[#334155] shrink-0 flex items-center justify-center hover:bg-[#10b981] hover:border-[#10b981] transition-colors focus:outline-none"
          >
            {task.status === 'DONE' && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <input
            value={task.title}
            onChange={e => setTask({ ...task, title: e.target.value } as any)}
            onBlur={e => updateField('title', e.target.value)}
            disabled={isViewer}
            className="flex-1 bg-transparent text-[18px] font-bold text-white border-b border-transparent focus:border-[#6366f1] focus:outline-none hover:border-[#334155] transition-colors truncate"
          />
        </div>
        <button onClick={onClose} className="ml-3 shrink-0 text-[#64748b] hover:text-white bg-[#1e293b] w-8 h-8 flex items-center justify-center rounded-lg transition-colors">✕</button>
      </div>

      {/* ── Properties (2-col compact grid) ── */}
      <div className="px-5 py-3 border-b border-[#1e293b] bg-[#0c1525]">
        <div className="grid grid-cols-2 gap-2">
          {/* Assignee */}
          <PropSelect
            label="Assignee"
            isViewer={isViewer}
            trigger={
              task.assignee ? (
                <div className="flex items-center gap-1.5">
                  <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size={18} />
                  <span className="text-[#e2e8f0] text-xs font-semibold truncate max-w-[80px]">{task.assignee.name.split(' ')[0]}</span>
                </div>
              ) : <span className="text-[#475569] text-xs">Unassigned</span>
            }
          >
            <button
              onClick={() => updateField('assigneeId', null)}
              className="w-full text-left px-3 py-2 text-xs text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
            >
              Unassigned
            </button>
            {members.map(m => (
              <button
                key={m.userId}
                onClick={() => updateField('assigneeId', m.userId)}
                className="w-full text-left px-3 py-2 text-xs text-[#e2e8f0] hover:bg-[#1e293b] transition-colors flex items-center gap-2"
              >
                <Avatar name={m.user?.name || '?'} avatarUrl={m.user?.avatarUrl} size={16} />
                {m.user?.name || m.user?.email}
              </button>
            ))}
          </PropSelect>

          {/* Status */}
          <PropSelect
            label="Status"
            isViewer={isViewer}
            trigger={<Badge label={statusCfg.label} color={statusCfg.color} bgColor={statusCfg.bg} dotColor={statusCfg.dot} />}
          >
            {(['TODO', 'WORKING', 'DONE'] as const).map(s => {
              const c = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => updateField('status', s)}
                  className="w-full text-left px-3 py-2 hover:bg-[#1e293b] transition-colors"
                >
                  <Badge label={c.label} color={c.color} bgColor={c.bg} dotColor={c.dot} />
                </button>
              );
            })}
          </PropSelect>

          {/* Priority */}
          <PropSelect
            label="Priority"
            isViewer={isViewer}
            trigger={<Badge label={priorityCfg.label} color={priorityCfg.color} bgColor={priorityCfg.bg} dotColor={priorityCfg.dot} />}
          >
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map(p => {
              const c = PRIORITY_CONFIG[p];
              return (
                <button
                  key={p}
                  onClick={() => updateField('priority', p)}
                  className="w-full text-left px-3 py-2 hover:bg-[#1e293b] transition-colors"
                >
                  <Badge label={c.label} color={c.color} bgColor={c.bg} dotColor={c.dot} />
                </button>
              );
            })}
          </PropSelect>

          {/* Group */}
          <div className="bg-[#080d18] border border-[#1e293b] rounded-lg p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1">Group</div>
            <input
              value={task.group || ''}
              onChange={e => setTask({ ...task, group: e.target.value } as any)}
              onBlur={e => updateField('group', e.target.value)}
              disabled={isViewer}
              className="w-full bg-transparent border-none focus:outline-none text-[#e2e8f0] text-xs font-semibold placeholder:text-[#475569] disabled:opacity-60"
              placeholder="e.g. Sprint 1"
            />
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="px-5 py-3 border-b border-[#1e293b]">
        <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">Description</div>
        <textarea
          value={task.description || ''}
          onChange={e => setTask({ ...task, description: e.target.value } as any)}
          onBlur={e => updateField('description', e.target.value)}
          placeholder="Write a description, add links..."
          disabled={isViewer}
          rows={3}
          className="w-full bg-[#0d1628] border border-[#334155] rounded-xl px-3 py-2 text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] resize-none"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex px-5 border-b border-[#1e293b] shrink-0 h-10 bg-[#080d18]">
        {(['Updates', 'Activity'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 h-full text-[12px] font-bold uppercase tracking-wider border-b-2 transition-all ${tab === t ? 'border-[#6366f1] text-[#a5b4fc]' : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'}`}
          >
            {t === 'Activity' ? 'Activity Log' : t}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 px-5 py-4 bg-[#0c1525]">
        {tab === 'Updates' ? (
          <div className="flex flex-col gap-4">
            {!isViewer && (
              <div className="border border-[#334155] rounded-2xl bg-[#0a111e] overflow-hidden focus-within:border-[#6366f1] transition-colors">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write an update..."
                  rows={3}
                  className="w-full bg-transparent p-4 text-sm text-white resize-none focus:outline-none"
                />
                <div className="flex justify-between items-center px-4 py-2 bg-[#0d1628] border-t border-[#1e293b]">
                  <span className="text-[11px] text-[#475569]">Supports Markdown (soon)</span>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="px-4 py-1.5 bg-[#6366f1] text-white text-[12px] font-bold rounded hover:bg-[#818cf8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-5">
              {comments.map((c, i) => (
                <div key={c.id || i} className="flex gap-3">
                  <Avatar name={c.user?.name || 'User'} avatarUrl={c.user?.avatarUrl} size={30} />
                  <div className="flex-1 bg-[#0a111e] border border-[#1e293b] rounded-xl rounded-tl-sm p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-white">{c.user?.name}</span>
                      <span className="text-[11px] text-[#475569]">{new Date(c.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                    </div>
                    <p className="text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">💬</div>
                  <p className="text-[#94a3b8] font-medium text-sm">No updates yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative pl-4 border-l-2 border-[#1e293b] ml-4 flex flex-col gap-6 py-3">
            {logs.map((log, i) => (
              <div key={log.id || i} className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#1e293b] ring-4 ring-[#0c1525]" />
                <span className="font-bold text-[#f1f5f9] text-[13px]">{log.user?.name || 'System'}</span>
                {' '}
                <span className="text-[#94a3b8] text-[13px]">{log.action}</span>
                <div className="text-[11px] text-[#475569] font-mono mt-0.5">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-[#64748b] text-sm">No activity recorded for this task yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
