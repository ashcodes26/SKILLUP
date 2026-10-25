import React, { useState, useEffect } from 'react';
import { initialJobs, initialSharedReviews } from '../../data/mockData';
import { ResumeSuggestionDiff } from '../../types';

interface ResumeAnalyzerScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  initialWorkspaceTab?: 'resume' | 'linkedin';
}

const INITIAL_RESUME_TEXT = `ALEX R. MERCER
alex.mercer@cs.edu | +1 (555) 019-2834 | github.com/alex-mercer | San Francisco, CA

EDUCATION
B.S. in Computer Science & Engineering | Anticipated Dec 2026
University Placement Division | Cumulative GPA: 3.84 / 4.00
Relevant Coursework: Distributed Systems, Database Management, Algorithms, Network Architecture

TECHNICAL COMPETENCIES
Languages: Python (Fluent, 4.2), Go, SQL (PostgreSQL), TypeScript, Bash
Databases & Storage: PostgreSQL 15, Redis 7.0, DynamoDB
Infrastructure & Cloud: Docker, Kubernetes, Linux (Ubuntu/Debian), GitHub Actions CI/CD
Methodologies: Distributed Consensus, High-Concurrency Queuing, RESTful API Design

PROJECTS & EXPERIENCE
Backend Engineering Intern | Distributed Ledger Lab (Jun 2025 – Present)
• Implemented PostgreSQL database indexing to optimize slow queries for the order service.
• Designed asynchronous event worker pipeline utilizing Redis queues for real-time order status updates.
• Authored comprehensive unit and integration test suites achieving 89% branch coverage in pytest.

Autonomous Routing Mesh | Capstone Project (Jan 2025 – May 2025)
• Built Python-based gRPC routing daemon handling inter-service heartbeat verification across 24 nodes.
• Containerized services using Docker multi-stage builds to minimize runtime attack surface and image size.`;

const INITIAL_SUGGESTIONS: ResumeSuggestionDiff[] = [
  {
    id: 1,
    title: 'Quantified Database Scale Benchmark',
    category: 'Evidence',
    priority: 'High Priority',
    rationale:
      'CloudScale technical evaluators filter for quantified database scale benchmarks. Replace generic query optimization claim with verified CS-305 lab latency parameters.',
    originalPassage: '• Implemented PostgreSQL database indexing to optimize slow queries for the order service.',
    proposedPassage:
      '• Architected composite B-tree indices on PostgreSQL 15, reducing 99th percentile query latency from 420ms to 68ms under 4,500 req/s load.',
    ruleRef: 'IEEE P2863 Evidence Rule §4.2',
    status: 'pending',
  },
  {
    id: 2,
    title: 'Containerization Orchestration Specificity',
    category: 'Relevance',
    priority: 'ATS Keyword Match',
    rationale:
      'Mandatory threshold for CloudScale drive is Docker orchestration (Level 3.5+). Specify Alpine multi-stage builds and Compose isolation in Technical Competencies.',
    originalPassage: 'Infrastructure & Cloud: Docker, Kubernetes, Linux (Ubuntu/Debian), GitHub Actions CI/CD',
    proposedPassage:
      'Infrastructure & Cloud: Docker (Multi-stage builds, Alpine, Compose), Kubernetes, Linux (Ubuntu/Debian), GitHub Actions CI/CD',
    ruleRef: 'Drive Prerequisite #CS-2026',
    status: 'pending',
  },
  {
    id: 3,
    title: 'Active Systems Leadership Verb',
    category: 'Clarity',
    priority: 'Stylistic Lift',
    rationale:
      'Replace passive verb "Built" in Capstone with high-clarity systems engineering terminology "Engineered and benchmarked".',
    originalPassage: '• Built Python-based gRPC routing daemon handling inter-service heartbeat verification across 24 nodes.',
    proposedPassage:
      '• Engineered and benchmarked Python-based gRPC routing daemon handling inter-service heartbeat verification across 24 nodes.',
    ruleRef: 'Syntactic Density §2.1',
    status: 'pending',
  },
];

export default function ResumeAnalyzerScreen({
  onNavigate,
  onShowToast,
  initialWorkspaceTab = 'resume',
}: ResumeAnalyzerScreenProps) {
  const [workspaceTab, setWorkspaceTab] = useState<'resume' | 'linkedin'>(initialWorkspaceTab);

  useEffect(() => {
    setWorkspaceTab(initialWorkspaceTab);
  }, [initialWorkspaceTab]);

  // Document Ingestion & Target Role Selection
  const [originalDocument, setOriginalDocument] = useState<string>(INITIAL_RESUME_TEXT);
  const [workingDraft, setWorkingDraft] = useState<string>(INITIAL_RESUME_TEXT);
  const [selectedRoleTarget, setSelectedRoleTarget] = useState<string>(initialJobs[0].id);
  const [customRoleTitle, setCustomRoleTitle] = useState<string>('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'working-only'>('side-by-side');

  // Interactive Diff Suggestions State (Accept, Reject, Undo)
  const [suggestions, setSuggestions] = useState<ResumeSuggestionDiff[]>(INITIAL_SUGGESTIONS);

  // Factual Review Guard Checkbox (Non-negotiable before Export)
  const [factualConfirmed, setFactualConfirmed] = useState<boolean>(false);
  const [submittedForReview, setSubmittedForReview] = useState<boolean>(false);

  // LinkedIn Optimizer State (Module E)
  const [linkedinHeadline, setLinkedinHeadline] = useState(
    'Computer Science Student at University | Python & Backend Developer | Class of 2026'
  );
  const [linkedinSummary, setLinkedinSummary] = useState(
    'Final-year B.S. Computer Science candidate passionate about distributed backend engineering, high-throughput APIs, and relational database optimization. Experienced with Python, FastAPI, PostgreSQL, and Redis queues through Distributed Ledger Lab internship and systems capstone.'
  );
  const [appliedKeywords, setAppliedKeywords] = useState<string[]>([]);

  const activeJob = initialJobs.find((j) => j.id === selectedRoleTarget) || initialJobs[0];
  const charCount = workingDraft.length;
  const isValidCharLength = charCount >= 30 && charCount <= 20000;

  // Dynamic 3-Dimensional AI Evaluation Metrics (Relevance, Evidence, Clarity, Overall Alignment)
  const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;
  const relevanceScore = Math.min(100, 76 + (suggestions.find((s) => s.id === 2)?.status === 'accepted' ? 14 : 0) + (acceptedCount * 2));
  const evidenceScore = Math.min(100, 72 + (suggestions.find((s) => s.id === 1)?.status === 'accepted' ? 18 : 0) + (acceptedCount * 2));
  const clarityScore = Math.min(100, 81 + (suggestions.find((s) => s.id === 3)?.status === 'accepted' ? 12 : 0) + (acceptedCount * 1));
  const overallAlignmentScore = Math.round((relevanceScore + evidenceScore + clarityScore) / 3);

  // Accept suggestion -> apply passage replacement into workingDraft
  const handleAcceptSuggestion = (id: number) => {
    const target = suggestions.find((s) => s.id === id);
    if (!target) return;

    if (workingDraft.includes(target.originalPassage)) {
      setWorkingDraft((prev) => prev.replace(target.originalPassage, target.proposedPassage));
    }
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'accepted' } : s)));
    setFactualConfirmed(false); // Require fresh factual confirmation after diff change
    onShowToast?.(`Accepted "${target.title}" into Working Draft.`, 'success');
  };

  // Reject suggestion
  const handleRejectSuggestion = (id: number) => {
    const target = suggestions.find((s) => s.id === id);
    if (!target) return;

    if (target.status === 'accepted' && workingDraft.includes(target.proposedPassage)) {
      setWorkingDraft((prev) => prev.replace(target.proposedPassage, target.originalPassage));
    }
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s)));
    onShowToast?.(`Rejected suggestion "${target.title}". Original passage preserved.`, 'info');
  };

  // Undo suggestion -> revert to pending and restore original passage in workingDraft
  const handleUndoSuggestion = (id: number) => {
    const target = suggestions.find((s) => s.id === id);
    if (!target) return;

    if (target.status === 'accepted' && workingDraft.includes(target.proposedPassage)) {
      setWorkingDraft((prev) => prev.replace(target.proposedPassage, target.originalPassage));
    }
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'pending' } : s)));
    onShowToast?.(`Reverted "${target.title}" back to original text.`, 'info');
  };

  // File Upload (TXT/DOCX ingestion 30 to 20,000 chars)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      if (content.length < 30 || content.length > 20000) {
        onShowToast?.('Document must be between 30 and 20,000 characters.', 'warning');
        return;
      }
      setOriginalDocument(content);
      setWorkingDraft(content);
      setFactualConfirmed(false);
      onShowToast?.(`Ingested "${file.name}" (${content.length} chars) into Split Workspace.`, 'success');
    };
    reader.readAsText(file);
  };

  // Export Guarded by Factual Confirmation
  const handleExport = (format: 'txt' | 'docx') => {
    if (!factualConfirmed) {
      onShowToast?.('Please check the factual accuracy confirmation box before exporting.', 'warning');
      return;
    }
    if (!isValidCharLength) {
      onShowToast?.('Document length must be between 30 and 20,000 characters.', 'warning');
      return;
    }
    const blob = new Blob([workingDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alex_Mercer_Resume_Verified.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.(`Exported factually confirmed resume (${format.toUpperCase()})`, 'success');
  };

  const handleSubmitReview = () => {
    setSubmittedForReview(true);
    onShowToast?.(
      'Resume submitted to Shared Faculty Review Queue (#FAC-2026-04). Private working draft remains unlocked.',
      'success'
    );
  };

  // LinkedIn Keyword Saturation & Suggestions
  const targetKeywords = [
    { kw: 'Distributed Systems', section: 'Headline & About', present: linkedinHeadline.includes('Distributed') || linkedinSummary.includes('distributed') },
    { kw: 'FastAPI / AsyncIO', section: 'About Summary', present: linkedinSummary.includes('FastAPI') },
    { kw: 'Docker Multi-Stage', section: 'Headline & Skills', present: appliedKeywords.includes('Docker Multi-Stage') || linkedinSummary.includes('Docker') },
    { kw: 'gRPC Microservices', section: 'About Summary', present: appliedKeywords.includes('gRPC Microservices') || linkedinSummary.includes('gRPC') },
    { kw: 'PostgreSQL Query Optimization', section: 'Experience & About', present: linkedinSummary.includes('PostgreSQL') },
    { kw: 'CI/CD GitHub Actions', section: 'Featured Skills', present: appliedKeywords.includes('CI/CD GitHub Actions') },
  ];

  const saturatedCount = targetKeywords.filter((k) => k.present).length;
  const keywordSaturationPct = Math.round((saturatedCount / targetKeywords.length) * 100);

  const handleApplyLinkedinKeyword = (kw: string) => {
    if (appliedKeywords.includes(kw)) {
      setAppliedKeywords((prev) => prev.filter((item) => item !== kw));
      onShowToast?.(`Removed "${kw}" from LinkedIn draft.`, 'info');
    } else {
      setAppliedKeywords((prev) => [...prev, kw]);
      if (!linkedinSummary.includes(kw)) {
        setLinkedinSummary((prev) => `${prev} Proven competency in ${kw}.`);
      }
      onShowToast?.(`Injected "${kw}" into LinkedIn About summary for recruiter discoverability.`, 'success');
    }
  };

  const studentFacultyReview = initialSharedReviews.find((r) => r.studentId === '#STU-2026-88');

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Module Switcher: Module D (Resume Analyzer) vs Module E (LinkedIn Optimizer) */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#9A9A9A]">
            <span className="text-[#8052ff] font-semibold">CAREER ASSETS &amp; PUBLIC INSIGHTS</span>
            <span>·</span>
            <span>Factual Integrity Guard Active</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            {workspaceTab === 'resume'
              ? 'Resume Analyzer & Target Alignment Stream'
              : 'LinkedIn Profile Optimizer & Keyword Diagnostic'}
          </h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            {workspaceTab === 'resume'
              ? 'Interactive passage diffing with Accept / Reject / Undo controls, 3D alignment scoring, and factual confirmation guard.'
              : 'Headline evaluation, About summary critique, and strategic keyword saturation relative to your target role.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#16161A] p-1.5 rounded-lg border border-[#202023] self-start lg:self-auto">
          <button
            onClick={() => setWorkspaceTab('resume')}
            className={`px-3.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              workspaceTab === 'resume'
                ? 'bg-[#8052ff] text-white font-semibold'
                : 'text-[#9A9A9A] hover:text-white'
            }`}
          >
            Resume Analyzer &amp; Diffs
          </button>
          <button
            onClick={() => setWorkspaceTab('linkedin')}
            className={`px-3.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              workspaceTab === 'linkedin'
                ? 'bg-[#8052ff] text-white font-semibold'
                : 'text-[#9A9A9A] hover:text-white'
            }`}
          >
            LinkedIn Optimizer
          </button>
        </div>
      </div>

      {workspaceTab === 'resume' ? (
        <>
          {/* Target Role Selection & Document Ingestion Bar */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="flex-1">
                <label className="block text-[11px] font-mono text-[#9A9A9A] mb-1">
                  Target Role Selection (Discovered Job or Custom)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedRoleTarget}
                    onChange={(e) => setSelectedRoleTarget(e.target.value)}
                    className="bg-[#16161A] border border-[#363639] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#8052ff]"
                  >
                    {initialJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company} ({j.source})
                      </option>
                    ))}
                    <option value="custom">Custom Target Role...</option>
                  </select>
                  {selectedRoleTarget === 'custom' && (
                    <input
                      type="text"
                      placeholder="Enter custom target role title..."
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      className="bg-[#16161A] border border-[#363639] rounded px-3 py-1.5 text-xs text-white flex-1"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <label className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#cdbdff] border border-[#363639] rounded transition-colors cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">upload_file</span>
                <span>Upload TXT/DOCX</span>
                <input type="file" accept=".txt,.docx,.doc" className="hidden" onChange={handleFileUpload} />
              </label>

              <button
                onClick={() => setViewMode(viewMode === 'side-by-side' ? 'working-only' : 'side-by-side')}
                className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors cursor-pointer"
              >
                {viewMode === 'side-by-side' ? 'Single Draft View' : 'Side-by-Side Split View'}
              </button>

              <button
                onClick={handleSubmitReview}
                disabled={submittedForReview}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                  submittedForReview
                    ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40'
                    : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {submittedForReview ? 'check_circle' : 'assignment_turned_in'}
                </span>
                <span>{submittedForReview ? 'Submitted to Queue' : 'Submit to Faculty Queue'}</span>
              </button>
            </div>
          </div>

          {/* 3-Dimensional AI Evaluation Metrics + Overall Alignment Score (0-100) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                <span>OVERALL ALIGNMENT</span>
                <span className="material-symbols-outlined text-[18px] text-[#8052ff]">verified</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1.5">
                {overallAlignmentScore} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-[#16161A] rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#8052ff]" style={{ width: `${overallAlignmentScore}%` }} />
              </div>
            </div>

            <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                <span>1. RELEVANCE</span>
                <span className="text-[#cdbdff]">Role Match</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#cdbdff] mt-1.5">
                {relevanceScore} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-[#16161A] rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#cdbdff]" style={{ width: `${relevanceScore}%` }} />
              </div>
            </div>

            <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                <span>2. EVIDENCE</span>
                <span className="text-[#55C98B]">Quantification</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#55C98B] mt-1.5">
                {evidenceScore} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-[#16161A] rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#55C98B]" style={{ width: `${evidenceScore}%` }} />
              </div>
            </div>

            <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                <span>3. CLARITY</span>
                <span className="text-[#ffba35]">Active Syntax</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#ffba35] mt-1.5">
                {clarityScore} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
              </div>
              <div className="w-full h-1.5 bg-[#16161A] rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#ffba35]" style={{ width: `${clarityScore}%` }} />
              </div>
            </div>
          </div>

          {/* Contextual Faculty Review Comment Banner (Read-only advisory without mutating student's private draft) */}
          {studentFacultyReview && (
            <div className="bg-[#16161A] border border-[#363639] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#cdbdff] text-[18px] mt-0.5">comment</span>
                <div>
                  <span className="font-semibold text-white">
                    Faculty Contextual Note (Prof. Sarah Jenkins · {studentFacultyReview.version}):
                  </span>{' '}
                  <span className="text-[#BDBDBD]">&ldquo;{studentFacultyReview.facultyNote}&rdquo;</span>
                  <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                    Non-mutating advisory: Your private working draft is never overwritten by faculty comments.
                  </div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#ffba35] shrink-0">
                Queue Status: {submittedForReview ? 'Submitted (v4.2)' : 'Pending Review'}
              </span>
            </div>
          )}

          {/* Main Grid: Left Target Alignment Stream (Diffs) / Right Split Workspace Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 Cols): Target Alignment Stream with Accept / Reject / Undo */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8052ff] text-[18px]">compare_arrows</span>
                    <h2 className="text-sm font-semibold text-white">Target Alignment Stream (Diffs)</h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#8B8B93]">
                    {acceptedCount}/{suggestions.length} Accepted
                  </span>
                </div>

                <div className="space-y-3.5 mt-3.5">
                  {suggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className={`p-3.5 rounded border transition-all ${
                        sug.status === 'accepted'
                          ? 'bg-[#16161A] border-[#55C98B]/40'
                          : sug.status === 'rejected'
                          ? 'bg-[#16161A]/40 border-[#202023] opacity-70'
                          : 'bg-[#16161A] border-[#202023] hover:border-[#8052ff]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-white">{sug.title}</span>
                          <div className="text-[11px] font-mono text-[#9A9A9A]">
                            Dimension: {sug.category} · {sug.priority}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono">
                          {sug.status === 'accepted' ? (
                            <span className="text-[#55C98B] font-bold">Accepted ✓</span>
                          ) : sug.status === 'rejected' ? (
                            <span className="text-[#F87171]">Rejected</span>
                          ) : (
                            <span className="text-[#ffba35]">Pending</span>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-[#8B8B93] mt-2">{sug.rationale}</p>

                      {/* Original vs Proposed Passage */}
                      <div className="mt-2.5 p-2.5 bg-black border border-[#202023] rounded text-[11px] font-mono space-y-1.5">
                        <div className="text-[#F87171] line-through">{sug.originalPassage}</div>
                        <div className="text-[#55C98B]">{sug.proposedPassage}</div>
                      </div>

                      {/* Granular Accept / Reject / Undo Controls */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#202023]">
                        <span className="text-[10px] text-[#8B8B93] font-mono">{sug.ruleRef}</span>
                        <div className="flex items-center gap-1.5">
                          {sug.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleRejectSuggestion(sug.id)}
                                className="px-2.5 py-1 text-xs font-mono rounded bg-[#202023] hover:bg-[#363639] text-[#D6D6DC] cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAcceptSuggestion(sug.id)}
                                className="px-2.5 py-1 text-xs font-mono rounded bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-semibold cursor-pointer"
                              >
                                Accept
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUndoSuggestion(sug.id)}
                              className="px-2.5 py-1 text-xs font-mono rounded bg-[#202023] hover:bg-[#363639] text-[#ffba35] flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[13px]">undo</span>
                              <span>Undo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Split Workspace Editor + Factual Review Guard */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden flex flex-col">
                {/* Editor Shelf Header */}
                <div className="px-4 py-2.5 bg-[#16161A] border-b border-[#202023] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {viewMode === 'side-by-side'
                        ? 'Split Workspace: Original Document vs. Working Draft'
                        : 'Working Draft Editor'}
                    </span>
                    {acceptedCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#FFFF00] text-black font-bold text-[10px] rounded">
                        {acceptedCount} DIFF HIGHLIGHT{acceptedCount > 1 ? 'S' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className={isValidCharLength ? 'text-[#55C98B]' : 'text-[#EB5757]'}>
                      {charCount} / 20,000 chars (min 30)
                    </span>
                  </div>
                </div>

                {/* Split Workspace Body */}
                <div
                  className={`grid ${
                    viewMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x' : 'grid-cols-1'
                  } divide-[#202023] h-[540px]`}
                >
                  {viewMode === 'side-by-side' && (
                    <div className="p-4 bg-[#08080A] overflow-y-auto flex flex-col">
                      <div className="text-[11px] font-mono text-[#9A9A9A] uppercase mb-2 pb-1 border-b border-[#202023]">
                        Original Document (Read-Only Baseline)
                      </div>
                      <div className="font-mono text-xs leading-relaxed text-[#9A9A9A] whitespace-pre-wrap">
                        {originalDocument}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-black overflow-y-auto flex flex-col">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#cdbdff] uppercase mb-2 pb-1 border-b border-[#202023]">
                      <span>Working Draft (Editable + Synchronized Highlights)</span>
                    </div>
                    <textarea
                      value={workingDraft}
                      onChange={(e) => {
                        setWorkingDraft(e.target.value);
                        setFactualConfirmed(false);
                      }}
                      className="w-full flex-1 bg-transparent font-mono text-xs text-[#D6D6DC] leading-relaxed resize-none focus:outline-none"
                      spellCheck={false}
                    />
                    {acceptedCount > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#202023] space-y-1">
                        <div className="text-[10px] font-mono text-[#9A9A9A]">Synchronized Replacement Highlights:</div>
                        {suggestions
                          .filter((s) => s.status === 'accepted')
                          .map((s) => (
                            <div
                              key={s.id}
                              className="bg-[#FFFF00] text-black px-2 py-1 rounded font-mono text-[11px] font-bold"
                            >
                              {s.proposedPassage}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Factual Review Guard & Export Bar */}
                <div className="p-4 bg-[#16161A] border-t border-[#202023] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="flex items-center gap-2.5 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={factualConfirmed}
                      onChange={(e) => setFactualConfirmed(e.target.checked)}
                      className="w-4 h-4 accent-[#55C98B] cursor-pointer"
                    />
                    <span>
                      <strong>Factual Review Guard:</strong>{' '}
                      <em>&ldquo;I confirm all revised claims and metrics are factually accurate.&rdquo;</em>
                    </span>
                  </label>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleExport('txt')}
                      disabled={!factualConfirmed || !isValidCharLength}
                      className="px-3 py-1.5 rounded bg-[#202023] hover:bg-[#363639] text-white text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={() => handleExport('docx')}
                      disabled={!factualConfirmed || !isValidCharLength}
                      className="px-3.5 py-1.5 rounded bg-[#55C98B] hover:bg-[#55C98B]/90 text-black font-bold text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Export DOCX</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* MODULE E: LinkedIn Optimizer & Public Insights */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Headline & Summary Interactive Critique (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
                <div>
                  <h2 className="text-base font-bold text-white">LinkedIn Profile Diagnostic</h2>
                  <p className="text-xs text-[#9A9A9A]">
                    Target Role Benchmark: <strong className="text-white">{activeJob.title}</strong>
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-[#9A9A9A]">Keyword Saturation: </span>
                  <span className="text-base font-bold text-[#55C98B] tabular-nums">{keywordSaturationPct}%</span>
                </div>
              </div>

              {/* Headline Evaluation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white">1. Headline Evaluation (Max 220 chars)</label>
                  <span className="font-mono text-[#9A9A9A] tabular-nums">{linkedinHeadline.length} / 220 chars</span>
                </div>
                <input
                  type="text"
                  value={linkedinHeadline}
                  onChange={(e) => setLinkedinHeadline(e.target.value)}
                  className="w-full bg-[#16161A] border border-[#363639] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono"
                />
                <div className="p-3 rounded bg-[#16161A] border border-[#202023] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#ffba35] font-semibold">Critique: Missing Architecture &amp; Scale Keywords</span>
                    <button
                      onClick={() => {
                        setLinkedinHeadline(
                          'Incoming Backend Systems Engineer (Class of 2026) | Distributed Systems, Python/FastAPI, PostgreSQL & Docker'
                        );
                        onShowToast?.('Applied high-discoverability Headline recommendation!', 'success');
                      }}
                      className="text-[#cdbdff] hover:underline font-mono text-[11px] cursor-pointer"
                    >
                      Apply Suggested Headline →
                    </button>
                  </div>
                  <p className="text-[#9A9A9A]">
                    Recruiter boolean searches for Junior Backend roles filter on exact stack pairings (&ldquo;Distributed Systems&rdquo;, &ldquo;FastAPI&rdquo;, &ldquo;PostgreSQL&rdquo;) in the first 120 characters.
                  </p>
                </div>
              </div>

              {/* About / Summary Critique */}
              <div className="space-y-2 pt-2 border-t border-[#202023]">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white">2. About / Summary Critique</label>
                  <span className="font-mono text-[#55C98B]">Evidence Grounded</span>
                </div>
                <textarea
                  rows={5}
                  value={linkedinSummary}
                  onChange={(e) => setLinkedinSummary(e.target.value)}
                  className="w-full bg-[#16161A] border border-[#363639] rounded-lg p-3 text-xs text-white font-mono leading-relaxed"
                />
                <div className="p-3 rounded bg-[#16161A] border border-[#202023] text-xs text-[#9A9A9A]">
                  <strong className="text-white">Summary Diagnostic:</strong> Strong academic and internship framing. Add quantified latency metrics (420ms → 68ms) and container orchestration keywords to boost technical recruiter dwell time.
                </div>
              </div>
            </div>
          </div>

          {/* Right: Keyword Saturation & Strategic Placement Suggestions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
              <div className="pb-3 border-b border-[#202023]">
                <h3 className="text-sm font-semibold text-white">Strategic Keyword Placement &amp; Saturation</h3>
                <p className="text-xs text-[#9A9A9A]">
                  Click any missing keyword to inject or undo placement in your working summary.
                </p>
              </div>

              <div className="space-y-2.5">
                {targetKeywords.map((item) => (
                  <div
                    key={item.kw}
                    className="p-3 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-white">{item.kw}</div>
                      <div className="text-[11px] text-[#9A9A9A]">Recommended Zone: {item.section}</div>
                    </div>
                    <button
                      onClick={() => handleApplyLinkedinKeyword(item.kw)}
                      className={`px-2.5 py-1 rounded font-mono text-[11px] cursor-pointer ${
                        item.present
                          ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40'
                          : 'bg-[#8052ff] text-white hover:bg-[#8052ff]/90'
                      }`}
                    >
                      {item.present ? 'Present ✓' : '+ Inject Keyword'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
