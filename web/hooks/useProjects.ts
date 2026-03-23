'use client';
import { useState, useEffect, useCallback } from 'react';
import { getProjectsInWorkspace, getProject, Project } from '@/lib/supabase/queries';

export function useProjects(workspaceId: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!workspaceId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getProjectsInWorkspace(workspaceId);
      setProjects(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    async function load() {
      try {
        const p = await getProject(projectId);
        setProject(p as any);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  return { project, loading };
}
