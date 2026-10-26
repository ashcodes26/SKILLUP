import React, { useState } from 'react';
import { UserRole } from '../types';

interface StudentHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onRoleSwitch?: (role: UserRole) => void;
  onSwitchRole?: () => void;
  studentId?: string;
  studentName?: string;
  studentCgpa?: number;
  onLogout?: () => void;
  dataMode?: 'demo' | 'custom' | 'clean';
  onLoadDemoData?: () => void;
  onResetCleanState?: () => void;
  onUploadClick?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  currentPath,
  onNavigate,
  onRoleSwitch,
  onSwitchRole,
  studentId = '',
  studentName = '',
  studentCgpa = 0,
  onLogout,
  dataMode = 'clean',
  onLoadDemoData,
  onResetCleanState,
  onUploadClick,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navLinks = [
    { id: 'career-plan', label: 'Career Plan', shortLabel: 'Plan', icon: 'flag' },
    { id: 'skill-demand', label: 'Market Radar', shortLabel: 'Radar', icon: 'radar' },
    { id: 'resume-analyzer', label: 'Career Assets', shortLabel: 'Assets', icon: 'description' },
    { id: 'job-search', label: 'Opportunities', shortLabel: 'Jobs', icon: 'travel_explore' },
    { id: 'placement-hub', label: 'Placement Hub', shortLabel: 'Placement', icon: 'corporate_fare' },
    { id: 'assessment', label: 'Semester Assessment', shortLabel: 'Assessment', icon: 'quiz' },
    { id: 'interview-room', label: 'Interview Room', shortLabel: 'Interview Room', icon: 'mic', isSpecial: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]">
      <div className="h-14 w-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Left: Logo & Navigation Links */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <button
            onClick={() => onNavigate('career-plan')}
            className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
          >
            <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#8052ff] group-hover:border-[#8052ff] transition-colors">
              <span className="material-symbols-outlined text-[17px]">school</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base tracking-tight text-white flex items-center">
                Skill<span className="text-[#8052ff]">up</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8052ff]/10 text-[#cdbdff] border border-[#8052ff]/30 font-mono font-medium">
                CDC
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.id ||
                (link.id === 'resume-analyzer' &&
                  (currentPath === 'resume-analyzer' ||
                    currentPath === 'career-assets' ||
                    currentPath === 'career_assets' ||
                    currentPath === 'linkedin-optimizer'));

              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`py-1.5 px-2 lg:px-2.5 rounded-md text-xs transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#18181b] text-white font-medium border border-[#27272a]'
                      : link.isSpecial
                      ? 'text-[#ffba35] hover:text-white bg-[#ffba35]/10 hover:bg-[#ffba35]/20 border border-[#ffba35]/30'
                      : 'text-[#9A9A9A] hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  {link.isSpecial && (
                    <span className="material-symbols-outlined text-[14px] text-[#ffba35] shrink-0">mic</span>
                  )}
                  <span>
                    <span className="hidden xl:inline">{link.label}</span>
                    <span className="inline xl:hidden">{link.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Screens Trigger, Student Info, Avatar, Faculty View, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Screen Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="px-2 py-1 text-xs rounded-md bg-[#18181b] border border-[#27272a] text-[#cdbdff] hover:text-white hover:border-[#8052ff] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              title="Jump to any screen"
            >
              <span className="material-symbols-outlined text-[15px]">apps</span>
              <span className="hidden sm:inline text-[11px] font-mono">Screens</span>
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
                  <span>1. My Career Plan</span>
                  <span className="text-[10px] text-[#10b981]">Roadmap</span>
                </button>
                <button
                  onClick={() => { onNavigate('skill-demand'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>2. Market Radar</span>
                  <span className="text-[10px] text-[#ffba35]">Multi-Role</span>
                </button>
                <button
                  onClick={() => { onNavigate('resume-analyzer'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>3. Resume Analyzer</span>
                  <span className="text-[10px] text-[#cdbdff]">Split Diff</span>
                </button>
                <button
                  onClick={() => { onNavigate('job-search'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>4. Job Search &amp; Matching</span>
                  <span className="text-[10px] text-[#78d8be]">Provenance</span>
                </button>
                <button
                  onClick={() => { onNavigate('placement-hub'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>5. Placement Hub</span>
                  <span className="text-[10px] text-[#10b981]">Drives</span>
                </button>
                <button
                  onClick={() => { onNavigate('assessment'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-emerald-400 hover:bg-[#16161A] flex items-center justify-between font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">quiz</span>
                    <span>6. Semester Assessment</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">Diagnostic</span>
                </button>
                <button
                  onClick={() => { onNavigate('interview-room'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-[#ffba35] hover:bg-[#16161A] flex items-center justify-between font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">mic</span>
                    <span>7. AI Interview Room</span>
                  </span>
                  <span className="text-[10px] bg-[#ffba35]/20 px-1.5 py-0.5 rounded font-mono font-bold">SRM CDC</span>
                </button>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider border-y border-[#202023] mt-1">
                  Faculty Console Screens
                </div>
                <button
                  onClick={() => { onNavigate('admin-overview'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>7. Faculty Overview</span>
                  <span className="text-[10px] text-[#8052ff]">Console</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-students'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>8. Student Roster</span>
                  <span className="text-[10px] text-[#78d8be]">Evals</span>
                </button>
                <button
                  onClick={() => { onNavigate('admin-placement-drives'); setShowQuickMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center justify-between"
                >
                  <span>9. Placement Drives</span>
                  <span className="text-[10px] text-[#8052ff]">Tiers</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs text-[#9A9A9A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-white font-medium font-mono text-[11px]">SRMIST</span>
          </div>

          {/* Dynamic Profile Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#18181b] transition-all cursor-pointer text-left border border-transparent hover:border-[#27272a]"
              title="Profile & Data Settings"
            >
              <div className="hidden xl:flex flex-col text-right leading-tight">
                <span className="text-xs font-medium text-white max-w-[140px] truncate">
                  {studentName || 'Upload Profile'}
                </span>
                <span className="text-[10px] text-[#cdbdff] font-mono">
                  {studentCgpa && Number(studentCgpa) > 0 ? `CGPA ${Number(studentCgpa).toFixed(2)}` : (dataMode === 'demo' ? 'Demo Mode' : 'Unseeded')}
                </span>
              </div>

              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                dataMode === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : studentName
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]'
              }`}>
                <span className="material-symbols-outlined text-[16px]">
                  {dataMode === 'demo' ? 'bolt' : studentName ? 'person' : 'file_upload'}
                </span>
              </div>
            </button>

            {/* Profile & Data Mode Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0D0D0F] border border-[#363639] shadow-2xl py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 pb-2 border-b border-[#202023] space-y-1">
                  <div className="text-xs font-bold text-white truncate">
                    {studentName || 'No Candidate Profile Loaded'}
                  </div>
                  <div className="text-[11px] text-[#9A9A9A] font-mono flex items-center gap-1.5">
                    <span>{studentId || 'No Reg No.'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {studentCgpa && Number(studentCgpa) > 0 ? `${Number(studentCgpa).toFixed(2)} CGPA` : '0.00 CGPA'}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      dataMode === 'demo'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : studentName
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      <span className="material-symbols-outlined text-[12px]">
                        {dataMode === 'demo' ? 'bolt' : studentName ? 'verified' : 'info'}
                      </span>
                      {dataMode === 'demo'
                        ? 'Demo Mode (Aravind R. / Alex Mercer)'
                        : studentName
                        ? 'Custom Profile File Active'
                        : 'Clean State (No File Loaded)'}
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
                  Data Actions
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onUploadClick ? onUploadClick() : onNavigate('career-plan');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-white hover:bg-[#16161A] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">upload_file</span>
                  <div className="flex-1">
                    <div className="font-medium">Upload / Replace Profile</div>
                    <div className="text-[10px] text-[#71717A]">Import CSV, Resume PDF, or AI Studio JSON</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLoadDemoData?.();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-amber-300 hover:bg-[#16161A] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-400">bolt</span>
                  <div className="flex-1">
                    <div className="font-medium">Load Demo Data (Aravind R.)</div>
                    <div className="text-[10px] text-amber-400/70">Load pre-seeded SRM sample dataset</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onResetCleanState?.();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-[#16161A] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-400">restart_alt</span>
                  <div className="flex-1">
                    <div className="font-medium">Reset to Clean State</div>
                    <div className="text-[10px] text-rose-400/70">Clear all data and return to empty dropzone</div>
                  </div>
                </button>

                <div className="border-t border-[#202023] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onRoleSwitch ? onRoleSwitch('faculty') : onSwitchRole?.();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-[#16161A] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#8052ff]">swap_horiz</span>
                    <span>Switch to Faculty Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Button */}
          <button
            onClick={() => (onRoleSwitch ? onRoleSwitch('faculty') : onSwitchRole?.())}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-white hover:border-[#8052ff] text-xs font-medium transition-all shrink-0 cursor-pointer"
            title="Switch to Faculty View"
          >
            <span className="material-symbols-outlined text-[15px] text-[#8052ff]">swap_horiz</span>
            <span className="hidden sm:inline">Faculty View</span>
          </button>

          <button
            onClick={() => (onLogout ? onLogout() : onNavigate('login'))}
            className="p-1 rounded-md text-[#9A9A9A] hover:text-white hover:bg-[#18181b] transition-colors shrink-0 cursor-pointer"
            title="Log out"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
