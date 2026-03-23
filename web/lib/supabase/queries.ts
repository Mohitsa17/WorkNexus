import { createClient } from './client';

export type User = { id: string; email: string; name: string; avatarUrl: string | null; createdAt: string; };
export type Workspace = { id: string; name: string; color: string; createdAt: string; };
export type WorkspaceMember = { id: string; role: 'VIEWER' | 'EDITOR' | 'ADMIN'; userId: string; workspaceId: string; joinedAt: string; user?: User; workspace?: Workspace; };
export type Project = { id: string; name: string; emoji: string; workspaceId: string; createdAt: string; workspace?: Workspace; };
export type Task = { id: string; title: string; description: string | null; status: 'TODO' | 'WORKING' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; progress: number; group: string; startDate: string | null; dueDate: string | null; assigneeId: string | null; projectId: string; createdAt: string; updatedAt: string; assignee?: User; project?: Project; };
export type Comment = { id: string; text: string; userId: string; taskId: string; createdAt: string; user?: User; };
export type ActivityLog = { id: string; taskId: string; userId: string; action: string; createdAt: string; user?: User; };
export type Notification = { id: string; userId: string; type: string; message: string; read: boolean; createdAt: string; };
export type Invitation = { id: string; email: string; role: string; token: string; workspaceId: string; invitedByUserId: string; expiresAt: string; acceptedAt: string | null; workspace?: Workspace; invitedBy?: User; };

// Auth
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: dbUser } = await supabase.from('User').select('*').eq('id', user.id).single();
  return dbUser as User | null;
}

// Workspaces
export async function getMyWorkspaces(userId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('WorkspaceMember').select('*, workspace:Workspace(*)').eq('userId', userId);
  return data || [];
}

export async function getWorkspaceWithMembers(workspaceId: string) {
  const supabase = createClient();
  const { data: workspace } = await supabase.from('Workspace').select('*').eq('id', workspaceId).single();
  const { data: members } = await supabase.from('WorkspaceMember').select('*, user:User(*)').eq('workspaceId', workspaceId);
  return { workspace, members };
}

export async function getUserRoleInWorkspace(userId: string, workspaceId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('WorkspaceMember').select('role').eq('userId', userId).eq('workspaceId', workspaceId).single();
  return data?.role || null;
}

// Projects
export async function getProjectsInWorkspace(workspaceId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Project').select('*').eq('workspaceId', workspaceId).order('createdAt', { ascending: true });
  return data || [];
}

export async function getProject(projectId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Project').select('*, workspace:Workspace(*)').eq('id', projectId).single();
  return data;
}

// Tasks
export async function getTaskDetails(taskId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('Task')
    .select('*, assignee:User(*), project:Project(*), comments:Comment(*, user:User(*)), logs:ActivityLog(*, user:User(*))')
    .eq('id', taskId)
    .single();

  if (data?.comments) {
    data.comments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (data?.logs) {
    data.logs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return data;
}

export async function getTasksForProject(projectId: string, filters?: { status?: string, priority?: string, assigneeId?: string, search?: string }) {
  const supabase = createClient();
  let query = supabase.from('Task').select('*, assignee:User(*)').eq('projectId', projectId);
  
  if (filters?.status) query = query.in('status', filters.status.split(','));
  if (filters?.priority) query = query.in('priority', filters.priority.split(','));
  if (filters?.assigneeId) query = query.in('assigneeId', filters.assigneeId.split(','));
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
  
  const { data } = await query.order('group', { ascending: true }).order('createdAt', { ascending: true });
  return data || [];
}

export async function getMyTasks(userId: string, status?: string) {
  const supabase = createClient();
  let query = supabase.from('Task').select('*, project:Project(*)').eq('assigneeId', userId);
  if (status) query = query.eq('status', status);
  const { data } = await query.order('dueDate', { ascending: true, nullsFirst: false });
  return data || [];
}

export async function getOverdueTasks(userId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Task')
    .select('*, project:Project(*)')
    .eq('assigneeId', userId)
    .lt('dueDate', new Date().toISOString())
    .neq('status', 'DONE');
  return data || [];
}

// Comments
export async function getCommentsForTask(taskId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Comment').select('*, user:User(*)').eq('taskId', taskId).order('createdAt', { ascending: true });
  return data || [];
}

// Activity
export async function getActivityForTask(taskId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('ActivityLog').select('*, user:User(*)').eq('taskId', taskId).order('createdAt', { ascending: false }).limit(20);
  return data || [];
}

// Notifications
export async function getMyNotifications(userId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Notification').select('*').eq('userId', userId).order('createdAt', { ascending: false });
  return data || [];
}

export async function getUnreadCount(userId: string) {
  const supabase = createClient();
  const { count } = await supabase.from('Notification').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('read', false);
  return count || 0;
}

// Invitations
export async function getInvitationByToken(token: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Invitation').select('*, workspace:Workspace(*), invitedBy:User!invitedByUserId(*)').eq('token', token).single();
  return data;
}

export async function getPendingInvitations(workspaceId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('Invitation').select('*').eq('workspaceId', workspaceId).is('acceptedAt', null);
  return data || [];
}
