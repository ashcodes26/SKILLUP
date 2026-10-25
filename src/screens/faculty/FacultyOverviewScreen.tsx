import React, { useState } from 'react';
import { initialStudents, initialDrives, initialSharedReviews } from '../../data/mockData';

interface FacultyOverviewScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyOverviewScreen({ onNavigate, onShowToast }: FacultyOverviewScreenProps) {
  const [reviews, setReviews] = useState(initialSharedReviews);

  const handleEndorse = (reviewId: string, studentName: string) => {
    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, status: 'endorsed' } : r)
    );
    onShowToast?.(`Endorsed ${studentName}'s placement package with institutional signature!`, 'success');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Cohort Status Shelf */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              COHORT 2026 OVERVIEW
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">CSE • Placement Cycle Autumn 2026</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Placement Operations & Telemetry Console</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Institutional oversight, ATS rubric verification, gate enforcement, and candidate endorsements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate?.('admin/import')}
            className="px-3.5 py-2 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Import Roster CSV
          </button>
          <button
            onClick={() => onNavigate?.('admin/reports')}
            className="px-3.5 py-2 bg-[#8052ff] hover:bg-[#8052ff]/90 text-xs font-mono text-white rounded transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            Generate FERPA Report
          </button>
        </div>
      </div>

      {/* KPI Tiles (4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>COHORT ENROLLED</span>
            <span className="material-symbols-outlined text-[18px]">groups</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">148</div>
          <div className="text-[11px] text-[#55C98B] mt-1 flex items-center gap-1">
            <span>+12 new this term</span>
            <span>•</span>
            <span className="text-[#8B8B93]">89.2% Active</span>
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>TIER 1 READY</span>
            <span className="material-symbols-outlined text-[18px] text-[#55C98B]">verified</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#55C98B] mt-2">62</div>
          <div className="text-[11px] text-[#8B8B93] mt-1">
            41.9% meet all benchmark thresholds
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>IN REMEDIATION</span>
            <span className="material-symbols-outlined text-[18px] text-[#ffba35]">rule</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#ffba35] mt-2">48</div>
          <div className="text-[11px] text-[#8B8B93] mt-1">
            32.4% resolving gate deficits (#DCK-101)
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>PENDING FACULTY REVIEW</span>
            <span className="material-symbols-outlined text-[18px] text-[#8052ff]">pending_actions</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#8052ff] mt-2">
            {reviews.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-[11px] text-[#8B8B93] mt-1">
            Action required before drive cutoff
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Follow-up Review Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <div>
                <h2 className="text-sm font-semibold text-white">Priority Faculty Review Queue</h2>
                <p className="text-xs text-[#8B8B93]">Student resume diff submissions awaiting institutional endorsement</p>
              </div>
              <button
                onClick={() => onNavigate?.('admin/reviews-training')}
                className="text-xs font-mono text-[#8052ff] hover:underline"
              >
                View Full Queue →
              </button>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-[#16161A] border border-[#202023] rounded-lg hover:border-[#363639] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rev.studentName}</span>
                        <span className="text-[10px] font-mono text-[#8B8B93]">({rev.studentId})</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#8052ff]/20 text-[#8052ff]">
                          {rev.version}
                        </span>
                      </div>
                      <div className="text-xs text-[#8B8B93] mt-0.5">
                        Target: <span className="text-[#D6D6DC]">{rev.targetRole}</span> • Drive: <span className="text-[#D6D6DC]">{rev.driveName}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        rev.status === 'endorsed'
                          ? 'bg-[#55C98B]/20 text-[#55C98B]'
                          : 'bg-[#ffba35]/20 text-[#ffba35]'
                      }`}
                    >
                      {rev.status === 'endorsed' ? 'Endorsed ✓' : 'Pending Review'}
                    </span>
                  </div>

                  {/* Bullet Diff Snippet */}
                  <div className="p-2.5 bg-[#000000] border border-[#202023] rounded text-[11px] font-mono space-y-1">
                    <div className="text-[#F87171] line-through truncate">{rev.originalBullet}</div>
                    <div className="text-[#55C98B] truncate">{rev.proposedBullet}</div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#8B8B93]">Submitted: {rev.submittedAt}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate?.('admin/reviews-training')}
                        className="px-2.5 py-1 bg-[#202023] hover:bg-[#363639] text-xs font-mono text-[#D6D6DC] rounded"
                      >
                        Inspect Diff
                      </button>
                      {rev.status === 'pending' && (
                        <button
                          onClick={() => handleEndorse(rev.id, rev.studentName)}
                          className="px-2.5 py-1 bg-[#55C98B] hover:bg-[#55C98B]/90 text-black text-xs font-mono font-bold rounded"
                        >
                          Endorse Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Active Drives & Cohort Skill Deficits */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Drives Widget */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <h2 className="text-sm font-semibold text-white">Active Placement Drives</h2>
              <button
                onClick={() => onNavigate?.('admin/placement-drives')}
                className="text-xs font-mono text-[#8052ff] hover:underline"
              >
                Configure Rules →
              </button>
            </div>

            <div className="space-y-3">
              {initialDrives.map((d) => (
                <div key={d.id} className="p-3 bg-[#16161A] border border-[#202023] rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{d.company}</div>
                      <div className="text-[11px] text-[#8B8B93]">{d.role}</div>
                    </div>
                    <span className="text-[11px] font-mono text-[#55C98B] font-bold">{d.compensation}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8B8B93] pt-1 border-t border-[#202023]">
                    <span>Eligible: <strong className="text-white">{d.eligibleCount}</strong>/{d.registeredCount}</span>
                    <span>Gate: {d.benchmarkReadiness}%</span>
                    <span className="text-[#ffba35]">Cutoff: {d.cutoffDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Deficit Telemetry Widget */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <div>
                <h2 className="text-sm font-semibold text-white">Cohort Skill Deficits</h2>
                <p className="text-[11px] text-[#8B8B93]">Critical bottlenecks for upcoming drive cutoffs</p>
              </div>
              <button
                onClick={() => onNavigate?.('admin/skill-analytics')}
                className="text-xs font-mono text-[#8052ff] hover:underline"
              >
                Analytics →
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-medium">Docker / Containerization</span>
                  <span className="text-[#ffba35] font-bold">38% Deficit (56 students)</span>
                </div>
                <div className="w-full h-1.5 bg-[#16161A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffba35] rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-medium">Kafka / Stream Ingestion</span>
                  <span className="text-[#ffba35] font-bold">46% Deficit (68 students)</span>
                </div>
                <div className="w-full h-1.5 bg-[#16161A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffba35] rounded-full" style={{ width: '46%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-medium">PostgreSQL Indices</span>
                  <span className="text-[#55C98B] font-bold">22% Deficit (32 students)</span>
                </div>
                <div className="w-full h-1.5 bg-[#16161A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#55C98B] rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.('admin/reviews-training')}
              className="w-full py-2 bg-[#16161A] hover:bg-[#202023] border border-[#202023] rounded text-xs font-mono text-[#8052ff] transition-colors"
            >
              Dispatch Batch Remediation (#DCK-101) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
