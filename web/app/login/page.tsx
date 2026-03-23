'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const supabase = createClient();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithGoogle = async () => {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: {
          prompt: 'consent' // Forces Google to show the account selection screen
        }
      }
    });
    // no need to set loading false, typically redirect happens
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    // Real implementation would be here
    setTimeout(() => {
      setLoadingEmail(false);
      alert('Email sign-in is not configured yet. Please use Google Auth.');
    }, 1500);
  };

  const particles = Array.from({ length: 15 }).map((_, i) => {
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
    return (
      <div 
        key={i} 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: `${Math.random() * 3 + 2}px`,
          height: `${Math.random() * 3 + 2}px`,
          left: `${Math.random() * 100}%`,
          bottom: `-20px`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.4 + 0.2,
          animation: `floatUp ${Math.random() * 12 + 8}s linear infinite`,
          animationDelay: `${Math.random() * 10}s`
        }}
      />
    );
  });

  return (
    <div className="min-h-screen bg-[#050810] text-[#f1f5f9] flex overflow-hidden font-sans relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#6366f1] opacity-[0.05] blur-[100px] animate-drift"></div>
        {mounted && particles}
      </div>

      {/* Left Area (Login Form) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center relative z-10 px-6 p-8 h-screen overflow-y-auto">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            ⬡
          </div>
          <span className="text-[18px] font-[800] text-white tracking-tight">WorkNexus</span>
        </div>

        <div className="w-full max-w-[420px] bg-[#0c1525] border border-[#1e293b] rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-fade-in-up">
          <h1 className="text-[24px] font-[800] text-white text-center mb-2">Welcome back</h1>
          <p className="text-[#94a3b8] text-[15px] text-center mb-8">Sign in to your workspace</p>

          <button 
            onClick={signInWithGoogle}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#0f172a] h-[52px] rounded-[14px] font-[600] text-[15px] hover:shadow-lg hover:bg-gray-50 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingGoogle ? (
              <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="h-[1px] flex-1 bg-[#1e293b]"></div>
            <span className="text-[#475569] text-[12px] font-medium uppercase tracking-wider">or continue with email</span>
            <div className="h-[1px] flex-1 bg-[#1e293b]"></div>
          </div>

          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050810] border border-[#334155] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050810] border border-[#334155] rounded-xl pl-4 pr-11 py-3 text-[14px] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-colors"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            
            <div className="flex justify-end mt-1">
              <Link href="#" className="text-[#818cf8] text-[12px] hover:underline font-medium">Forgot password?</Link>
            </div>

            <button 
              type="submit"
              disabled={loadingEmail}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white h-[52px] rounded-[14px] font-[700] text-[15px] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loadingEmail ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-[#475569] text-[13px] mt-8">
            Don't have an account? <Link href="#" className="text-[#818cf8] hover:underline font-medium">Sign up free</Link>
          </p>
        </div>
      </div>

      {/* Right Area (Hero Graphic - Only Desktop) */}
      <div className="hidden lg:flex w-[40%] bg-[#080d18] relative overflow-hidden items-center justify-center border-l border-[#1e293b]">
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ec4899] opacity-[0.03] blur-[100px] animate-drift"></div>

        {/* Dashboard Mockup - rotated */}
        <div className="relative w-[800px] h-[500px] rounded-2xl bg-[#0c1525] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] transform rotate-[-8deg] ml-[20%] scale-110 opacity-70">
          <div className="h-8 bg-[#080d18] flex items-center px-4 gap-2 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
            </div>
          </div>
          <div className="flex h-full p-4 gap-4">
            <div className="w-[150px] flex flex-col gap-2">
              <div className="h-4 bg-white/5 rounded-md w-full"></div>
              <div className="h-4 bg-white/5 rounded-md w-3/4"></div>
              <div className="h-4 bg-white/5 rounded-md w-5/6"></div>
              <div className="mt-8 h-8 bg-white/5 rounded-md w-full"></div>
              <div className="h-8 bg-white/5 rounded-md w-full mt-2"></div>
            </div>
            <div className="flex-1 border border-white/5 rounded-xl overflow-hidden flex flex-col">
              <div className="h-10 border-b border-white/5 flex items-center px-4"><div className="w-32 h-4 bg-white/10 rounded"></div></div>
              <div className="flex-1 p-4 flex flex-col gap-3">
                 {[1,2,3,4,5].map(i => <div key={i} className="h-12 border border-white/5 rounded-lg bg-white/[0.02]"></div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Pills */}
        <div className="absolute top-[25%] left-[5%] transform rotate-[4deg] bg-[#10b981]/10 border border-[#10b981]/30 backdrop-blur-md text-[#34d399] px-5 py-2.5 rounded-full text-sm font-semibold animate-fade-in-up flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.15)]" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div>✅</div> Tasks assigned
        </div>
        
        <div className="absolute top-[40%] right-[20%] transform rotate-[-3deg] bg-[#6366f1]/10 border border-[#6366f1]/30 backdrop-blur-md text-[#818cf8] px-5 py-2.5 rounded-full text-sm font-semibold animate-fade-in-up flex items-center gap-2 shadow-[0_10px_30px_rgba(99,102,241,0.15)] z-20" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <div>🔔</div> 3 new notifications
        </div>
        
        <div className="absolute bottom-[35%] left-[8%] transform rotate-[2deg] bg-[#3b82f6]/10 border border-[#3b82f6]/30 backdrop-blur-md text-[#60a5fa] px-5 py-2.5 rounded-full text-sm font-semibold animate-fade-in-up flex items-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.15)] z-20" style={{ animationDelay: '900ms', animationFillMode: 'both' }}>
          <div>👥</div> Sarah joined your workspace
        </div>
        
        <div className="absolute bottom-[20%] right-[15%] transform rotate-[-5deg] bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 backdrop-blur-md text-[#a78bfa] px-5 py-2.5 rounded-full text-sm font-semibold animate-fade-in-up flex items-center gap-2 shadow-[0_10px_30px_rgba(139,92,246,0.15)] z-20" style={{ animationDelay: '1200ms', animationFillMode: 'both' }}>
          <div>📊</div> Project 85% complete
        </div>

      </div>
    </div>
  );
}