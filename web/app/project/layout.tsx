'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProjectLayoutInner>{children}</ProjectLayoutInner>
    </ToastProvider>
  );
}

function ProjectLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050810]">
        <div className="w-12 h-12 border-4 border-[#1e293b] border-t-[#6366f1] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#050810] overflow-hidden text-[#f1f5f9] font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden bg-[#050810]">
        {children}
      </main>
    </div>
  );
}
