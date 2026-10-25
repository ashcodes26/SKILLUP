import React, { useState } from 'react';

import { UserRole } from '../../types';

interface LoginScreenProps {
  onLogin?: (role: UserRole) => void;
  onLoginSuccess?: (role: UserRole) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onLoginSuccess, onShowToast }) => {
  const triggerLogin = (role: UserRole) => {
    if (onLoginSuccess) {
      onLoginSuccess(role);
    } else if (onLogin) {
      onLogin(role);
    }
  };
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('alex.mercer@cs.institution.edu');
  const [password, setPassword] = useState('Demo2026StudentAuth!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFillDemo = (role: 'student' | 'faculty') => {
    setActiveTab('signin');
    if (role === 'student') {
      setUsername('alex.mercer@cs.institution.edu');
      setPassword('Demo2026StudentAuth!');
      setStatusMessage('Demo Student credentials loaded. Signing in...');
      setTimeout(() => triggerLogin('student'), 400);
    } else {
      setUsername('prof.jenkins@placement.institution.edu');
      setPassword('Placement2026AdminSecret!');
      setStatusMessage('Demo Faculty credentials loaded. Signing in...');
      setTimeout(() => triggerLogin('faculty'), 400);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lower = username.toLowerCase();
    if (lower.includes('prof') || lower.includes('jenkins') || lower.includes('admin') || lower.includes('faculty')) {
      triggerLogin('faculty');
    } else {
      triggerLogin('student');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between bg-black text-[#e5e1e4] antialiased"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(13, 13, 15, 0.92) 50%, rgba(0, 0, 0, 0.98) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEAyJ2F1DflgcMnoCLpCvt57pbLsgWOEelXf3hFRRsaLqGIAGKa9RIBbjpmWp2cDVnaovPPaPwT6zPn2s4_jE6Ml35Oe3gmPyjoeN-KhilogKogKORZ4vnojdDxlm5c-o5O522Yta2B2ey3tzKpClGZlHJI5_CKvOBD8IU9kNcA3idDUGvjXQqilUT9U5-c54ioj8ptDYDsfVp_JFu9-vB4kn8sPCgON4lhuA8S9CbwIIEWDrNl8OS")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-[#202023]">
        <div className="h-16 w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#8052ff] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Skillup</span>
            <div className="h-4 w-px bg-[#363639] hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#9A9A9A]">
              <span className="material-symbols-outlined text-[15px] text-[#78d8be]">verified_user</span>
              <span>Encrypted RBAC Scope</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 bg-[#16161A] px-3 py-1 rounded-full border border-[#202023] text-xs text-[#9A9A9A]">
              <span className="w-2 h-2 rounded-full bg-[#55C98B] animate-pulse"></span>
              <span>Class of 2026 CS Production Instance</span>
            </div>
            <a
              href="#support"
              onClick={(e) => { e.preventDefault(); alert('Skillup Help & Institutional Support Terminal active.'); }}
              className="flex items-center gap-1 text-[#9A9A9A] hover:text-white transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="w-full flex-1 pt-24 pb-12 flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto py-6 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12">
          {/* Left Column: Platform Mission & Value Props */}
          <div className="w-full lg:w-[54%] flex flex-col space-y-6">
            <div className="flex items-center gap-2 self-start bg-[#16161A] px-3.5 py-1.5 rounded-full border border-[#363639]">
              <span className="w-2 h-2 rounded-full bg-[#cdbdff] animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#cdbdff]">
                Career Readiness &amp; Placement Platform
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Connecting verified evidence to career outcomes.
              </h1>
              <p className="text-base text-[#9A9A9A] leading-relaxed max-w-2xl">
                Deterministic readiness assessment, verified credential grounding, and institutional placement workflows operating with absolute audit clarity.
              </p>
            </div>

            {/* Active Cohort Context Pill */}
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-4 flex items-center gap-3 shadow-md">
              <div className="w-10 h-10 rounded-lg bg-[#1E1E24] flex items-center justify-center shrink-0 text-[#78d8be]">
                <span className="material-symbols-outlined text-[22px]">groups</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                  Active Cohort Context
                </span>
                <span className="text-xs text-[#9A9A9A] truncate">
                  Currently supporting Class of 2026 &amp; Class of 2027 Engineering Cohorts • 148 Enrolled Students Active in Fall 2026 Pipeline
                </span>
              </div>
            </div>

            {/* Roles Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-4 space-y-2 hover:bg-[#16161A] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#cdbdff] text-[20px]">school</span>
                  <span className="font-semibold text-white text-sm">For Students</span>
                </div>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">
                  Analyze target roles against verified coursework and evidence, bridge skill gaps with deterministic roadmaps, and prepare factual resume revisions for placement drives.
                </p>
              </div>

              <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-4 space-y-2 hover:bg-[#16161A] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffdeac] text-[20px]">account_balance</span>
                  <span className="font-semibold text-white text-sm">For Placement Faculty</span>
                </div>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">
                  Oversee cohort readiness, calibrate competency benchmarks, manage institutional recruiting drives, and review student-shared artifacts within FERPA boundaries.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="w-full lg:w-[46%] max-w-[460px] flex flex-col">
            <div className="bg-[#0D0D0F] border border-[#363639] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center rounded-lg bg-[#16161A] p-1 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-[#8052ff] text-white shadow-sm'
                      : 'text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-[#8052ff] text-white shadow-sm'
                      : 'text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Create Account</span>
                  <span className="bg-[#2a2a2c] px-1.5 py-0.5 rounded text-[10px] text-[#78d8be] font-medium">
                    Students
                  </span>
                </button>
              </div>

              {/* Role-Aware Routing Banner */}
              <div className="bg-[#1E1E24] border border-[#202023] rounded-lg p-3 mb-5 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#3B82F6] text-[18px] shrink-0 mt-0.5">alt_route</span>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">
                  <strong className="text-white font-medium">Role-aware routing:</strong> Students route to My Career Plan (<code className="text-[#cdbdff] font-mono text-[11px]">/</code>), Placement Faculty route to Faculty Console (<code className="text-[#cdbdff] font-mono text-[11px]">/admin</code>).
                </p>
              </div>

              {statusMessage && (
                <div className="mb-4 p-2.5 rounded-lg bg-[#15846e]/20 border border-[#55C98B]/40 text-[#55C98B] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Sign In Form */}
              {activeTab === 'signin' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white flex items-center justify-between" htmlFor="signin-username">
                      <span>Username or Institutional Email</span>
                      <span className="text-[#606066] text-[11px] font-mono">RFC-5322</span>
                    </label>
                    <input
                      id="signin-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="e.g. alex.mercer@cs.institution.edu or prof.jenkins"
                      className="w-full bg-black text-white text-sm rounded-lg px-3.5 py-2.5 border border-[#363639] outline-none focus:border-[#8052ff] transition-colors placeholder:text-[#606066]"
                    />
                    <span className="text-[11px] text-[#606066] block">
                      Campus ID (#STU-XXXX) or institutional RFC-5322 email
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white" htmlFor="signin-password">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-[#9A9A9A] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-black text-white text-sm rounded-lg px-3.5 py-2.5 border border-[#363639] outline-none focus:border-[#8052ff] transition-colors placeholder:text-[#606066]"
                    />
                    <span className="text-[11px] text-[#606066] block">
                      Minimum 12 characters required by institutional policy
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      id="remember-session"
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="w-4 h-4 rounded bg-black border-[#363639] accent-[#8052ff] cursor-pointer"
                    />
                    <label htmlFor="remember-session" className="text-xs text-[#9A9A9A] select-none cursor-pointer">
                      Remember session on this device (SessionStorage per tab)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#8052ff] hover:opacity-95 text-white rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>Sign In to Skillup</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Student ID</label>
                    <input
                      type="text"
                      defaultValue="#STU-2026-88"
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Full Legal Name</label>
                    <input
                      type="text"
                      defaultValue="Alex R. Mercer"
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Institutional Campus Email</label>
                    <input
                      type="email"
                      defaultValue="alex.mercer@cs.institution.edu"
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Department</label>
                    <select className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]">
                      <option>Computer Science &amp; Engineering</option>
                      <option>Electrical &amp; Computer Engineering</option>
                      <option>Data Science &amp; Applied AI</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 bg-[#8052ff] hover:opacity-95 text-white rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Register Student Account</span>
                  </button>
                </form>
              )}

              {/* Demo Sandbox Quick-Click Triggers */}
              <div className="mt-6 pt-5 border-t border-[#202023]">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="material-symbols-outlined text-[#ffba35] text-[16px]">terminal</span>
                  <span className="text-[11px] font-semibold uppercase text-[#606066] tracking-widest">
                    Development &amp; Demo Sandbox
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('student')}
                    className="w-full bg-[#16161A] hover:bg-[#201f21] border border-[#363639] hover:border-[#cdbdff] rounded-xl p-2.5 flex items-center justify-between text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#cdbdff]/20 text-[#cdbdff] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-xs font-medium text-white flex items-center gap-1.5 truncate">
                          <span>Demo Student</span>
                          <span className="text-[#9A9A9A] font-normal">• Alex R. Mercer</span>
                        </div>
                        <span className="text-[11px] text-[#606066] truncate">#STU-2026-88 • Routes to My Career Plan</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#9A9A9A] group-hover:text-[#cdbdff] transition-colors text-[18px]">input</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo('faculty')}
                    className="w-full bg-[#16161A] hover:bg-[#201f21] border border-[#363639] hover:border-[#ffba35] rounded-xl p-2.5 flex items-center justify-between text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#ffba35]/20 text-[#ffba35] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">badge</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-xs font-medium text-white flex items-center gap-1.5 truncate">
                          <span>Demo Faculty</span>
                          <span className="text-[#9A9A9A] font-normal">• Prof. Sarah Jenkins</span>
                        </div>
                        <span className="text-[11px] text-[#606066] truncate">Placement Director • Routes to Faculty Console</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#9A9A9A] group-hover:text-[#ffba35] transition-colors text-[18px]">input</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
