import React, { useState } from 'react';

interface CareerPlanScreenProps {
  onNavigate?: (path: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  dockerScore?: number | null;
}

export const CareerPlanScreen: React.FC<CareerPlanScreenProps> = ({ onNavigate, onShowToast, dockerScore }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSuccess, setAnalyzedSuccess] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzedSuccess(true);
      setTimeout(() => setAnalyzedSuccess(false), 3000);
    }, 900);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Level Context / Notice Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">My Career Plan</h1>
            <p className="text-sm text-[#9A9A9A] mt-1">
              Map your verified evidence and competencies to target industry roles, evaluate skill gaps, and execute your deterministic roadmap.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-full bg-[#16161A] border border-[#363639] shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#ffba35]"></span>
            <span className="text-xs text-[#BDBDBD] font-medium">Demo preview: Synthetic profile active — read-only</span>
          </div>
        </div>

        {/* Informational Readiness Disclaimer Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1E1E24] border border-[#202023] text-xs text-[#9A9A9A]">
          <span className="material-symbols-outlined text-[16px] text-[#cdbdff] shrink-0 mt-0.5">info</span>
          <span>
            <strong className="text-white font-semibold">Audit Notice:</strong> Readiness is informational guidance based on saved profile evidence and role requirements, not an automated placement guarantee or ATS certification.
          </span>
        </div>
      </div>

      {/* SECTION A: Student Profile & Evidence Overview */}
      <section className="flex flex-col rounded-xl bg-[#0D0D0F] border border-[#202023] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202023]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#16161A] border border-[#363639] flex items-center justify-center text-[#cdbdff] shrink-0">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profile Evidence &amp; Competencies</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9A9A9A] mt-0.5">
                <span>Student ID: <span className="text-white font-mono font-medium">STU-2026-088</span></span>
                <span>•</span>
                <span>B.Tech Computer Science &amp; Engineering <span className="text-[#BDBDBD] font-medium">(Class of 2027)</span></span>
                <span>•</span>
                <span className="text-[#55C98B] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#55C98B]"></span> 6 Validated Records
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => alert('Profile verified against Registrar database. Last sync: 2 hours ago.')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              <span>Update profile details</span>
            </button>
            <button
              onClick={() => onNavigate?.('resume-analyzer')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] text-xs font-medium transition-colors cursor-pointer"
              title="Parsed details save directly to evidence bank"
            >
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              <span>Upload journey (PDF/DOCX)</span>
            </button>
          </div>
        </div>

        {/* Document Pending Alert / Link */}
        <div className="my-4 p-3 rounded-lg bg-[#16161A] border border-[#ffba35]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffba35] text-[18px]">mark_email_unread</span>
            <span className="text-xs text-white">
              <strong className="text-[#ffba35] font-semibold">Documents to review:</strong> 1 pending private review (Fall 2025 Midterm Transcript extraction staged)
            </span>
          </div>
          <button
            onClick={() => onNavigate?.('resume-analyzer')}
            className="text-xs text-[#cdbdff] hover:underline whitespace-nowrap text-left font-medium cursor-pointer"
          >
            Open private review →
          </button>
        </div>

        {/* Verified Competencies Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold tracking-wider text-[#9A9A9A] uppercase">
              Indexed Competency Evidence (Scale 0.0 - 5.0)
            </span>
            <span className="text-xs text-[#9A9A9A]">Unassessed competencies excluded from scoring means</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Python */}
            <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Python</span>
                <span className="px-2 py-0.5 rounded-full bg-[#15846e]/30 text-[#94f4da] text-[10px] font-medium border border-[#15846e]">
                  Assessed
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="w-full mr-3">
                  <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#78d8be] rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  4.2<span className="text-[#9A9A9A] font-normal">/5.0</span>
                </span>
              </div>
              <span className="text-[11px] text-[#9A9A9A] mt-2">Institutional Assessment #PY-402</span>
            </div>

            {/* Data Structures */}
            <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Data Structures</span>
                <span className="px-2 py-0.5 rounded-full bg-[#16161A] text-[#9A9A9A] text-[10px] font-medium border border-[#363639]">
                  Coursework
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="w-full mr-3">
                  <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8052ff] rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  4.0<span className="text-[#9A9A9A] font-normal">/5.0</span>
                </span>
              </div>
              <span className="text-[11px] text-[#9A9A9A] mt-2">CS-201 Grade: A (Verified)</span>
            </div>

            {/* SQL & Databases */}
            <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">SQL &amp; Relational DB</span>
                <span className="px-2 py-0.5 rounded-full bg-[#15846e]/30 text-[#94f4da] text-[10px] font-medium border border-[#15846e]">
                  Quiz
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="w-full mr-3">
                  <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#78d8be] rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  3.5<span className="text-[#9A9A9A] font-normal">/5.0</span>
                </span>
              </div>
              <span className="text-[11px] text-[#9A9A9A] mt-2">Placement Hub Quiz #SQL-01 (88%)</span>
            </div>

            {/* Docker (Unknown / Not assessed) */}
            <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#9A9A9A]">Docker &amp; Containers</span>
                <span className="px-2 py-0.5 rounded-full bg-[#16161A] text-[#ffba35] text-[10px] font-medium border border-[#ffba35]/30">
                  Null / Missing
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="w-full mr-3">
                  <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                    <div className="h-full bg-transparent"></div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#606066] whitespace-nowrap">Unknown</span>
              </div>
              <span className="text-[11px] text-[#ffba35] mt-2">Distinct from zero • Needs assessment</span>
            </div>

            {/* System Design */}
            <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">System Design</span>
                <span className="px-2 py-0.5 rounded-full bg-[#16161A] text-[#9A9A9A] text-[10px] font-medium border border-[#363639]">
                  Self-reported
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="w-full mr-3">
                  <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8052ff]/70 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  2.5<span className="text-[#9A9A9A] font-normal">/5.0</span>
                </span>
              </div>
              <span className="text-[11px] text-[#9A9A9A] mt-2">Portfolio evidence submitted</span>
            </div>

            {/* Git & Version Control */}
            <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Git &amp; Versioning</span>
                <span className="px-2 py-0.5 rounded-full bg-[#15846e]/30 text-[#94f4da] text-[10px] font-medium border border-[#15846e]">
                  Verified
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="w-full mr-3">
                  <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#78d8be] rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  4.0<span className="text-[#9A9A9A] font-normal">/5.0</span>
                </span>
              </div>
              <span className="text-[11px] text-[#9A9A9A] mt-2">GitHub repository audit linked</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Target Role Selection & Analysis Signature */}
      <section className="flex flex-col rounded-xl bg-[#0D0D0F] border border-[#202023] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Target Role Specification</h2>
            <p className="text-xs text-[#9A9A9A]">
              Define or update the role target to generate a requirement signature for deterministic alignment analysis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#15846e]/20 border border-[#15846e]/40 text-[#94f4da] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#78d8be]"></span> Target status: Saved
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#9A9A9A] mb-1.5 font-medium">Role Title &amp; Track</label>
            <div className="relative">
              <input
                className="w-full bg-black border border-[#363639] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                readOnly
                type="text"
                value="Junior Backend Engineer (Distributed Systems)"
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-[#9A9A9A]">lock</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9A9A9A] mb-1.5 font-medium">Parsed Role Requirements &amp; Stack Requirements</label>
            <div className="p-3 bg-black border border-[#202023] rounded-lg flex flex-col gap-1.5 text-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-[#ffba35] font-semibold uppercase shrink-0">Core Requirements:</span>
                <span className="text-white">Python/Go, PostgreSQL, Redis, REST APIs, Microservices, Docker, Git.</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[#9A9A9A] font-semibold uppercase shrink-0">Preferred:</span>
                <span className="text-[#BDBDBD]">Kubernetes, Kafka, CI/CD pipelines, System Design basics.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
              <span className="material-symbols-outlined text-[16px] text-[#55C98B]">check_circle</span>
              <span>Signature validated: Target saved in current workspace</span>
              <span>•</span>
              <button
                onClick={() => alert('Reloading saved journey from institutional registrar profile.')}
                className="text-[#cdbdff] hover:underline font-medium cursor-pointer"
              >
                Reload saved journey
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-full bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Analyzing signature...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">query_stats</span>
                    <span>Analyze alignment</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {analyzedSuccess && (
            <div className="p-2.5 rounded-lg bg-[#15846e]/20 border border-[#55C98B]/40 text-[#55C98B] text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Alignment analysis completed! Evaluated 12 competencies with 76% role match.</span>
            </div>
          )}
        </div>
      </section>

      {/* SECTION C: Alignment & Readiness Analysis */}
      <section className="flex flex-col rounded-xl bg-[#0D0D0F] border border-[#202023] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#202023] mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Alignment &amp; Readiness Breakdown</h2>
            <p className="text-xs text-[#9A9A9A]">
              Analysis ID: <span className="font-mono text-white">ANL-2026-9921</span> • Engine: Deterministic Dictionary Matcher v2.4
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#16161A] text-[#55C98B] border border-[#363639] text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55C98B]"></span> Evaluated 12 Competencies
          </span>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1 */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider">Role Alignment</span>
              <span className="material-symbols-outlined text-[#8052ff] text-[20px]">radar</span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">76%</span>
              <span className="text-xs text-[#55C98B] font-medium">+4% from last quiz</span>
            </div>
            <div className="w-full bg-[#16161A] h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-[#8052ff] h-full rounded-full" style={{ width: '76%' }}></div>
            </div>
            <p className="text-xs text-[#9A9A9A]">
              Weighted match against 12 role requirements. Informational alignment, not a placement probability.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider">Evidence Coverage</span>
              <span className="material-symbols-outlined text-[#78d8be] text-[20px]">verified_user</span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">83%</span>
              <span className="text-xs text-[#9A9A9A] font-medium">10 of 12 documented</span>
            </div>
            <div className="w-full bg-[#16161A] h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-[#78d8be] h-full rounded-full" style={{ width: '83.3%' }}></div>
            </div>
            <p className="text-xs text-[#9A9A9A]">
              Supported by verified academic transcripts, coursework records, or validated quiz items.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-wider">Analysis Confidence</span>
              <span className="material-symbols-outlined text-[#ffba35] text-[20px]">analytics</span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                High <span className="text-sm font-normal text-[#9A9A9A]">(4.2/5.0)</span>
              </span>
            </div>
            <div className="w-full bg-[#16161A] h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-[#ffba35] h-full rounded-full" style={{ width: '84%' }}></div>
            </div>
            <p className="text-xs text-[#9A9A9A]">
              Based on 4 primary coursework records and 2 assessed quizzes. No missing critical transcripts.
            </p>
          </div>
        </div>

        {/* Strengths & Gaps Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#55C98B] text-[18px]">check_circle</span>
              <h3 className="text-sm font-bold text-white">Verified Strengths (Target Met)</h3>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-medium">Python Programming</span>
                  <p className="text-[11px] text-[#9A9A9A]">Meets level 4.0/5.0 target • Assessed: 4.2/5.0</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#15846e]/30 text-[#55C98B] font-semibold text-[10px]">
                  Exceeds +0.2
                </span>
              </li>
              <li className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-medium">Relational Databases &amp; SQL</span>
                  <p className="text-[11px] text-[#9A9A9A]">Meets level 3.5/5.0 target • Assessed: 3.5/5.0</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#15846e]/30 text-[#55C98B] font-semibold text-[10px]">
                  Exact Match
                </span>
              </li>
              <li className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-medium">Git &amp; Version Control</span>
                  <p className="text-[11px] text-[#9A9A9A]">Meets level 3.0/5.0 target • Verified: 4.0/5.0</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#15846e]/30 text-[#55C98B] font-semibold text-[10px]">
                  Exceeds +1.0
                </span>
              </li>
            </ul>
          </div>

          {/* Gaps to Bridge */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#ffba35] text-[18px]">warning</span>
              <h3 className="text-sm font-bold text-white">Gaps to Bridge (Actionable)</h3>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="p-2.5 rounded bg-[#16161A] border border-[#EB5757]/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-medium">Docker &amp; Containerization</span>
                  <p className="text-[11px] text-[#9A9A9A]">Required: 3.5/5.0 • Current: <span className="text-[#ffba35] font-semibold">Unknown / Unassessed</span></p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] font-semibold text-[10px]">
                  Priority: High
                </span>
              </li>
              <li className="p-2.5 rounded bg-[#16161A] border border-[#ffba35]/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-medium">System Architecture &amp; Caching (Redis)</span>
                  <p className="text-[11px] text-[#9A9A9A]">Required: 3.0/5.0 • Current: 2.0/5.0 (Delta: -1.0)</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#ffba35]/20 text-[#ffba35] font-semibold text-[10px]">
                  Delta -1.0
                </span>
              </li>
              <li className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-medium">Message Queuing (Kafka)</span>
                  <p className="text-[11px] text-[#9A9A9A]">Preferred in 65% postings • Current: Missing evidence</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1E1E24] text-[#9A9A9A] font-semibold text-[10px]">
                  Elective
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Grounded Gemini Guidance */}
        <div className="rounded-lg bg-[#16161A] border border-[#363639] p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8052ff]"></div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8052ff] text-[18px]">psychology</span>
              <span className="text-sm font-semibold text-white">Grounded AI Analysis Summary</span>
            </div>
            <span className="text-xs text-[#9A9A9A] flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[14px] text-[#78d8be]">lock</span> Gemini SDK Consented
            </span>
          </div>
          <p className="text-xs text-[#9A9A9A] mb-3">
            Notice: AI Explanations consented via Gemini SDK. Grounded strictly in your uploaded profile evidence and validated role specifications.
          </p>
          <div className="text-xs text-[#BDBDBD] space-y-2 bg-black/40 p-3 rounded border border-[#202023] leading-relaxed">
            <p>
              • <strong>Prioritization Synthesis:</strong> Your solid score in Python (4.2/5.0) and Relational Databases (3.5/5.0) provides a strong foundation. However, containerization is a hard requirement for 100% of Junior Backend listings in distributed systems.
            </p>
            <p>
              • <strong>Recommended Focus Order:</strong> First, complete the <em>Containerization Fundamentals with Docker</em> module (Milestone 2) and take the placement quiz to turn your unassessed status into verified evidence. Second, bridge in-memory caching gaps with Redis before attempting mock systems interviews.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION D: Deterministic Learning Roadmap */}
      <section className="flex flex-col rounded-xl bg-[#0D0D0F] border border-[#202023] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#202023] mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Target Roadmap: Junior Backend Engineer</h2>
            <div className="flex items-center gap-3 text-xs text-[#9A9A9A] mt-0.5">
              <span className="text-[#ffba35] font-medium">Milestone 2 of 5 in progress</span>
              <span>•</span>
              <span>Total estimated duration: 6 Weeks</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => alert('Exporting structured progress report (PDF) for Class of 2026 CS advisor review.')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Export Progress (PDF)</span>
            </button>
            <button
              onClick={() => alert('Plan summary generated from verified coursework milestones.')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">summarize</span>
              <span>AI Plan Summary</span>
            </button>
          </div>
        </div>

        {/* Sequential Milestones Timeline */}
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#363639]">
          {/* Milestone 1: Completed */}
          <div className="relative flex flex-col gap-1">
            <div className="absolute -left-[27px] top-1.5 w-5 h-5 rounded-full bg-[#55C98B] flex items-center justify-center text-black">
              <span className="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#16161A] text-[#55C98B] font-mono">MS-01</span>
                  <h3 className="text-sm font-bold text-white">Core Persistence &amp; Database Optimization</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#15846e]/30 text-[#55C98B] text-xs font-semibold self-start sm:self-auto">
                  Completed
                </span>
              </div>
              <p className="text-xs text-[#9A9A9A] mb-3">
                Master indexing, query execution planning in PostgreSQL, and connection pool configuration for scalable backends.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9A9A9A] pt-2 border-t border-[#202023]">
                <span className="flex items-center gap-1 text-[#55C98B] font-medium">
                  <span className="material-symbols-outlined text-[15px]">verified</span> 3 of 3 tasks validated
                </span>
                <span>•</span>
                <span>SQL Assessment passed: 88%</span>
                <span>•</span>
                <span>Coursework: CS-201 verified</span>
              </div>
            </div>
          </div>

          {/* Milestone 2: Active / In-Progress */}
          <div className="relative flex flex-col gap-1">
            <div className="absolute -left-[27px] top-1.5 w-5 h-5 rounded-full bg-[#ffba35] flex items-center justify-center text-black ring-4 ring-[#ffba35]/20">
              <span className="material-symbols-outlined text-[14px] font-bold">cached</span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#ffba35]/40 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#ffba35]/20 text-[#ffba35] font-mono font-semibold">MS-02</span>
                  <h3 className="text-sm font-bold text-white">Containerization Fundamentals with Docker</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffba35]/20 text-[#ffba35] text-xs font-semibold self-start sm:self-auto animate-pulse">
                  Active Milestone
                </span>
              </div>
              <p className="text-xs text-[#e5e1e4] mb-3">
                Learn multi-stage Docker builds, volume management, container networking, and local multi-service orchestration with Docker Compose.
              </p>

              {/* Actionable Learning Resources */}
              <div className="p-3 rounded bg-[#16161A] border border-[#363639] mb-3 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-[#cdbdff]">book</span> Assigned Learning Resource: Official Docker Compose Spec
                  </span>
                  <a
                    href="https://docs.docker.com/compose/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#cdbdff] hover:underline font-semibold"
                  >
                    View Guide →
                  </a>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-[#ffba35]">quiz</span> Assigned quiz available in Placement Hub (#DCK-101)
                  </span>
                  <button
                    onClick={() => onNavigate?.('placement-hub')}
                    className="text-[#ffba35] hover:underline font-semibold cursor-pointer"
                  >
                    Start Quiz →
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#202023]">
                <div className="flex items-center gap-3 text-xs text-[#9A9A9A]">
                  <span>Task Progress: 1 of 3 complete</span>
                  <span>•</span>
                  <span>Due: Target Week 3</span>
                </div>
                <button
                  onClick={() => alert('Practice evidence submission modal: Upload Dockerfile or link GitHub repository.')}
                  className="px-3 py-1.5 rounded bg-[#2a2a2c] border border-[#363639] text-white hover:bg-[#353437] text-xs font-medium transition-colors cursor-pointer"
                >
                  Submit practice evidence
                </button>
              </div>
            </div>
          </div>

          {/* Milestone 3: Upcoming */}
          <div className="relative flex flex-col gap-1 opacity-80">
            <div className="absolute -left-[27px] top-1.5 w-5 h-5 rounded-full bg-[#16161A] border border-[#363639] flex items-center justify-center text-[#9A9A9A]">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#16161A] text-[#9A9A9A] font-mono">MS-03</span>
                  <h3 className="text-sm font-bold text-white">Distributed Caching with Redis &amp; In-Memory Stores</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#16161A] text-[#9A9A9A] text-xs font-medium self-start sm:self-auto">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-[#9A9A9A] mb-2">
                Cache-aside patterns, invalidation strategies, Redis pub/sub, distributed locking primitives, and rate-limiting counters.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#9A9A9A] pt-2 border-t border-[#202023]">
                <span>Prerequisite: Milestone 2 completion</span>
                <span>•</span>
                <span>Estimated workload: 10 hrs</span>
              </div>
            </div>
          </div>

          {/* Milestone 4: Upcoming */}
          <div className="relative flex flex-col gap-1 opacity-80">
            <div className="absolute -left-[27px] top-1.5 w-5 h-5 rounded-full bg-[#16161A] border border-[#363639] flex items-center justify-center text-[#9A9A9A]">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#16161A] text-[#9A9A9A] font-mono">MS-04</span>
                  <h3 className="text-sm font-bold text-white">Microservice API Design &amp; Rate Limiting</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#16161A] text-[#9A9A9A] text-xs font-medium self-start sm:self-auto">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-[#9A9A9A] mb-2">
                RESTful API contract specifications (OpenAPI 3.1), idempotency keys, JWT revocation flows, and token bucket rate limiters.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#9A9A9A] pt-2 border-t border-[#202023]">
                <span>Prerequisite: Milestone 3 completion</span>
                <span>•</span>
                <span>Curated resources: 4</span>
              </div>
            </div>
          </div>

          {/* Milestone 5: Locked */}
          <div className="relative flex flex-col gap-1 opacity-50">
            <div className="absolute -left-[27px] top-1.5 w-5 h-5 rounded-full bg-[#16161A] border border-[#363639] flex items-center justify-center text-[#606066]">
              <span className="material-symbols-outlined text-[12px]">lock</span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#16161A] text-[#606066] font-mono">MS-05</span>
                  <h3 className="text-sm font-bold text-[#606066]">Mock Technical Interview &amp; Resume Alignment</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#16161A] text-[#606066] text-xs font-medium self-start sm:self-auto">
                  Locked
                </span>
              </div>
              <p className="text-xs text-[#606066] mb-2">
                Faculty-supervised distributed systems mock interview and targeted resume revision handoff to the Placement Hub.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#606066] pt-2 border-t border-[#202023]">
                <span>Gated: Unlocks automatically when Milestone 3 &amp; 4 are verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerPlanScreen;
