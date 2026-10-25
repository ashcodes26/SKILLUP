import React, { useState } from 'react';
import { UserRole } from '../types';

interface FacultyHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onRoleSwitch?: (role: UserRole) => void;
  onSwitchRole?: () => void;
  facultyName?: string;
  department?: string;
  onLogout?: () => void;
}

export const FacultyHeader: React.FC<FacultyHeaderProps> = ({
  currentPath,
  onNavigate,
  onRoleSwitch,
  onSwitchRole,
  facultyName = 'Dr. S. Soundararajan',
  department = 'Directorate of Career Centre (CDC), SRMIST',
  onLogout,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Today 09:48 AM');

  const navLinks = [
    { id: 'admin-overview', label: 'Overview' },
    { id: 'admin-students', label: 'Students' },
    { id: 'admin-skill-analytics', label: 'Skill Analytics' },
    { id: 'admin-placement-drives', label: 'Placement Drives' },
    { id: 'admin-reviews-training', label: 'Reviews & Training' },
    { id: 'admin-reports', label: 'Reports' },
    { id: 'admin-import', label: 'Import' },
  ];

  const handleRefresh = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSyncText(`Today ${time}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0D0D0F]">
      {/* Top Main Navigation Bar */}
      <div className="h-16 w-full px-4 md:px-6 flex items-center justify-between border-b border-[#202023]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('admin-overview')}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#16161A] text-[#ffba35] border border-[#ffba35]/40 group-hover:border-[#ffba35] transition-colors">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">Skillup</span>
                <span className="text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#ffba35]/20 text-[#ffba35] border border-[#ffba35]/30">
                  CDC CONSOLE
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#9A9A9A] tracking-wider hidden xl:block leading-none">
                Directorate of Career Centre (CDC) — SRMIST Kattankulathur
              </span>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#16161A] text-white font-semibold border-b-2 border-[#8052ff]'
                      : 'text-[#9A9A9A] hover:text-white hover:bg-[#16161A]'
                  }`}
                >
                  {link.id === 'admin-skill-analytics' && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff]"></span>
                  )}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Cohort Tag, Profile, Avatar, Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Quick Screen Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#16161A] border border-[#363639] text-[#cdbdff] hover:text-white hover:border-[#8052ff] transition-colors flex items-center gap-1.5"
              title="Jump to any screen"
            >
              <span className="material-symbols-outlined text-[15px]">apps</span>
              <span className="hidden sm:inline font-medium">Screens</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0D0D0F] border border-[#363639] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider border-b border-[#202023]">
                  Faculty Console Screens
                </div>
                <button
                  onClick={() => { onNavigate('admin-overview'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>1. Faculty Overview</span>
                  <span className="text-[10px] text-[#8052ff]">Console</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-students'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>2. Student Roster & Detail</span>
                  <span className="text-[10px] text-[#78d8be]">Evals</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-skill-analytics'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>3. Skill Analytics</span>
                  <span className="text-[10px] text-[#ffba35]">Telemetry</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-placement-drives'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>4. Placement Drives</span>
                  <span className="text-[10px] text-[#8052ff]">Rules</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-reviews-training'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>5. Reviews & Training</span>
                  <span className="text-[10px] text-[#55C98B]">Queue</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-reports'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>6. Reports & Audit Manifest</span>
                  <span className="text-[10px] text-[#cdbdff]">Exports</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-import'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>7. Cohort CSV Ingestion</span>
                  <span className="text-[10px] text-[#78d8be]">Mapping</span>
                </button>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider border-y border-[#202023] mt-1">
                  Student Screens
                </div>
                <button
                  onClick={() => { onNavigate('career-plan'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>8. My Career Plan</span>
                  <span className="text-[10px] text-[#55C98B]">Roadmap</span>
                </button>
                <button
                  onClick={() => { onNavigate('resume-analyzer'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>9. Resume Analyzer</span>
                  <span className="text-[10px] text-[#cdbdff]">Split Diff</span>
                </button>
                <button
                  onClick={() => { onNavigate('job-search'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>10. Job Search & Matching</span>
                  <span className="text-[10px] text-[#78d8be]">SerpApi</span>
                </button>
                <button
                  onClick={() => { onNavigate('skill-demand'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>11. Skill-Demand Insights</span>
                  <span className="text-[10px] text-[#ffba35]">Radar & Trends</span>
                </button>
                <button
                  onClick={() => { onNavigate('placement-hub'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>12. Placement Hub</span>
                  <span className="text-[10px] text-[#55C98B]">Drives</span>
                </button>
                <button
                  onClick={() => { onNavigate('login'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-[#9A9A9A] hover:bg-[#16161A] hover:text-white border-t border-[#202023] mt-1"
                >
                  <span>Authentication / Login Screen</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16161A] border border-[#363639]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55C98B] animate-pulse"></span>
            <span className="text-xs text-[#9A9A9A]">Faculty Synthetic Cohort • Active</span>
          </div>

          <div className="hidden lg:flex flex-col text-right leading-none">
            <span className="text-xs font-semibold text-white">Dr. S. Soundararajan</span>
            <span className="text-[11px] text-[#ffba35]">Directorate of Career Centre (CDC) • SRMIST Kattankulathur</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#ffba35]/20 border border-[#ffba35]/40 text-[#ffba35] flex items-center justify-center font-bold text-xs shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>

          {/* Role Switcher Button */}
          <button
            onClick={() => onRoleSwitch ? onRoleSwitch('student') : onSwitchRole?.()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] hover:border-[#8052ff] text-xs font-medium transition-all"
            title="Switch to Student View"
          >
            <span className="material-symbols-outlined text-[15px] text-[#55C98B]">school</span>
            <span>Student View</span>
          </button>

          <button
            onClick={() => onLogout ? onLogout() : onNavigate('login')}
            className="p-1.5 rounded-lg text-[#9A9A9A] hover:text-white hover:bg-[#16161A] transition-colors"
            title="Log out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>

      {/* Sub-Shelf Secondary Header Bar */}
      <div className="h-12 w-full px-4 md:px-6 bg-[#131315] border-b border-[#202023] flex items-center justify-between text-sm overflow-x-auto">
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <div className="flex items-center gap-1.5 text-white shrink-0">
            <span className="material-symbols-outlined text-[#ffba35] text-[18px]">school</span>
            <span className="font-semibold text-xs sm:text-sm">B.Tech CSE — Batch 2026 (Section A)</span>
            <span className="text-xs text-[#55C98B] bg-[#16161A] px-2 py-0.5 rounded border border-[#202023] font-mono font-bold">
              45 Candidates • Avg CGPA 8.42
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#9A9A9A] text-xs shrink-0">
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <span>Dept: All CS</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#16161A] shrink-0 border border-[#202023]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55C98B]"></span>
            <span className="text-xs text-[#55C98B] font-medium">Active Placement Drive</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[#9A9A9A] text-xs shrink-0">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Last sync: {lastSyncText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded bg-[#16161A] hover:bg-[#201f21] text-[#9A9A9A] hover:text-white border border-[#202023] transition-colors flex items-center justify-center cursor-pointer"
            title="Refresh sync metrics"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
          <button
            onClick={() => onNavigate('admin-placement-drives')}
            className="px-2.5 py-1 rounded bg-[#8052ff] text-white hover:opacity-95 text-xs font-medium transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>Create Cohort</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default FacultyHeader;
