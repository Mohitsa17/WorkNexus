'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTasksForProject, getMyTasks, getOverdueTasks, Task } from '@/lib/supabase/queries';

export function useTasks(projectId: string, filters?: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Convert filters object to a string dependency to avoid infinite loops if the object itself changes reference
  const filterString = JSON.stringify(filters || {});

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const parsedFilters = filterString ? JSON.parse(filterString) : undefined;
      const data = await getTasksForProject(projectId, parsedFilters);
      setTasks(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId, filterString]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, refetch: fetchTasks };
}

export function useMyTasks(userId: string | undefined, status?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMyTasks(userId, status);
      setTasks(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, refetch: fetchTasks };
}

export function useOverdueTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const data = await getOverdueTasks(userId!);
        setTasks(data as any);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [userId]);

  return { tasks };
}
