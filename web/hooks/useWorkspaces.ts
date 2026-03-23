'use client';
import { useState, useEffect, useCallback } from 'react';
import { getMyWorkspaces, getWorkspaceWithMembers, getUserRoleInWorkspace, WorkspaceMember } from '@/lib/supabase/queries';

export function useWorkspaces(userId: string | undefined) {
  const [workspaces, setWorkspaces] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    if (!userId) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyWorkspaces(userId);
      setWorkspaces(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, loading, refetch: fetchWorkspaces };
}

export function useWorkspaceDetails(workspaceId: string) {
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await getWorkspaceWithMembers(workspaceId);
      setWorkspaceData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { workspace: workspaceData?.workspace, members: workspaceData?.members || [], loading, refetch: fetchDetails };
}

export function useUserRole(userId: string | undefined, workspaceId: string) {
  const [role, setRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN' | null>(null);
  
  useEffect(() => {
    if (!userId || !workspaceId) return;
    async function loadRole() {
      try {
        const r = await getUserRoleInWorkspace(userId!, workspaceId);
        setRole(r as any);
      } catch (e) {
        console.error(e);
      }
    }
    loadRole();
  }, [userId, workspaceId]);

  return role;
}
