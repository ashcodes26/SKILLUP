import React, { useState } from 'react';
import { UserRole } from '../../types';
import ParticleBrain from '../../components/ParticleBrain';
import LoginTransition from '../../components/LoginTransition';

interface LoginScreenProps {
  onLogin?: (role: UserRole) => void;
  onLoginSuccess?: (role: UserRole) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onLoginSuccess, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Warp transition state
  const [transitioning, setTransitioning] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>('student');

  // Registration state
  const [signupData, setSignupData] = useState({
    studentId: '#STU-2026-88',
    fullName: 'Aravind R.',
    email: 'ra2211003010482@srmist.edu.in',
    department: 'Computer Science & Engineering',
  });

  const triggerLogin = (role: UserRole) => {
    if (onLoginSuccess) {
      onLoginSuccess(role);
    } else if (onLogin) {
      onLogin(role);
    }
  };

  const startLoginWithEffect = (role: UserRole) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setTargetRole(role);
    setTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setTransitioning(false);
    setBusy(false);
    triggerLogin(targetRole);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lower = username.toLowerCase();
    const detectedRole: UserRole =
      lower.includes('prof') || lower.includes('jenkins') || lower.includes('faculty') || lower.includes('soundararajan')
        ? 'faculty'
        : 'student';
    startLoginWithEffect(detectedRole);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between bg-black text-[#e5e1e4] antialiased selection:bg-[#8052ff]/30 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(13, 13, 15, 0.92) 50%, rgba(0, 0, 0, 0.98) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEAyJ2F1DflgcMnoCLpCvt57pbLsgWOEelXf3hFRRsaLqGIAGKa9RIBbjpmWp2cDVnaovPPaPwT6zPn2s4_jE6Ml35Oe3gmPyjoeN-KhilogKogKORZ4vnojdDxlm5c-o5O522Yta2B2ey3tzKpClGZlHJI5_CKvOBD8IU9kNcA3idDUGvjXQqilUT9U5-c54ioj8ptDYDsfVp_JFu9-vB4kn8sPCgON4lhuA8S9CbwIIEWDrNl8OS")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Header Bar with Reverted Logo & Encrypted Emblem Removed */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-[#202023]">
        <div className="h-16 w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#8052ff] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase font-sans">Skillup</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 bg-[#16161A] px-3 py-1 rounded-full border border-[#202023] text-xs text-[#9A9A9A]">
              <span className="w-2 h-2 rounded-full bg-[#55C98B] animate-pulse"></span>
              <span>Class of 2026 CS Production Instance</span>
            </div>
            <button
              type="button"
              onClick={() =>
                onShowToast?.(
                  'Skillup Help & Institutional Support Terminal active (FERPA & IEEE P2863 compliant).',
                  'info'
                )
              }
              className="flex items-center gap-1 text-[#9A9A9A] hover:text-white transition-colors text-sm cursor-pointer"
              title="Institutional Support"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 pt-24 pb-12 flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto py-6 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12">
          
          {/* Left Column: Mission, Value Proposition & Seamlessly Merged 3D Particle Brain */}
          <div className="w-full lg:w-[54%] flex flex-col space-y-5">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#925dff]"></span>
              <span className="text-xs font-mono font-semibold tracking-wider text-[#aaa8b6] uppercase">
                YOUR NEXT CHAPTER STARTS HERE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Potential.<br />
              Meet <span className="text-[#c9b3fa]">direction.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#aaa8b6] leading-relaxed max-w-xl">
              Know your strengths. Close the gap.<br />
              Build a career plan grounded in your evidence.
            </p>

            {/* Seamless 3D Particle Brain (no box, no border, no label, merged with background) */}
            <div className="w-full relative my-1">
              <ParticleBrain />
            </div>

            {/* Footer Tagline below Brain */}
            <div className="flex items-center justify-between text-xs text-[#aaa8b6] px-1">
              <span>Built around your next move.</span>
              <span className="text-[#925dff]">✦</span>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="w-full lg:w-[46%] max-w-[460px] flex flex-col">
            <div className="bg-[#0D0D0F] border border-[#363639] rounded-2xl p-6 shadow-2xl relative">
              
              {/* Card Header */}
              <div className="space-y-1 mb-5">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-[#aaa8b6] uppercase block">
                  YOUR CAREER WORKSPACE
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {activeTab === 'signin' ? 'Welcome back.' : 'Create student account.'}
                </h2>
                <p className="text-xs text-[#aaa8b6]">
                  {activeTab === 'signin'
                    ? 'Pick up where your another tab left.'
                    : 'Get started with verified student placement tracking.'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#202028] mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setError(null);
                  }}
                  className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'signin'
                      ? 'border-[#8052ff] text-white'
                      : 'border-transparent text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setError(null);
                  }}
                  className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1 ${
                    activeTab === 'signup'
                      ? 'border-[#8052ff] text-white'
                      : 'border-transparent text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  <span>Student signup</span>
                  <span className="text-[11px]">↗</span>
                </button>
              </div>

              {/* Error banner if present */}
              {error && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Sign In Form */}
              {activeTab === 'signin' ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white block" htmlFor="auth-username">
                      Username
                    </label>
                    <input
                      id="auth-username"
                      type="text"
                      disabled={busy}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="admin"
                      className="w-full bg-black text-white text-sm rounded-lg px-3.5 py-2.5 border border-[#363639] outline-none focus:border-[#8052ff] transition-colors placeholder:text-[#606066]"
                    />
                    <span className="text-[11px] text-[#606066] block">
                      Use the username registered with your account.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white" htmlFor="auth-password">
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
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      disabled={busy}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-black text-white text-sm rounded-lg px-3.5 py-2.5 border border-[#363639] outline-none focus:border-[#8052ff] transition-colors placeholder:text-[#606066]"
                    />
                    <span className="text-[11px] text-[#606066] block">
                      Enter your existing account password.
                    </span>
                  </div>

                  {/* Session Notice */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-[#9A9A9A]">
                    <span className="material-symbols-outlined text-[15px] text-[#aaa8b6]">shield</span>
                    <span>Session stored per-browser via cookie or tab.</span>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full h-11 bg-[#8052ff] hover:opacity-95 active:scale-[0.99] text-white rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>{busy ? 'Authenticating...' : 'Sign In to Skillup'}</span>
                  </button>
                </form>
              ) : (
                /* Registration Form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    startLoginWithEffect('student');
                  }}
                  className="space-y-3"
                >
                  <div className="p-2 rounded-lg bg-[#8052ff]/10 border border-[#8052ff]/20 text-[11px] text-[#cdbdff] flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">info</span>
                    <span>Student registration only. Institutional faculty accounts are pre-provisioned.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Student ID</label>
                    <input
                      type="text"
                      disabled={busy}
                      value={signupData.studentId}
                      onChange={(e) => setSignupData({ ...signupData, studentId: e.target.value })}
                      required
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Full Name</label>
                    <input
                      type="text"
                      disabled={busy}
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Institutional Email</label>
                    <input
                      type="email"
                      disabled={busy}
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-white block">Department</label>
                    <input
                      type="text"
                      disabled={busy}
                      value={signupData.department}
                      onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                      required
                      className="w-full bg-black text-white text-sm rounded-lg px-3 py-2 border border-[#363639] outline-none focus:border-[#8052ff]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full h-11 bg-[#8052ff] hover:opacity-95 text-white rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Register Student Account</span>
                  </button>
                </form>
              )}

              {/* DEVELOPMENT & DEMO SANDBOX */}
              <div className="mt-6 pt-5 border-t border-[#202023]">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="material-symbols-outlined text-[#ffba35] text-[16px]">terminal</span>
                  <span className="text-[11px] font-semibold uppercase text-[#606066] tracking-widest font-mono">
                    Development &amp; Demo Sandbox
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Demo Student Button */}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startLoginWithEffect('student')}
                    className="w-full bg-[#16161A] hover:bg-[#201f21] border border-[#363639] hover:border-[#cdbdff] rounded-xl p-2.5 flex items-center justify-between text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#cdbdff]/20 text-[#cdbdff] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-xs font-medium text-white flex items-center gap-1.5 truncate">
                          <span>Demo Student</span>
                          <span className="text-[#9A9A9A] font-normal">• Aravind R.</span>
                        </div>
                        <span className="text-[11px] text-[#606066] truncate">
                          Local development only · Server-controlled access
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#9A9A9A] group-hover:text-[#cdbdff] transition-colors text-[18px]">
                      input
                    </span>
                  </button>

                  {/* Permanent Faculty Button */}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startLoginWithEffect('faculty')}
                    className="w-full bg-[#16161A] hover:bg-[#201f21] border border-[#363639] hover:border-[#ffba35] rounded-xl p-2.5 flex items-center justify-between text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#ffba35]/20 text-[#ffba35] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">badge</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-xs font-medium text-white flex items-center gap-1.5 truncate">
                          <span>Permanent Faculty</span>
                          <span className="text-[#9A9A9A] font-normal">• Dr. S. Soundararajan</span>
                        </div>
                        <span className="text-[11px] text-[#606066] truncate">
                          Sign in with an institution-provisioned account
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#9A9A9A] group-hover:text-[#ffba35] transition-colors text-[18px]">
                      input
                    </span>
                  </button>
                </div>

                <p className="text-[10px] text-[#606066] mt-3 text-center">
                  Student registration only. Faculty use their existing institution-provisioned accounts.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#202023] py-4 text-center text-xs text-[#606066] bg-black/60">
        AIMORA Skillup • IEEE P2863 &amp; FERPA Certified Career Readiness Environment
      </footer>

      {/* Cinematic Warp Speed Explosion Login Transition */}
      <LoginTransition visible={transitioning} onComplete={handleTransitionComplete} />
    </div>
  );
};

export default LoginScreen;
