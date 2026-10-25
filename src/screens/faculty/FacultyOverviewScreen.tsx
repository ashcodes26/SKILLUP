import React, { useState } from 'react';
import { initialStudents, initialDrives, initialSharedReviews } from '../../data/mockData';

interface FacultyOverviewScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyOverviewScreen({ onNavigate, onShowToast }: FacultyOverviewScreenProps) {
  const [reviews, setReviews] = useState(initialSharedReviews);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('CSE');
  const [selectedBatch, setSelectedBatch] = useState<string>('2026');
  const [selectedSection, setSelectedSection] = useState<string>('All Sections');
  const [activeFlagFilter, setActiveFlagFilter] = useState<
    'all' | 'Incomplete Profile' | 'Missing Assessment' | 'Overdue Training' | 'Pending Resume Review'
  >('all');

  const handleEndorse = (reviewId: string, studentName: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'endorsed' } : r))
    );
    onShowToast?.(`Endorsed ${studentName}'s placement package with institutional signature!`, 'success');
  };

  // Follow-up Flagged Students
  const flaggedStudents = [
    {
      id: '#STU-2026-88',
      name: 'Alex R. Mercer',
      section: 'Section A',
      flag: 'Missing Assessment' as const,
      detail: 'Docker #DCK-101 proficiency is null (unverified)',
      readiness: 76,
    },
    {
      id: '#STU-2026-31',
      name: 'Marcus Vance',
      section: 'Section B',
      flag: 'Overdue Training' as const,
      detail: 'Proctored Quiz #DCK-101 overdue by 48h; resume not submitted',
      readiness: 54,
    },
    {
      id: '#STU-2026-112',
      name: 'Maya Chen',
      section: 'Section A',
      flag: 'Pending Resume Review' as const,
      detail: 'Resume v1.4 awaiting faculty endorsement for CloudScale drive',
      readiness: 81,
    },
    {
      id: '#STU-2026-45',
      name: 'David K. Patel',
      section: 'Section C',
      flag: 'Incomplete Profile' as const,
      detail: 'Missing verified Docker & Capstone evidence links',
      readiness: 62,
    },
  ];

  const visibleFlags = flaggedStudents.filter((f) => {
    if (selectedSection !== 'All Sections' && f.section !== selectedSection) return false;
    if (activeFlagFilter !== 'all' && f.flag !== activeFlagFilter) return false;
    return true;
  });

  // Cohort Skill-Gap Heatmap Matrix (Sections A, B, C across Core Skills)
  const heatmapRows = [
    {
      section: 'CSE · Batch 2026 · Section A (N=52)',
      avgReadiness: 79,
      completionPct: 92,
      cells: [
        { skill: 'Python', avg: 4.3, nullPct: 0 },
        { skill: 'PostgreSQL', avg: 3.8, nullPct: 4 },
        { skill: 'Docker', avg: 2.6, nullPct: 34 },
        { skill: 'Redis', avg: 3.1, nullPct: 18 },
        { skill: 'Kafka', avg: 2.7, nullPct: 29 },
        { skill: 'Git/CI', avg: 4.1, nullPct: 2 },
      ],
    },
    {
      section: 'CSE · Batch 2026 · Section B (N=50)',
      avgReadiness: 72,
      completionPct: 86,
      cells: [
        { skill: 'Python', avg: 4.0, nullPct: 2 },
        { skill: 'PostgreSQL', avg: 3.6, nullPct: 6 },
        { skill: 'Docker', avg: 2.1, nullPct: 42 },
        { skill: 'Redis', avg: 2.9, nullPct: 24 },
        { skill: 'Kafka', avg: 2.4, nullPct: 38 },
        { skill: 'Git/CI', avg: 3.8, nullPct: 4 },
      ],
    },
    {
      section: 'CSE · Batch 2026 · Section C (N=46)',
      avgReadiness: 68,
      completionPct: 81,
      cells: [
        { skill: 'Python', avg: 3.9, nullPct: 4 },
        { skill: 'PostgreSQL', avg: 3.5, nullPct: 9 },
        { skill: 'Docker', avg: 2.2, nullPct: 39 },
        { skill: 'Redis', avg: 2.8, nullPct: 28 },
        { skill: 'Kafka', avg: 2.5, nullPct: 35 },
        { skill: 'Git/CI', avg: 3.7, nullPct: 6 },
      ],
    },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Cohort Filter Bar by Department / Batch / Section */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#9A9A9A]">
            <span className="text-[#8052ff] font-semibold">PLACEMENT &amp; FACULTY ADMINISTRATION HUB</span>
            <span>·</span>
            <span>Cohort Analytics &amp; Follow-Up Triage</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Institutional Placement Console ({selectedDepartment} · Batch {selectedBatch})
          </h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Track cohorts by Department, Batch, and Section. Inspect skill-gap heatmaps and follow up on flagged candidates.
          </p>
        </div>

        {/* Cohort Filter Controls: Department / Batch / Section */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-[#16161A] border border-[#363639] rounded px-3 py-1.5 text-xs font-mono text-white"
          >
            <option value="CSE">Dept: CSE</option>
            <option value="ECE">Dept: ECE</option>
            <option value="DSAI">Dept: Data Science &amp; AI</option>
          </select>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-[#16161A] border border-[#363639] rounded px-3 py-1.5 text-xs font-mono text-white"
          >
            <option value="2026">Batch 2026</option>
            <option value="2027">Batch 2027</option>
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-[#16161A] border border-[#363639] rounded px-3 py-1.5 text-xs font-mono text-white"
          >
            <option value="All Sections">All Sections (A, B, C)</option>
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
          </select>

          <button
            onClick={() => onNavigate?.('admin-import')}
            className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#cdbdff] border border-[#363639] rounded transition-colors cursor-pointer"
          >
            Import CSV
          </button>
          <button
            onClick={() => onNavigate?.('admin-reports')}
            className="px-3 py-1.5 bg-[#8052ff] hover:bg-[#8052ff]/90 text-xs font-mono text-white rounded transition-colors cursor-pointer"
          >
            FERPA Report
          </button>
        </div>
      </div>

      {/* KPI Tiles (4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>AGGREGATE COMPLETION</span>
            <span className="material-symbols-outlined text-[18px]">groups</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">89.2%</div>
          <div className="text-[11px] text-[#55C98B] mt-1">132 / 148 Profiles Complete</div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>AVERAGE READINESS</span>
            <span className="material-symbols-outlined text-[18px] text-[#55C98B]">verified</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#55C98B] mt-2">73.4%</div>
          <div className="text-[11px] text-[#8B8B93] mt-1">Informational coverage mean</div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>NEEDS FOLLOW-UP</span>
            <span className="material-symbols-outlined text-[18px] text-[#ffba35]">flag</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#ffba35] mt-2">
            {flaggedStudents.length}
          </div>
          <div className="text-[11px] text-[#8B8B93] mt-1">Missing quiz, overdue, or incomplete</div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B8B93]">
            <span>PENDING RESUME REVIEW</span>
            <span className="material-symbols-outlined text-[18px] text-[#8052ff]">pending_actions</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#8052ff] mt-2">
            {reviews.filter((r) => r.status === 'pending').length}
          </div>
          <div className="text-[11px] text-[#8B8B93] mt-1">Shared queue awaiting endorsement</div>
        </div>
      </div>

      {/* Cohort Skill-Gap Heatmap by Section */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Cohort Skill-Gap Heatmap (By Department / Batch / Section)</h2>
            <p className="text-xs text-[#8B8B93]">
              Displays mean verified score (0–5) and percentage of unverified (<code className="font-mono text-[#ffba35]">null</code>) records per section
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('admin-skill-analytics')}
            className="text-xs font-mono text-[#cdbdff] hover:underline cursor-pointer"
          >
            Full Skill Analytics →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-3 px-4">Cohort Section</th>
                <th className="py-3 px-4 text-right">Avg Readiness</th>
                <th className="py-3 px-4 text-center">Python</th>
                <th className="py-3 px-4 text-center">PostgreSQL</th>
                <th className="py-3 px-4 text-center">Docker</th>
                <th className="py-3 px-4 text-center">Redis</th>
                <th className="py-3 px-4 text-center">Kafka</th>
                <th className="py-3 px-4 text-center">Git / CI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {heatmapRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#16161A]/50">
                  <td className="py-3 px-4 font-bold text-white">{row.section}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#55C98B] font-bold">
                    {row.avgReadiness}% ({row.completionPct}% done)
                  </td>
                  {row.cells.map((cell, cIdx) => {
                    const isCritical = cell.avg < 2.8 || cell.nullPct >= 30;
                    const isModerate = !isCritical && (cell.avg < 3.5 || cell.nullPct >= 15);
                    return (
                      <td key={cIdx} className="py-2.5 px-3 text-center">
                        <div
                          className={`p-1.5 rounded border tabular-nums ${
                            isCritical
                              ? 'bg-[#93000a]/30 border-[#EB5757]/40 text-[#ffb4ab]'
                              : isModerate
                              ? 'bg-[#ffba35]/15 border-[#ffba35]/30 text-[#ffba35]'
                              : 'bg-[#15846e]/25 border-[#55C98B]/30 text-[#55C98B]'
                          }`}
                        >
                          <div className="font-bold">{cell.avg.toFixed(1)}</div>
                          <div className="text-[10px] opacity-80">{cell.nullPct}% null</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Two-Column Layout: Follow-up Flag Triage & Shared Resume Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 Cols): Flagged Students Needing Follow-Up */}
        <div className="lg:col-span-6 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202023]">
            <div>
              <h2 className="text-sm font-semibold text-white">Students Flagged for Follow-Up</h2>
              <p className="text-xs text-[#8B8B93]">Filter by institutional intervention reason</p>
            </div>
            <button
              onClick={() => onNavigate?.('admin-students')}
              className="text-xs font-mono text-[#cdbdff] hover:underline cursor-pointer"
            >
              Open Roster →
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
            {(
              [
                'all',
                'Incomplete Profile',
                'Missing Assessment',
                'Overdue Training',
                'Pending Resume Review',
              ] as const
            ).map((flag) => (
              <button
                key={flag}
                onClick={() => setActiveFlagFilter(flag)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeFlagFilter === flag
                    ? 'bg-[#8052ff] text-white font-semibold'
                    : 'bg-[#16161A] text-[#9A9A9A] hover:text-white border border-[#202023]'
                }`}
              >
                {flag === 'all' ? 'All Flags' : flag}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {visibleFlags.map((stu) => (
              <div
                key={stu.id}
                className="p-3.5 bg-[#16161A] border border-[#202023] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{stu.name}</span>
                    <span className="text-[11px] font-mono text-[#9A9A9A]">{stu.id}</span>
                    <span className="text-[11px] font-mono text-[#ffba35]">· {stu.flag}</span>
                  </div>
                  <p className="text-xs text-[#9A9A9A] mt-1">{stu.detail}</p>
                </div>
                <button
                  onClick={() => {
                    onShowToast?.(`Sent targeted follow-up reminder to ${stu.name} (${stu.flag}).`, 'info');
                  }}
                  className="px-3 py-1.5 rounded bg-[#202023] hover:bg-[#363639] text-white text-xs font-mono shrink-0 cursor-pointer"
                >
                  Nudge Candidate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 Cols): Shared Resume Review Queue */}
        <div className="lg:col-span-6 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
            <div>
              <h2 className="text-sm font-semibold text-white">Shared Resume Review Queue</h2>
              <p className="text-xs text-[#8B8B93]">
                Contextual review workflow (Submitted → Changes Requested / Approved)
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('admin-reviews-training')}
              className="text-xs font-mono text-[#cdbdff] hover:underline cursor-pointer"
            >
              Full Queue →
            </button>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 bg-[#16161A] border border-[#202023] rounded-lg space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rev.studentName}</span>
                      <span className="text-[10px] font-mono text-[#8B8B93]">({rev.studentId})</span>
                      <span className="text-[10px] font-mono text-[#cdbdff]">{rev.version}</span>
                    </div>
                    <div className="text-xs text-[#8B8B93] mt-0.5">
                      Drive: <span className="text-[#D6D6DC]">{rev.driveName}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-bold ${
                      rev.status === 'endorsed' ? 'text-[#55C98B]' : 'text-[#ffba35]'
                    }`}
                  >
                    {rev.status === 'endorsed' ? 'Approved ✓' : 'Submitted'}
                  </span>
                </div>

                <div className="p-2 bg-black border border-[#202023] rounded text-[11px] font-mono space-y-1">
                  <div className="text-[#F87171] line-through truncate">{rev.originalBullet}</div>
                  <div className="text-[#55C98B] truncate">{rev.proposedBullet}</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8B8B93]">Submitted: {rev.submittedAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate?.('admin-reviews-training')}
                      className="px-2.5 py-1 bg-[#202023] hover:bg-[#363639] text-xs font-mono text-[#D6D6DC] rounded cursor-pointer"
                    >
                      Comment
                    </button>
                    {rev.status === 'pending' && (
                      <button
                        onClick={() => handleEndorse(rev.id, rev.studentName)}
                        className="px-2.5 py-1 bg-[#55C98B] hover:bg-[#55C98B]/90 text-black text-xs font-mono font-bold rounded cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
