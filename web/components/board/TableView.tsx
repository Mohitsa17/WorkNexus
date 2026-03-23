'use client';
import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/supabase/queries';
import { TaskRow } from './TaskRow';

type Props = {
  tasks: Task[];
  members: any[];
  role: string;
  onTaskClick: (id: string) => void;
  onNewTask: () => void;
};

const GROUP_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export function TableView({ tasks, members, role, onTaskClick, onNewTask }: Props) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const groups = useMemo(() => {
    const res: Record<string, Task[]> = {};
    const defaultGroup = 'General';
    tasks.forEach(t => {
      const g = t.group || defaultGroup;
      if (!res[g]) res[g] = [];
      res[g].push(t);
    });
    return res;
  }, [tasks]);

  return (
    <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-[#1e293b]">
      {/* Table Header */}
      <div className="sticky top-0 z-20 flex items-center h-10 bg-[#0c1525] border-b border-[#1e293b] text-[11px] font-[700] uppercase tracking-wider text-[#94a3b8] px-4 min-w-[1000px] shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
         <div className="w-[40px] shrink-0 text-center">✔</div>
         <div className="flex-1 min-w-[300px]">Task</div>
         <div className="w-[120px] shrink-0 text-center">Status</div>
         <div className="w-[110px] shrink-0 text-center">Priority</div>
         <div className="w-[140px] shrink-0 text-center">Assignee</div>
         <div className="w-[150px] shrink-0 text-center">Progress</div>
         <div className="w-[110px] shrink-0 text-center">Start Date</div>
         <div className="w-[110px] shrink-0 text-center">Due Date</div>
      </div>

      <div className="pb-24 min-w-[1000px]">
        {Object.entries(groups).map(([groupName, groupTasks], i) => {
          const isCollapsed = !!collapsedGroups[groupName];
          const color = GROUP_COLORS[i % GROUP_COLORS.length];

          return (
            <div key={groupName} className="mb-6">
              {/* Group Header */}
              <div 
                className="h-[38px] flex items-center bg-[#0a0e1a] border-b border-[#0f1929] px-2 sticky top-10 z-10 select-none group/header"
                onClick={() => toggleGroup(groupName)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: color }}></div>
                <div className="flex w-[40px] justify-center text-[#475569] hover:text-white cursor-pointer px-2 transition-colors">
                  {isCollapsed ? '▶' : '▼'}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#e2e8f0]" style={{ color }}>{groupName}</span>
                  <span className="text-[11px] font-semibold text-[#475569]">{groupTasks.length} tasks</span>
                </div>
              </div>

              {/* Group Rows */}
              {!isCollapsed && (
                <div className="flex flex-col">
                  {groupTasks.map(t => (
                    <TaskRow key={t.id} task={t} members={members} role={role} onClick={() => onTaskClick(t.id)} color={color} />
                  ))}
                  
                  {role !== 'VIEWER' && (
                    <div 
                      onClick={onNewTask}
                      className="h-[44px] flex items-center px-4 border-b border-[#0f1929] cursor-text hover:bg-[#0f1929] transition-colors overflow-hidden group/new"
                    >
                      <div className="absolute left-0 w-[4px] h-full" style={{ backgroundColor: color, opacity: 0.3 }}></div>
                      <div className="w-[40px] shrink-0 border-l-[3px] border-transparent"></div>
                      <div className="text-[13px] text-[#475569] font-medium group-hover/new:text-[#818cf8]">+ Add task</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Global Add Group Area */}
        {role !== 'VIEWER' && (
          <div className="px-6 py-4">
             <button onClick={onNewTask} className="px-5 py-2 rounded-lg border border-dashed border-[#334155] text-sm text-[#94a3b8] hover:text-white hover:border-[#6366f1] hover:bg-[#6366f115] transition-all font-semibold flex items-center gap-2">
               <span>+</span> Add new task or group
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
