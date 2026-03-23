'use client';
import { useState, useEffect } from 'react';
import { getCurrentUser, User } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          loadUser();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
