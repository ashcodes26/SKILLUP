import React, { useState } from 'react';
import { initialSharedReviews, initialRemediations } from '../../data/mockData';

interface FacultyReviewsTrainingScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyReviewsTrainingScreen({ onNavigate, onShowToast }: FacultyReviewsTrainingScreenProps) {
  const [reviews, setReviews] = useState(initialSharedReviews);
  const [activeTab, setActiveTab] = useState<'reviews' | 'remediation'>('reviews');
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const handleEndorse = (reviewId: string, studentName: string) => {
    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, status: 'endorsed' } : r)
    );
    onShowToast?.(`Endorsed ${studentName}'s resume version with institutional placement seal!`, 'success');
  };

  const handleRequestChanges = (reviewId: string, studentName: string) => {
    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, status: 'changes_requested' } : r)
    );
    onShowToast?.(`Feedback dispatched to ${studentName} for revision.`, 'info');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              FACULTY OVERSIGHT & ACCREDITATION
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Prof. Sarah Jenkins (#FAC-2026-04)</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Reviews & Institutional Training Hub</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Audit candidate resume revisions, review bullet enhancements, and administer remediation modules.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-[#16161A] p-1.5 rounded-lg border border-[#202023]">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'reviews'
                ? 'bg-[#8052ff] text-white font-bold'
                : 'text-[#8B8B93] hover:text-white'
            }`}
          >
            Review Queue ({reviews.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('remediation')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'remediation'
                ? 'bg-[#8052ff] text-white font-bold'
                : 'text-[#8B8B93] hover:text-white'
            }`}
          >
            Remediation Labs ({initialRemediations.length})
          </button>
        </div>
      </div>

      {activeTab === 'reviews' ? (
        /* Review Queue Stream */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Pending Candidate Resume Submissions
            </h2>
            <span className="text-xs font-mono text-[#8B8B93]">IEEE P2863 Evidence Compliance Check</span>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4 hover:border-[#363639] transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{rev.studentName}</h3>
                      <span className="text-xs font-mono text-[#8B8B93]">({rev.studentId})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8052ff]/20 text-[#8052ff] border border-[#8052ff]/40">
                        {rev.version}
                      </span>
                    </div>
                    <div className="text-xs text-[#8B8B93] mt-1">
                      Target Role: <strong className="text-white">{rev.targetRole}</strong> • Recruiting Drive: <strong className="text-[#8052ff]">{rev.driveName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#8B8B93]">Submitted: {rev.submittedAt}</span>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        rev.status === 'endorsed'
                          ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40'
                          : rev.status === 'changes_requested'
                          ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40'
                          : 'bg-[#ffba35]/20 text-[#ffba35] border border-[#ffba35]/40'
                      }`}
                    >
                      {rev.status === 'endorsed'
                        ? 'Endorsed ✓'
                        : rev.status === 'changes_requested'
                        ? 'Revision Sent'
                        : 'Awaiting Action'}
                    </span>
                  </div>
                </div>

                {/* Diff Comparison Block */}
                <div className="p-4 bg-[#16161A] border border-[#202023] rounded-lg space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#F87171]">Current Student Bullet:</span>
                    <div className="p-2.5 bg-[#000000] border border-[#202023] rounded text-[#F87171] line-through mt-1">
                      {rev.originalBullet}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#55C98B]">Proposed Quantified Bullet (With Dark Void Highlight):</span>
                    <div className="p-2.5 bg-[#000000] border border-[#202023] rounded text-[#55C98B] mt-1">
                      {rev.proposedBullet}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8B8B93]">
                    <span>Verified Competency Cross-References:</span>
                    {rev.verifiedItems.map((item, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-[#202023] text-white rounded text-[10px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Faculty Commentary & Action Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Enter faculty endorsement notes or feedback..."
                    value={feedbackMap[rev.id] || ''}
                    onChange={(e) => setFeedbackMap({ ...feedbackMap, [rev.id]: e.target.value })}
                    className="w-full sm:flex-1 px-3 py-1.5 bg-[#16161A] border border-[#202023] rounded text-xs text-white placeholder-[#8B8B93] focus:outline-none focus:border-[#8052ff]"
                  />

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleRequestChanges(rev.id, rev.studentName)}
                      className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleEndorse(rev.id, rev.studentName)}
                      disabled={rev.status === 'endorsed'}
                      className={`px-4 py-1.5 text-xs font-mono font-bold rounded transition-colors flex items-center gap-1.5 ${
                        rev.status === 'endorsed'
                          ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
                          : 'bg-[#55C98B] hover:bg-[#55C98B]/90 text-black'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      {rev.status === 'endorsed' ? 'Endorsed ✓' : 'Endorse Package'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Institutional Training & Remediation Catalog */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialRemediations.map((mod) => (
              <div
                key={mod.id}
                className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#8052ff]/20 text-[#8052ff] font-bold">
                      {mod.code}
                    </span>
                    <span className="text-[#8B8B93]">{mod.type}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2">{mod.title}</h3>
                  <p className="text-xs text-[#8B8B93] mt-1.5 leading-relaxed">{mod.description}</p>

                  <div className="mt-4 p-3 bg-[#16161A] rounded border border-[#202023] grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[#8B8B93] block">Assigned:</span>
                      <strong className="text-white text-sm">{mod.assignedCount}</strong>
                    </div>
                    <div>
                      <span className="text-[#8B8B93] block">Passed:</span>
                      <strong className="text-[#55C98B] text-sm">{mod.completedCount}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#202023] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#55C98B]">Avg Pass: {mod.avgPassPct}%</span>
                  <button
                    onClick={() => onShowToast?.(`Dispatched reminder for ${mod.code} to overdue students!`, 'info')}
                    className="px-2.5 py-1 bg-[#16161A] hover:bg-[#202023] text-[#8052ff] border border-[#202023] rounded text-[11px]"
                  >
                    Dispatch Reminders
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Live Assessment Stream */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Live Lab Assessment Feed
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-[#16161A] border border-[#202023] rounded flex items-center justify-between">
                <span className="text-[#D6D6DC]">
                  <strong className="text-white">Elena Rostova (#STU-2026-61)</strong> scored 92% on #DCK-101 (Docker Orchestration).
                </span>
                <span className="text-[#55C98B] font-bold">PASSED (4.0 Level)</span>
              </div>
              <div className="p-2.5 bg-[#16161A] border border-[#202023] rounded flex items-center justify-between">
                <span className="text-[#D6D6DC]">
                  <strong className="text-white">Marcus Vance (#STU-2026-92)</strong> scored 88% on #SQL-301 (PostgreSQL Indices).
                </span>
                <span className="text-[#55C98B] font-bold">PASSED (3.8 Level)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
