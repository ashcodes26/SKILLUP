import React, { useState } from 'react';
import { initialSharedReviews } from '../../data/mockData';

interface ResumeAnalyzerScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function ResumeAnalyzerScreen({ onNavigate, onShowToast }: ResumeAnalyzerScreenProps) {
  const [editorMode, setEditorMode] = useState<'split' | 'preview'>('split');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'ats_checks' | 'diff'>('suggestions');
  
  // Resume content state
  const [resumeText, setResumeText] = useState(`ALEX R. MERCER
alex.mercer@cs.edu | +1 (555) 019-2834 | github.com/alex-mercer | San Francisco, CA

EDUCATION
B.S. in Computer Science & Engineering | Anticipated Dec 2026
University Placement Division | Cumulative GPA: 3.82 / 4.00
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
• Containerized services using Docker multi-stage builds to minimize runtime attack surface and image size.
`);

  const [replacedHighlight, setReplacedHighlight] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<number[]>([]);
  const [submittedForReview, setSubmittedForReview] = useState(false);

  const handleApplySuggestion = (id: number) => {
    if (id === 1) {
      // Replace query bullet
      const oldBullet = "• Implemented PostgreSQL database indexing to optimize slow queries for the order service.";
      const newBullet = "• Architected composite B-tree indices on PostgreSQL 15, reducing 99th percentile query latency from 420ms to 68ms under 4,500 req/s load.";
      if (resumeText.includes(oldBullet)) {
        setResumeText(resumeText.replace(oldBullet, newBullet));
      }
      setAppliedSuggestions(prev => [...prev, 1]);
      setReplacedHighlight(true);
      onShowToast?.("Applied quantified metric replacement to order service bullet!", "success");
    } else if (id === 2) {
      // Insert Docker competency
      const targetSec = "Infrastructure & Cloud: Docker, Kubernetes, Linux (Ubuntu/Debian), GitHub Actions CI/CD";
      const updatedSec = "Infrastructure & Cloud: Docker (Multi-stage builds, Alpine), Kubernetes, Linux (Ubuntu/Debian), GitHub Actions CI/CD";
      if (resumeText.includes(targetSec)) {
        setResumeText(resumeText.replace(targetSec, updatedSec));
      }
      setAppliedSuggestions(prev => [...prev, 2]);
      onShowToast?.("Added verified Docker containerization profile to Technical Competencies!", "success");
    } else if (id === 3) {
      // Action verb upgrade
      const oldText = "• Built Python-based gRPC routing daemon";
      const newText = "• Engineered and benchmarked Python-based gRPC routing daemon";
      if (resumeText.includes(oldText)) {
        setResumeText(resumeText.replace(oldText, newText));
      }
      setAppliedSuggestions(prev => [...prev, 3]);
      onShowToast?.("Upgraded passive verb to high-impact technical action verb!", "success");
    }
  };

  const handleExport = (format: 'txt' | 'docx') => {
    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alex_Mercer_Resume_V4_${format === 'docx' ? 'export.txt' : 'plain.txt'}`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.(`Exported verified resume version (${format.toUpperCase()})`, 'info');
  };

  const handleSubmitReview = () => {
    setSubmittedForReview(true);
    onShowToast?.("Resume submitted to Prof. Sarah Jenkins (#FAC-2026-04) for drive endorsement!", "success");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 5-Stage Pipeline Tracker */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#55C98B] whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-[#55C98B]/20 text-[#55C98B] flex items-center justify-center font-bold">✓</span>
            <span>1. Profile Ingestion</span>
          </div>
          <span className="text-[#363639]">——</span>
          <div className="flex items-center gap-2 text-[#55C98B] whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-[#55C98B]/20 text-[#55C98B] flex items-center justify-center font-bold">✓</span>
            <span>2. Schema Validation</span>
          </div>
          <span className="text-[#363639]">——</span>
          <div className="flex items-center gap-2 text-[#55C98B] whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-[#55C98B]/20 text-[#55C98B] flex items-center justify-center font-bold">✓</span>
            <span>3. Evidence Extraction</span>
          </div>
          <span className="text-[#363639]">——</span>
          <div className="flex items-center gap-2 text-[#8052ff] font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-[#8052ff] text-white flex items-center justify-center">4</span>
            <span>4. Target Alignment & Tuning</span>
          </div>
          <span className="text-[#363639]">——</span>
          <div className="flex items-center gap-2 text-[#8B8B93] whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-[#16161A] text-[#8B8B93] border border-[#363639] flex items-center justify-center">5</span>
            <span>5. Placement Endorsement</span>
          </div>
        </div>
      </div>

      {/* Control Bar Header */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Career Asset Tuning: Technical Resume V4</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/20 text-[#8052ff] border border-[#8052ff]/40">
              ROLE: BACKEND SYSTEMS (CLOUDSCALE)
            </span>
          </div>
          <p className="text-xs text-[#8B8B93]">
            Audited against IEEE P2863 rubric & CloudScale Placement Drive Requirements. Last scanned: Today, 10:14 AM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Concordance score indicator */}
          <div className="flex items-center gap-2 bg-[#16161A] px-3 py-1.5 rounded border border-[#202023]">
            <span className="text-xs text-[#8B8B93]">ATS Concordance:</span>
            <span className="font-mono text-sm font-bold text-[#55C98B]">
              {appliedSuggestions.length === 0 ? '78%' : appliedSuggestions.length === 1 ? '86%' : '94%'}
            </span>
          </div>

          <button
            onClick={() => setEditorMode(editorMode === 'split' ? 'preview' : 'split')}
            className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors"
          >
            {editorMode === 'split' ? 'Preview Highlighted Diff' : 'Editor Split View'}
          </button>

          <div className="relative group">
            <button
              onClick={() => handleExport('docx')}
              className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              Export DOCX/TXT
            </button>
          </div>

          <button
            onClick={handleSubmitReview}
            disabled={submittedForReview}
            className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
              submittedForReview
                ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
                : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {submittedForReview ? 'check_circle' : 'assignment_turned_in'}
            </span>
            {submittedForReview ? 'Review Requested (#FAC-2026-04)' : 'Request Faculty Review'}
          </button>
        </div>
      </div>

      {submittedForReview && (
        <div className="bg-[#55C98B]/10 border border-[#55C98B]/30 rounded-lg p-3 text-xs text-[#55C98B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Resume revision v4.2 dispatched to Prof. Sarah Jenkins (#FAC-2026-04) for drive endorsement review.</span>
          </div>
          <button
            onClick={() => onNavigate?.('placement-hub')}
            className="underline hover:text-white font-mono font-semibold"
          >
            View Placement Hub Status →
          </button>
        </div>
      )}

      {/* Main Grid: Left Suggestions Stream / Right Interactive Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Suggestions & Rubrics Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8052ff] text-[18px]">psychology</span>
                <h2 className="text-sm font-semibold text-white">Target Role Evidence Alignments</h2>
              </div>
              <span className="text-[11px] font-mono text-[#8B8B93]">
                {appliedSuggestions.length}/3 Applied
              </span>
            </div>

            <div className="space-y-3.5 mt-3.5">
              {/* Suggestion 1: Quantified Metric Missing */}
              <div className={`p-3.5 rounded border transition-all ${
                appliedSuggestions.includes(1) 
                  ? 'bg-[#16161A]/60 border-[#55C98B]/30 opacity-75' 
                  : 'bg-[#16161A] border-[#202023] hover:border-[#8052ff]/40'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ffba35]"></span>
                    <span className="text-xs font-semibold text-white">Impact Metric Missing</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#ffba35]/10 text-[#ffba35] px-1.5 py-0.5 rounded border border-[#ffba35]/20">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-[#8B8B93] mt-2">
                  CloudScale technical evaluators filter for quantified database scale benchmarks. Replace generic query optimization claim with benchmark parameters:
                </p>
                <div className="mt-2.5 p-2 bg-[#000000] border border-[#202023] rounded text-[11px] font-mono space-y-1.5">
                  <div className="text-[#F87171] line-through">
                    - Implemented PostgreSQL database indexing to optimize slow queries for the order service.
                  </div>
                  <div className="text-[#55C98B]">
                    + Architected composite B-tree indices on PostgreSQL 15, reducing 99th percentile query latency from 420ms to 68ms under 4,500 req/s load.
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8B8B93] font-mono">IEEE P2863 Evidence Rule §4.2</span>
                  <button
                    onClick={() => handleApplySuggestion(1)}
                    disabled={appliedSuggestions.includes(1)}
                    className={`px-2.5 py-1 text-xs font-mono rounded ${
                      appliedSuggestions.includes(1)
                        ? 'bg-[#55C98B]/20 text-[#55C98B] cursor-default'
                        : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                    }`}
                  >
                    {appliedSuggestions.includes(1) ? 'Applied ✓' : 'Replace into Editor'}
                  </button>
                </div>
              </div>

              {/* Suggestion 2: Docker Evidence Injection */}
              <div className={`p-3.5 rounded border transition-all ${
                appliedSuggestions.includes(2) 
                  ? 'bg-[#16161A]/60 border-[#55C98B]/30 opacity-75' 
                  : 'bg-[#16161A] border-[#202023] hover:border-[#8052ff]/40'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8052ff]"></span>
                    <span className="text-xs font-semibold text-white">Containerization Specificity</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#8052ff]/10 text-[#8052ff] px-1.5 py-0.5 rounded border border-[#8052ff]/20">
                    ATS Keyword Match
                  </span>
                </div>
                <p className="text-xs text-[#8B8B93] mt-2">
                  Mandatory threshold for CloudScale drive is Docker orchestration (Level 3.0+). Add Alpine multi-stage build tag into competencies:
                </p>
                <div className="mt-2.5 p-2 bg-[#000000] border border-[#202023] rounded text-[11px] font-mono text-[#55C98B]">
                  Docker (Multi-stage builds, Alpine)
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8B8B93] font-mono">Drive Prerequisite #CS-2026</span>
                  <button
                    onClick={() => handleApplySuggestion(2)}
                    disabled={appliedSuggestions.includes(2)}
                    className={`px-2.5 py-1 text-xs font-mono rounded ${
                      appliedSuggestions.includes(2)
                        ? 'bg-[#55C98B]/20 text-[#55C98B] cursor-default'
                        : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                    }`}
                  >
                    {appliedSuggestions.includes(2) ? 'Applied ✓' : 'Insert into Competencies'}
                  </button>
                </div>
              </div>

              {/* Suggestion 3: Action Verb Strength */}
              <div className={`p-3.5 rounded border transition-all ${
                appliedSuggestions.includes(3) 
                  ? 'bg-[#16161A]/60 border-[#55C98B]/30 opacity-75' 
                  : 'bg-[#16161A] border-[#202023] hover:border-[#8052ff]/40'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#55C98B]"></span>
                    <span className="text-xs font-semibold text-white">Active Voice Optimization</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#55C98B]/10 text-[#55C98B] px-1.5 py-0.5 rounded border border-[#55C98B]/20">
                    Stylistic Lift
                  </span>
                </div>
                <p className="text-xs text-[#8B8B93] mt-2">
                  Replace passive verb &quot;Built&quot; in Capstone with leadership-oriented systems terminology &quot;Engineered and benchmarked&quot;.
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8B8B93] font-mono">Syntactic Density §2.1</span>
                  <button
                    onClick={() => handleApplySuggestion(3)}
                    disabled={appliedSuggestions.includes(3)}
                    className={`px-2.5 py-1 text-xs font-mono rounded ${
                      appliedSuggestions.includes(3)
                        ? 'bg-[#55C98B]/20 text-[#55C98B] cursor-default'
                        : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                    }`}
                  >
                    {appliedSuggestions.includes(3) ? 'Applied ✓' : 'Apply Fix'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Card */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-2">
              Faculty Endorsement Requirements
            </h3>
            <ul className="text-xs text-[#8B8B93] space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-[#55C98B]">✓</span>
                <span>Minimum 3.50 Cumulative GPA (Alex: 3.82)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#55C98B]">✓</span>
                <span>Python Advanced Diagnostic Completed (#PY-204)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#ffba35]">!</span>
                <span className="text-white">Docker Hands-on Lab Quiz (#DCK-101) pending verified score</span>
              </li>
            </ul>
            <button
              onClick={() => onNavigate?.('placement-hub')}
              className="mt-3 w-full py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#8052ff] border border-[#202023] rounded text-center transition-colors block"
            >
              Take Docker Lab Quiz (#DCK-101) in Placement Hub →
            </button>
          </div>
        </div>

        {/* Right Editor & Diff Preview Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden flex flex-col h-[700px]">
            {/* Editor Shelf Header */}
            <div className="px-4 py-2.5 bg-[#16161A] border-b border-[#202023] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-[#8B8B93]">Document:</span>
                <span className="text-white font-medium">alex_mercer_resume_2026.txt</span>
                {replacedHighlight && (
                  <span className="px-1.5 py-0.2 bg-[#FFFF00] text-black font-bold text-[10px] rounded">
                    DIFF HIGHLIGHT ACTIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[#8B8B93]">
                <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                <span>•</span>
                <span>{resumeText.length} chars</span>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 p-4 bg-[#000000] overflow-y-auto">
              {editorMode === 'split' ? (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-[#D6D6DC] leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-[#8052ff]/40"
                  spellCheck={false}
                />
              ) : (
                /* Preview with yellow highlight on replaced diff matching Dark Void token: #FFFF00 */
                <div className="font-mono text-xs sm:text-sm leading-relaxed text-[#D6D6DC] whitespace-pre-wrap">
                  {resumeText.split('\n').map((line, idx) => {
                    if (
                      line.includes('Architected composite B-tree indices on PostgreSQL 15') ||
                      line.includes('Docker (Multi-stage builds, Alpine)') ||
                      line.includes('Engineered and benchmarked')
                    ) {
                      return (
                        <div key={idx} className="bg-[#FFFF00] text-[#000000] px-1 py-0.5 rounded font-bold my-0.5">
                          {line}
                        </div>
                      );
                    }
                    if (line.startsWith('ALEX R. MERCER')) {
                      return <div key={idx} className="text-base font-bold text-white mb-1">{line}</div>;
                    }
                    if (line.startsWith('EDUCATION') || line.startsWith('TECHNICAL COMPETENCIES') || line.startsWith('PROJECTS & EXPERIENCE')) {
                      return <div key={idx} className="font-bold text-[#8052ff] border-b border-[#202023] pb-0.5 mt-3 mb-1">{line}</div>;
                    }
                    return <div key={idx}>{line || '\u00A0'}</div>;
                  })}
                </div>
              )}
            </div>

            {/* Footer Status inside editor */}
            <div className="p-3 bg-[#0D0D0F] border-t border-[#202023] flex items-center justify-between text-xs font-mono text-[#8B8B93]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#55C98B]"></span>
                <span>UTF-8 Document Validated</span>
              </div>
              <div>
                <span>Standard Sectioning: 4 / 4 Found</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
