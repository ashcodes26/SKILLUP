import React, { useState } from 'react';
import { initialDrives, initialRemediations } from '../../data/mockData';

interface PlacementHubScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onDockerQuizCompleted?: () => void;
}

export default function PlacementHubScreen({
  onNavigate,
  onShowToast,
  onDockerQuizCompleted,
}: PlacementHubScreenProps) {
  const [drives, setDrives] = useState(initialDrives);
  const [dockerCompleted, setDockerCompleted] = useState(false);
  const [activeQuizModal, setActiveQuizModal] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [appliedDriveIds, setAppliedDriveIds] = useState<string[]>([]);

  // Quiz questions for #DCK-101
  const quizQuestions = [
    {
      id: 1,
      question: "Which Dockerfile instruction properly creates a minimal final runtime container in a multi-stage build?",
      options: [
        "FROM alpine:3.19 AS final followed by COPY --from=builder /app/bin /app/bin",
        "RUN docker-squash --stage 2",
        "EXPOSE ALL --strip-debug-symbols",
        "CMD ['--runtime-clean']"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "Which restart policy ensures high-concurrency daemons automatically recover after host daemon restarts?",
      options: [
        "--restart unless-stopped",
        "--auto-recover 30s",
        "--policy immortal",
        "--daemon-persist true"
      ],
      correct: 0
    },
    {
      id: 3,
      question: "How does Docker cache layers efficiently during multi-service builds?",
      options: [
        "SHA-256 checksum of instructions and file contents preceding cache invalidation",
        "Host filesystem modification timestamps only",
        "Sequential line indices in the Dockerfile",
        "Git commit hashes matching git-HEAD"
      ],
      correct: 0
    }
  ];

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleFinishQuiz = () => {
    setQuizSubmitted(true);
    setDockerCompleted(true);
    onDockerQuizCompleted?.();
    onShowToast?.("Docker Quiz #DCK-101 passed with 100%! Verified score: 4.0 recorded in transcript.", "success");
  };

  const handleApplyDrive = (driveId: string, company: string) => {
    setAppliedDriveIds(prev => [...prev, driveId]);
    onShowToast?.(`Successfully applied to ${company} placement pool with faculty-endorsed credentials!`, 'success');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Placement Hub Header */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#55C98B]/10 text-[#55C98B] border border-[#55C98B]/30">
              CAMPUS RECRUITING REPERTORY
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Cohort 2026 • CSE</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Campus Placement Hub & Recruiting Drives</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Active campus interview schedules, institutional gate validations, and accredited remediation assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.('career-plan')}
            className="px-3.5 py-2 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors"
          >
            ← Back to Career Plan
          </button>
          <button
            onClick={() => onNavigate?.('resume-analyzer')}
            className="px-3.5 py-2 bg-[#8052ff] hover:bg-[#8052ff]/90 text-xs font-mono text-white rounded transition-colors"
          >
            Review Resume Assets
          </button>
        </div>
      </div>

      {/* Institutional Gate Status Alert */}
      {!dockerCompleted ? (
        <div className="bg-[#ffba35]/10 border border-[#ffba35]/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ffba35] text-[22px] mt-0.5">notification_important</span>
            <div>
              <div className="text-sm font-bold text-white">Gated Prerequisite: Docker Containerization Lab (#DCK-101)</div>
              <p className="text-xs text-[#D6D6DC] mt-0.5">
                CloudScale Systems requires verified competency in Docker (minimum 3.0). Complete the 3-question hands-on quiz to unlock eligibility.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveQuizModal(true)}
            className="px-4 py-2 bg-[#ffba35] hover:bg-[#ffba35]/90 text-black text-xs font-mono font-bold rounded whitespace-nowrap transition-colors"
          >
            Launch Quiz #DCK-101 Now →
          </button>
        </div>
      ) : (
        <div className="bg-[#55C98B]/10 border border-[#55C98B]/40 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#55C98B] text-[22px]">verified</span>
            <div>
              <div className="text-sm font-bold text-white">All Institutional Prerequisites Verified (100% Eligible)</div>
              <p className="text-xs text-[#55C98B] mt-0.5">
                Docker Containerization Lab score: 4.0 / 5.0 recorded. CloudScale drive gate is fully unlocked.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded text-xs font-mono bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 font-bold">
            TIER 1 CLEARED
          </span>
        </div>
      )}

      {/* Active Campus Drives Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            Active Campus Recruiting Drives (3)
          </h2>
          <span className="text-xs font-mono text-[#8B8B93]">Synchronized with Placement Cell</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {drives.map((drive) => {
            const isGated = drive.id === 'drive-1' && !dockerCompleted;
            const isApplied = appliedDriveIds.includes(drive.id);

            return (
              <div
                key={drive.id}
                className={`bg-[#0D0D0F] border rounded-lg p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isGated
                    ? 'border-[#ffba35]/30'
                    : 'border-[#202023] hover:border-[#8052ff]/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#8052ff] uppercase tracking-wider font-semibold">
                        {drive.track}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{drive.company}</h3>
                      <p className="text-xs text-[#8B8B93]">{drive.role}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isGated
                          ? 'bg-[#ffba35]/10 text-[#ffba35] border-[#ffba35]/30'
                          : 'bg-[#55C98B]/10 text-[#55C98B] border-[#55C98B]/30'
                      }`}
                    >
                      {isGated ? 'Gated (#DCK-101)' : 'Eligible'}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-[#16161A] rounded border border-[#202023] space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-[#8B8B93]">
                      <span>Package:</span>
                      <span className="text-[#55C98B] font-bold">{drive.compensation}</span>
                    </div>
                    <div className="flex justify-between text-[#8B8B93]">
                      <span>Cutoff Date:</span>
                      <span className="text-white">{drive.cutoffDate}</span>
                    </div>
                    <div className="flex justify-between text-[#8B8B93]">
                      <span>Min Readiness:</span>
                      <span className="text-white">{drive.benchmarkReadiness}%</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-mono text-[#8B8B93]">Mandatory Skill Thresholds:</span>
                    <div className="flex flex-wrap gap-1">
                      {drive.mandatorySkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#000000] border border-[#202023] rounded text-[10px] font-mono text-[#D6D6DC]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#202023]">
                  {isGated ? (
                    <button
                      onClick={() => setActiveQuizModal(true)}
                      className="w-full py-2 bg-[#ffba35] hover:bg-[#ffba35]/90 text-black text-xs font-mono font-bold rounded transition-colors"
                    >
                      Complete Prerequisite (#DCK-101)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyDrive(drive.id, drive.company)}
                      disabled={isApplied}
                      className={`w-full py-2 text-xs font-mono font-bold rounded transition-colors flex items-center justify-center gap-1.5 ${
                        isApplied
                          ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
                          : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isApplied ? 'check' : 'send'}
                      </span>
                      {isApplied ? 'Application Submitted' : 'Submit Endorsed Profile'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accredited Remediation & Training Catalog */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
          <div>
            <h2 className="text-sm font-semibold text-white">Institutional Remediation & Competency Modules</h2>
            <p className="text-xs text-[#8B8B93]">Official department labs required to clear prerequisite deficit gates</p>
          </div>
          <span className="text-xs font-mono text-[#8B8B93]">Dept: Computer Science & Engineering</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {initialRemediations.map((mod) => (
            <div
              key={mod.id}
              className="p-4 bg-[#16161A] border border-[#202023] rounded-lg hover:border-[#363639] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#8052ff]/20 text-[#8052ff] border border-[#8052ff]/30 font-bold">
                    {mod.code}
                  </span>
                  <span className="text-[#8B8B93]">{mod.type}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                <p className="text-xs text-[#8B8B93] mt-1.5 leading-relaxed">{mod.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#202023] flex items-center justify-between text-xs font-mono">
                <span className="text-[#55C98B]">Avg Pass: {mod.avgPassPct}%</span>
                {mod.code === '#DCK-101' && dockerCompleted ? (
                  <span className="text-[#55C98B] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check</span> Completed
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveQuizModal(true)}
                    className="px-2.5 py-1 bg-[#8052ff] hover:bg-[#8052ff]/90 text-white rounded text-[11px] transition-colors"
                  >
                    Start Lab
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal for #DCK-101 */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D0D0F] border border-[#363639] rounded-xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#202023]">
              <div>
                <span className="text-[11px] font-mono text-[#8052ff] uppercase font-bold">
                  ACCREDITED ASSESSMENT
                </span>
                <h2 className="text-lg font-bold text-white mt-1">#DCK-101: Docker Orchestration Fundamentals</h2>
                <p className="text-xs text-[#8B8B93]">Pass criteria: 3/3 correct (Target verified score: 4.0 / 5.0)</p>
              </div>
              <button
                onClick={() => setActiveQuizModal(false)}
                className="text-[#8B8B93] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-[#16161A] border border-[#202023] rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-white">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectAnswer(q.id, oIdx)}
                          className={`p-2.5 rounded border text-xs font-mono cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#8052ff]/20 border-[#8052ff] text-white'
                              : 'bg-[#000000] border-[#202023] text-[#8B8B93] hover:text-white hover:border-[#363639]'
                          }`}
                        >
                          <span className="mr-2 text-[#8052ff] font-bold">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal actions */}
            <div className="pt-3 border-t border-[#202023] flex items-center justify-between">
              <span className="text-xs font-mono text-[#8B8B93]">
                {Object.keys(quizAnswers).length} / {quizQuestions.length} answered
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveQuizModal(false)}
                  className="px-4 py-2 bg-[#16161A] text-xs font-mono text-[#8B8B93] hover:text-white rounded border border-[#202023]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleFinishQuiz();
                    setActiveQuizModal(false);
                  }}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="px-4 py-2 bg-[#55C98B] hover:bg-[#55C98B]/90 text-black text-xs font-mono font-bold rounded transition-colors disabled:opacity-50"
                >
                  Submit & Record Score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
