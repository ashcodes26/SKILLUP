import React, { useState } from 'react';
import { UserRole } from '../types';

interface StudentHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onRoleSwitch?: (role: UserRole) => void;
  onSwitchRole?: () => void;
  studentId?: string;
  studentName?: string;
  onLogout?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  currentPath,
  onNavigate,
  onRoleSwitch,
  onSwitchRole,
  studentId = '#STU-2026-88',
  studentName = 'Alex R. Mercer',
  onLogout,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const navLinks = [
    { id: 'career-plan', label: 'My Career Plan', icon: 'flag' },
    { id: 'skill-demand', label: 'Market Radar', icon: 'radar' },
    { id: 'resume-analyzer', label: 'Resume & LinkedIn', icon: 'description' },
    { id: 'job-search', label: 'Opportunities', icon: 'travel_explore' },
    { id: 'placement-hub', label: 'Placement Hub', icon: 'corporate_fare' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0F] border-b border-[#202023]">
      <div className="h-16 max-w-[1280px] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => onNavigate('career-plan')}
            className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded bg-[#16161A] border border-[#363639] flex items-center justify-center text-[#8052ff] group-hover:border-[#8052ff] transition-colors">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              Skill<span className="text-[#cdbdff]">up</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.id ||
                (link.id === 'resume-analyzer' && (currentPath === 'resume-analyzer' || currentPath === 'linkedin-optimizer'));

              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`py-2 text-sm transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-white border-b-2 border-[#8052ff] font-semibold'
                      : 'text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Demo Mode, Student Credential, Avatar, Actions */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Quick Screen Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#16161A] border border-[#363639] text-[#cdbdff] hover:text-white hover:border-[#8052ff] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              title="Jump to any screen"
            >
              <span className="material-symbols-outlined text-[15px]">apps</span>
              <span className="hidden sm:inline font-medium">Screens</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0D0D0F] border border-[#363639] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider border-b border-[#202023]">
                  Student Screens (AIMORA)
                </div>
                <button
                  onClick={() => { onNavigate('career-plan'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>1. My Career Plan &amp; Evidence</span>
                  <span className="text-[10px] text-[#55C98B]">Roadmap</span>
                </button>
                <button
                  onClick={() => { onNavigate('skill-demand'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>2. Market Radar &amp; Priority Engine</span>
                  <span className="text-[10px] text-[#ffba35]">Multi-Role</span>
                </button>
                <button
                  onClick={() => { onNavigate('resume-analyzer'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>3. Resume Analyzer &amp; Diff Stream</span>
                  <span className="text-[10px] text-[#cdbdff]">Split Diff</span>
                </button>
                <button
                  onClick={() => { onNavigate('linkedin-optimizer'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>4. LinkedIn Profile Optimizer</span>
                  <span className="text-[10px] text-[#78d8be]">Diagnostic</span>
                </button>
                <button
                  onClick={() => { onNavigate('job-search'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>5. Job Search &amp; Matching</span>
                  <span className="text-[10px] text-[#78d8be]">Provenance</span>
                </button>
                <button
                  onClick={() => { onNavigate('placement-hub'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>6. Placement Hub &amp; Assessments</span>
                  <span className="text-[10px] text-[#55C98B]">Drives</span>
                </button>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider border-y border-[#202023] mt-1">
                  Faculty Console Screens
                </div>
                <button
                  onClick={() => { onNavigate('admin-overview'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>6. Faculty Overview</span>
                  <span className="text-[10px] text-[#8052ff]">Console</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-students'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>7. Student Roster & Detail</span>
                  <span className="text-[10px] text-[#78d8be]">Evals</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-skill-analytics'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>8. Skill Analytics</span>
                  <span className="text-[10px] text-[#ffba35]">Telemetry</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-placement-drives'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>9. Placement Drives</span>
                  <span className="text-[10px] text-[#8052ff]">Rules</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-reviews-training'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>10. Reviews & Training</span>
                  <span className="text-[10px] text-[#55C98B]">Queue</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-reports'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>11. Reports & Audit Manifest</span>
                  <span className="text-[10px] text-[#cdbdff]">Exports</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-import'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>12. Cohort CSV Ingestion</span>
                  <span className="text-[10px] text-[#78d8be]">Mapping</span>
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

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16161A] border border-[#363639] text-xs text-[#9A9A9A]">
            <span className="w-2 h-2 rounded-full bg-[#ffba35] animate-pulse"></span>
            <span className="text-white font-medium">Demo Mode</span>
          </div>

          <div className="hidden lg:flex flex-col text-right leading-none">
            <span className="text-xs font-semibold text-white">#STU-2026-88</span>
            <span className="text-[11px] text-[#9A9A9A]">Computer Science</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#cdbdff] text-[#370095] flex items-center justify-center font-bold text-xs shrink-0">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>

          {/* Role Switcher Button */}
          <button
            onClick={() => onRoleSwitch ? onRoleSwitch('faculty') : onSwitchRole?.()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] hover:border-[#8052ff] text-xs font-medium transition-all"
            title="Switch to Faculty View"
          >
            <span className="material-symbols-outlined text-[15px] text-[#8052ff]">swap_horiz</span>
            <span>Faculty View</span>
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
    </header>
  );
};

export default StudentHeader;
