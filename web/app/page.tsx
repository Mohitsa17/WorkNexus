'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Simple pure CSS particles
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
    return (
      <div 
        key={i} 
        className="absolute rounded-full"
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

  const CountUp = ({ end, suffix = '', visible }: { end: number, suffix?: string, visible: boolean }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (!visible) return;
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16.66);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16.66);
      return () => clearInterval(timer);
    }, [end, visible]);
    return <span>{count.toLocaleString()}{suffix}</span>;
  };

  return (
    <div className="min-h-screen bg-[#050810] text-[#f1f5f9] overflow-x-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#6366f1] opacity-[0.05] blur-[100px] animate-drift"></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[#8b5cf6] opacity-[0.04] blur-[100px] animate-drift" style={{ animationDuration: '18s' }}></div>
        <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#10b981] opacity-[0.03] blur-[100px] animate-drift" style={{ animationDuration: '12s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        {mounted && particles}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050810d9] backdrop-blur-md border-b border-[#1e293b]' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-6 h-[80px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                ⬡
              </div>
              <span className="text-[18px] font-[800] text-white tracking-tight">WorkNexus</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-[13px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors font-medium">Features</Link>
              <Link href="#how-it-works" className="text-[13px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors font-medium">How it Works</Link>
              <Link href="#pricing" className="text-[13px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors font-medium">Pricing</Link>
              <Link href="#footer" className="text-[13px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors font-medium">Changelog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-[#f1f5f9] hover:text-white transition-colors">Log in</Link>
              <Link href="/login" className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105">
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-[180px] pb-[80px] px-6 text-center max-w-5xl mx-auto w-full">
          <div className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-2 border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></div>
              ✦ Trusted by 10,000+ teams worldwide
            </div>
          </div>
          
          <h1 className="text-[36px] sm:text-[64px] font-[800] leading-[1.1] tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            The Modern Workspace<br />
            for <span className="bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-fill-transparent text-transparent">High-Performance Teams</span>
          </h1>
          
          <p className="text-[16px] sm:text-[18px] text-[#94a3b8] max-w-2xl mx-auto leading-[1.7] mb-12 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Stop juggling spreadsheets and endless email threads. WorkNexus brings your projects, tasks, and team into one beautifully organized workspace.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <div className="flex flex-col items-center">
              <Link href="/login" className="group flex items-center gap-2 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-[32px] py-[16px] rounded-[14px] text-[16px] font-[700] text-white shadow-[0_0_40px_rgba(99,102,241,0.25)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-[1.03] transition-all duration-300">
                Get Started Free 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <span className="text-[11px] text-[#475569] mt-2 font-medium">No credit card required · Free forever plan</span>
            </div>
            <div>
              <Link href="#features" className="group flex items-center gap-2 bg-transparent border border-[#334155] px-[28px] py-[16px] rounded-[14px] text-[15px] font-[600] text-[#94a3b8] hover:bg-[#1e293b] hover:border-[#6366f1] hover:text-white transition-all duration-300">
                Watch Demo <span className="text-[#6366f1] group-hover:animate-pulse">▶</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-16 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
            <div className="flex items-center">
              {['MS', 'PP', 'AS', 'NG', 'RK'].map((initials, i) => {
                const colors = ['bg-[#6366f1]', 'bg-[#ec4899]', 'bg-[#f59e0b]', 'bg-[#10b981]', 'bg-[#3b82f6]'];
                return (
                  <div key={i} className={`w-8 h-8 rounded-full ${colors[i]} border-2 border-[#050810] flex items-center justify-center text-[10px] font-bold text-white ${i !== 0 ? '-ml-2' : ''} shadow-lg z-${10-i} relative`}>
                    {initials}
                  </div>
                );
              })}
            </div>
            <div className="text-[#94a3b8] text-[13px] font-medium">Join 10,000+ teams</div>
            <div className="text-[#fbbf24] text-[14px] tracking-[1px]">★★★★★</div>
            <div className="text-[#475569] text-[12px] font-medium">4.9/5 from 2,400+ reviews</div>
          </div>

          {/* Hero Dashboard Mockup */}
          <div className="mt-20 max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0c1525] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-fade-in-up transform translate-y-10" style={{ animationDelay: '800ms', animationDuration: '800ms', animationFillMode: 'both' }}>
            {/* Top bar */}
            <div className="h-8 bg-[#080d18] flex items-center px-4 gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
              </div>
              <div className="mx-auto bg-white/5 rounded-md px-4 py-0.5 text-[10px] text-[#475569] font-mono">app.worknexus.com/projects</div>
              <div className="w-10"></div>
            </div>
            
            {/* App Layout */}
            <div className="flex h-[400px]">
              {/* Sidebar */}
              <div className="w-[200px] hidden md:flex flex-col bg-[#050810] border-r border-white/5 p-4 text-left">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-5 h-5 rounded-[4px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-[10px] font-bold text-white">⬡</div>
                  <span className="text-sm font-bold">WorkNexus</span>
                </div>
                <div className="flex flex-col gap-3 text-[13px] text-[#94a3b8] mb-8 font-medium">
                  <div className="flex items-center gap-2 hover:text-white cursor-default px-2 py-1.5 rounded-md hover:bg-white/5"><span className="text-[#6366f1]">⌂</span> Home</div>
                  <div className="flex items-center gap-2 hover:text-white cursor-default px-2 py-1.5 rounded-md hover:bg-white/5"><span>✓</span> My Work</div>
                  <div className="flex items-center justify-between cursor-default px-2 py-1.5 rounded-md hover:bg-white/5">
                    <span className="flex items-center gap-2"><span>📥</span> Inbox</span>
                    <span className="bg-[#6366f1] text-white text-[10px] px-1.5 rounded-full">3</span>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-3 px-2">Acme Agency</div>
                <div className="flex flex-col gap-2 text-[13px] text-[#94a3b8]">
                  <div className="flex items-center gap-2 px-2 pb-1"><div className="w-2 h-2 rounded-full bg-[#ec4899]"></div> Marketing Site</div>
                  <div className="flex items-center gap-2 px-2 pb-1 text-white bg-white/5 rounded-md py-1 -mx-2"><div className="w-2 h-2 rounded-full bg-[#6366f1]"></div> App Redesign</div>
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 bg-[#0c1525] p-6 text-left relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">App Redesign Q3</h3>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 -ml-2 border border-[#0c1525]"></div>
                    <div className="w-6 h-6 rounded-full bg-white/10 -ml-2 border border-[#0c1525]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#6366f1] -ml-2 border border-[#0c1525] flex items-center justify-center text-[10px]">+2</div>
                  </div>
                </div>

                <div className="w-full text-[13px] border border-white/5 rounded-lg overflow-hidden">
                  <div className="flex bg-[#080d18] border-b border-white/5 py-2 px-4 text-[#475569] font-medium text-xs">
                    <div className="w-8"></div>
                    <div className="flex-1">Task</div>
                    <div className="w-24">Status</div>
                    <div className="w-24">Priority</div>
                    <div className="w-[100px]">Progress</div>
                  </div>
                  
                  {[
                    { task: 'Homepage redesign', status: 'Working', priority: 'Urgent', color: '#3b82f6', pColor: '#ef4444' },
                    { task: 'API integration', status: 'Done', priority: 'High', color: '#10b981', pColor: '#f59e0b' },
                    { task: 'User testing config', status: 'Todo', priority: 'Medium', color: '#475569', pColor: '#fbbf24' },
                    { task: 'Database migration scripts', status: 'Working', priority: 'High', color: '#3b82f6', pColor: '#f59e0b' },
                    { task: 'Update billing models', status: 'Todo', priority: 'Low', color: '#475569', pColor: '#94a3b8' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center border-b border-white/5 py-3 px-4 hover:bg-white/[0.02]">
                      <div className="w-8"><div className="w-4 h-4 rounded border border-[#334155]"></div></div>
                      <div className="flex-1 text-[#f1f5f9] font-medium truncate pr-4">{row.task}</div>
                      <div className="w-24">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ backgroundColor: `${row.color}20`, color: row.color }}>{row.status}</span>
                      </div>
                      <div className="w-24">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ color: row.pColor }}>{row.priority}</span>
                      </div>
                      <div className="w-[100px] flex items-center">
                        <div className="h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: row.status === 'Done' ? '100%' : row.status === 'Working' ? '45%' : '0%', backgroundColor: row.color }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Fade out bottom overlay */}
                <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#050810] to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Section */}
        <section className="bg-[#080d18] border-y border-white/5 py-[18px] overflow-hidden whitespace-nowrap flex items-center">
          <div className="pl-6 text-[#475569] text-[12px] uppercase tracking-[0.1em] font-bold shrink-0 z-10 bg-[#080d18] pr-4">
            Trusted by teams at
          </div>
          <div className="flex animate-marquee items-center ml-4">
            {[1, 2].map((group) => (
              <div key={group} className="flex gap-8 items-center px-4 shrink-0">
                {['Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'GitHub', 'Shopify', 'Atlassian'].map((company, i) => (
                  <div key={company + group} className="flex items-center gap-2 text-[#475569] text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][i % 5] }}></div>
                    {company}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-20 reveal">
            <div className="inline-block border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Powerful Features
            </div>
            <h2 className="text-[32px] sm:text-[48px] font-[800] mb-6 tracking-tight">Everything your team needs</h2>
            <p className="text-[#94a3b8] text-[18px] max-w-2xl mx-auto leading-relaxed">
              From task assignment to real-time collaboration, WorkNexus has every tool your team needs to deliver exceptional work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '✅', color: '#10b981', title: 'Smart Task Management', desc: 'Create, assign, and track tasks with custom statuses, priorities, deadlines, and tracking. Never lose sight of what matters.' },
              { icon: '👥', color: '#3b82f6', title: 'Team Collaboration', desc: 'Invite members with role-based permissions (Viewer, Editor, Admin). Comment on tasks, @mention teammates, and track all activity.' },
              { icon: '📊', color: '#8b5cf6', title: 'Multiple Views', desc: 'Switch between Table, Kanban board, and Timeline (Gantt) views instantly. See your work exactly the way you think.' },
              { icon: '⚡', color: '#f59e0b', title: 'Real-time Updates', desc: 'See task changes, comments, and status updates live as they happen. No more refreshing. Powered by Supabase Realtime.' },
              { icon: '🔔', color: '#ec4899', title: 'Smart Notifications', desc: 'Get notified about what matters — task assignments, comments, deadline reminders, and invites. In-app and email.' },
              { icon: '🛡', color: '#6366f1', title: 'Role-Based Access', desc: 'Admins control everything. Editors create and manage tasks. Viewers stay in the loop without making changes. Your data stays safe.' },
            ].map((f, i) => (
              <div key={i} className="group flex flex-col items-start bg-[#0c1525] border border-[#1e293b] rounded-2xl p-7 hover:border-[color:var(--hover-color)] hover:bg-[#0f1a2e] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 reveal cursor-default transform hover:-translate-y-1" style={{ '--hover-color': f.color } as any}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-6 relative group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${f.color}20`, boxShadow: `0 0 20px ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-[#94a3b8] text-[15px] leading-relaxed mb-6 flex-1">{f.desc}</p>
                <div className="w-full h-12 rounded-lg bg-[#050810] border border-white/5 mt-auto overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[#475569] font-mono tracking-widest uppercase bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-[length:10px_10px]">
                    Interactive Preview
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-white/5">
          <div className="text-center mb-20 reveal">
            <div className="inline-block border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Simple Setup
            </div>
            <h2 className="text-[32px] sm:text-[48px] font-[800] mb-6 tracking-tight">Up and running in minutes</h2>
            <p className="text-[#94a3b8] text-[18px] max-w-2xl mx-auto leading-relaxed">
              No complex configuration. No lengthy onboarding. Just sign in and start getting work done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#334155] to-transparent z-0"></div>
            
            {[
              { num: '01', icon: '🔐', title: 'Sign In with Google', desc: 'One click with your Google account. Your profile is set up automatically. No forms, no passwords.', color: '#6366f1', from: '#6366f1', to: '#8b5cf6' },
              { num: '02', icon: '🏢', title: 'Create Your Workspace', desc: 'Set up a workspace for your company or team. Invite members by email and assign roles in seconds.', color: '#8b5cf6', from: '#8b5cf6', to: '#ec4899' },
              { num: '03', icon: '✅', title: 'Build & Ship Projects', desc: 'Create projects, break them into tasks, assign owners, set deadlines, and track progress across every view.', color: '#10b981', from: '#10b981', to: '#3b82f6' },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center bg-[#0c1525] border border-[#1e293b] rounded-2xl p-8 text-center bg-clip-border hover:border-[#334155] transition-colors reveal overflow-hidden">
                <div className="absolute -top-6 -right-4 text-[120px] font-black opacity-[0.03] select-none" style={{ color: step.color }}>{step.num}</div>
                <div className="w-16 h-16 rounded-2xl bg-[#050810] border border-[#1e293b] flex items-center justify-center text-2xl mb-8 relative z-10 shadow-lg" style={{ boxShadow: `0 10px 30px ${step.color}20` }}>
                  {step.icon}
                </div>
                <div className={`text-[40px] font-[800] mb-4 bg-gradient-to-br bg-clip-text text-fill-transparent text-transparent`} style={{ backgroundImage: `linear-gradient(135deg, ${step.from}, ${step.to})` }}>{step.num}</div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-[#94a3b8] text-[15px] leading-relaxed mb-6">{step.desc}</p>
                {i === 0 && (
                  <Link href="/login" className="text-[#818cf8] font-semibold text-sm hover:underline mt-auto pb-1">Start for free →</Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Stats Bar */}
        <section ref={statsRef} className="my-16 border-y border-[#1e293b] bg-gradient-to-br from-[#6366f108] to-[#8b5cf608] py-[60px]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 reveal">
            {[
              { val: 10000, suf: '+', label: 'Teams using WorkNexus' },
              { val: 2.4, suf: 'M+', label: 'Tasks completed this month' },
              { val: 99.9, suf: '%', label: 'Uptime guaranteed' },
              { val: 2, suf: 'min', label: '< Average setup time' }, // tricky parsing, simply showing 2 then min
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4 relative">
                {i !== 0 && <div className="hidden md:block absolute left-0 top-1/4 h-1/2 w-[1px] bg-[#1e293b]"></div>}
                <div className="text-[36px] md:text-[48px] font-[800] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] bg-clip-text text-fill-transparent text-transparent mb-2">
                  {i === 3 ? '< ' : ''}
                  <CountUp end={stat.val} suffix={stat.suf} visible={statsVisible} />
                </div>
                <div className="text-[14px] text-[#94a3b8] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16 reveal">
            <div className="inline-block border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Testimonials
            </div>
            <h2 className="text-[32px] sm:text-[48px] font-[800] tracking-tight">Loved by teams everywhere</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[
              { initials: 'SR', color: '#6366f1', name: 'Sarah Reynolds', role: 'Engineering Manager at Stripe', quote: "WorkNexus completely replaced our Jira + Trello setup. The UI is stunning, the kanban board is buttery smooth, and our team adoption was instant. Best tool we've used in years." },
              { initials: 'AK', color: '#8b5cf6', name: 'Aryan Kapoor', role: 'Product Lead at Razorpay', quote: "I've tried Monday, Asana, ClickUp — WorkNexus beats them all. The timeline view is gorgeous and real-time collaboration just works. Our remote team finally feels in sync.", featured: true },
              { initials: 'ML', color: '#10b981', name: 'Maria Laurent', role: 'Operations Director at TBWA', quote: "We onboarded 40 people in one afternoon. The role permissions are exactly what an agency needs. Clients get Viewer access, our team gets full Editor rights." },
            ].map((t, i) => (
              <div key={i} className={`relative bg-[#0c1525] border border-[#1e293b] rounded-2xl p-8 reveal ${t.featured ? 'md:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-[#334155]' : ''}`}>
                <div className="absolute top-4 right-6 text-[80px] leading-none font-serif text-[#6366f1] opacity-[0.15]">"</div>
                {t.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">Most Helpful</div>}
                <div className="text-[#fbbf24] text-lg mb-6">★★★★★</div>
                <p className="text-[#f1f5f9] text-[15px] leading-relaxed mb-8 relative z-10">{t.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-[12px]" style={{ backgroundColor: t.color }}>{t.initials}</div>
                  <div>
                    <div className="font-bold text-[14px]">{t.name}</div>
                    <div className="text-[#94a3b8] text-[12px]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12 reveal">
            <div className="inline-block border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Pricing
            </div>
            <h2 className="text-[32px] sm:text-[48px] font-[800] tracking-tight mb-4">Simple, honest pricing</h2>
            <p className="text-[#94a3b8] text-[18px]">Start free. Scale as you grow. Cancel anytime.</p>
          </div>

          <div className="flex justify-center items-center gap-4 mb-16 reveal">
            <span className={`text-[14px] font-medium ${!billingAnnual ? 'text-white' : 'text-[#94a3b8]'}`}>Monthly</span>
            <button 
              onClick={() => setBillingAnnual(!billingAnnual)} 
              className="w-12 h-6 rounded-full bg-[#1e293b] relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              style={{ padding: '2px' }}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${billingAnnual ? 'translate-x-6 bg-[#6366f1]' : ''}`}></div>
            </button>
            <span className={`text-[14px] font-medium flex items-center gap-2 ${billingAnnual ? 'text-white' : 'text-[#94a3b8]'}`}>
              Annual <span className="text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full uppercase">Save 20%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Free Tier */}
            <div className="bg-[#0c1525] border border-[#1e293b] rounded-3xl p-8 reveal">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-[#94a3b8] text-[13px] h-10 mb-6">Perfect for individuals and small teams</p>
              <div className="text-[48px] font-bold mb-8">$0<span className="text-[15px] font-medium text-[#475569]">/month</span></div>
              <Link href="/login" className="block w-full text-center border border-[#334155] hover:bg-[#1e293b] text-white py-3 rounded-xl font-semibold text-sm transition-colors mb-8">
                Get Started Free
              </Link>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Up to 3 workspaces</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Up to 5 members per workspace</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Unlimited tasks</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Table + Kanban views</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Basic notifications</div>
                <div className="flex gap-3 text-[#475569] line-through"><span className="text-[#475569]">✗</span> Timeline view</div>
                <div className="flex gap-3 text-[#475569]"><span className="text-[#475569]">✗</span> Real-time collaboration</div>
                <div className="flex gap-3 text-[#475569]"><span className="text-[#475569]">✗</span> Priority support</div>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#0c1525] border border-[#6366f1] rounded-3xl p-8 reveal relative shadow-[0_0_40px_rgba(99,102,241,0.2)] md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-[10px] uppercase font-bold px-4 py-1.5 rounded-full tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-[#818cf8] text-[13px] h-10 mb-6">For growing teams that need full power</p>
              <div className="text-[48px] font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-br from-[#f1f5f9] to-[#94a3b8]">${billingAnnual ? Math.floor(12 * 0.8) : 12}<span className="text-[15px] font-medium text-[#475569]">/seat/month</span></div>
              <Link href="/login" className="block w-full text-center bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white py-3 rounded-xl font-bold text-sm transition-all mb-8">
                Start 14-day Free Trial
              </Link>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Unlimited workspaces</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Unlimited members</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Unlimited tasks</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Table, Kanban + Timeline</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Real-time collaboration</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Email notifications + @mentions</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Activity logs</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Priority email support</div>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-[#0c1525] border border-[#1e293b] rounded-3xl p-8 reveal">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-[#94a3b8] text-[13px] h-10 mb-6">For large organizations with custom needs</p>
              <div className="text-[36px] font-bold mb-[38px]">Custom<span className="text-[15px] font-medium text-[#475569]">/annually</span></div>
              <Link href="/login" className="block w-full text-center border border-[#334155] hover:bg-[#1e293b] text-white py-3 rounded-xl font-semibold text-sm transition-colors mb-8">
                Contact Sales →
              </Link>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex gap-3 font-semibold"><span className="text-[#10b981]">✓</span> Everything in Pro, plus:</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> SSO / SAML login</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Custom roles & permissions</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Dedicated Slack support</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> SLA guarantee</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> On-premise option</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Custom integrations</div>
                <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Audit logs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 max-w-5xl mx-auto w-full reveal">
          <div className="relative border border-[#1e293b] rounded-[24px] p-[80px_48px] bg-[linear-gradient(135deg,#0c1a2e_0%,#0c1525_50%,#0a0e1a_100%)] overflow-hidden text-center z-10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 animate-gradient-shift pointer-events-none -z-10 blur-3xl"></div>
            
            <h2 className="text-[36px] sm:text-[48px] font-[800] tracking-tight mb-6">Ready to transform how your team works?</h2>
            <p className="text-[#94a3b8] text-[18px] max-w-xl mx-auto mb-10">
              Join 10,000+ teams already using WorkNexus. Free forever. No credit card needed.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Link href="/login" className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-8 py-4 rounded-xl text-[16px] font-[700] text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 transition-all">
                Get Started Free →
              </Link>
              <Link href="#features" className="bg-[#1e293b] border border-[#334155] px-8 py-4 rounded-xl text-[16px] font-[600] text-white hover:bg-[#334155] transition-colors">
                See a live demo
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="flex">
                {['bg-[#6366f1]', 'bg-[#ec4899]', 'bg-[#10b981]', 'bg-[#f59e0b]', 'bg-[#3b82f6]'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#0c1525] -ml-2`} />
                ))}
              </div>
              <span className="text-[#94a3b8] text-sm font-medium">Join them today</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="footer" className="bg-[#050810] border-t border-[#1e293b] pt-[48px] pb-[24px] px-6 mt-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-[40px]">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-[10px] text-white">⬡</div>
                <span className="text-[16px] font-[800] text-white tracking-tight">WorkNexus</span>
              </div>
              <p className="text-[#94a3b8] text-[13px] mb-8">Where teams get things done.</p>
              <p className="text-[#475569] text-[12px] font-medium">Built with ❤ in India</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 text-sm">Product</h4>
              <div className="flex flex-col gap-3 text-[13px] text-[#94a3b8]">
                <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                <Link href="#" className="hover:text-white transition-colors">Changelog</Link>
                <Link href="#" className="hover:text-white transition-colors">Roadmap</Link>
                <Link href="#" className="hover:text-white transition-colors">Integrations</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 text-sm">Company</h4>
              <div className="flex flex-col gap-3 text-[13px] text-[#94a3b8]">
                <Link href="#" className="hover:text-white transition-colors">About</Link>
                <Link href="#" className="hover:text-white transition-colors">Blog</Link>
                <Link href="#" className="hover:text-white transition-colors">Careers</Link>
                <Link href="#" className="hover:text-white transition-colors">Press</Link>
                <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
              <div className="flex flex-col gap-3 text-[13px] text-[#94a3b8]">
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Security</Link>
                <Link href="#" className="hover:text-white transition-colors">GDPR</Link>
              </div>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto border-t border-[#0f1929] pt-[24px] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[#475569] text-[13px]">© 2025 WorkNexus. All rights reserved.</div>
            <div className="flex gap-4">
              {['Twitter/X', 'GitHub', 'LinkedIn'].map((s, i) => (
                <Link key={i} href="#" className="text-[#475569] hover:text-white text-[13px] transition-colors">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
