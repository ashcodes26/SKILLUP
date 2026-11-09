import React, { useState } from 'react';

interface FacultyImportScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyImportScreen({ onNavigate, onShowToast }: FacultyImportScreenProps) {
  const [duplicateStrategy, setDuplicateStrategy] = useState<'merge' | 'reject' | 'alias'>('merge');
  const [issuesFixed, setIssuesFixed] = useState<number[]>([]);
  const [committed, setCommitted] = useState<boolean>(false);

  // Issues in sieve
  const issues = [
    {
      id: 14,
      rowNumber: 14,
      candidate: 'Jordan Lee (#STU-2026-14)',
      field: 'Cumulative GPA',
      error: 'Invalid separator in "3,85"',
      fixLabel: 'Convert to 3.85',
      resolved: issuesFixed.includes(14),
    },
    {
      id: 42,
      rowNumber: 42,
      candidate: 'Taylor Swift (#STU-2026-42)',
      field: 'Target Role',
      error: 'Unassigned role string',
      fixLabel: 'Default to "Backend Systems"',
      resolved: issuesFixed.includes(42),
    },
    {
      id: 89,
      rowNumber: 89,
      candidate: 'Samir Patel (#STU-2026-89)',
      field: 'Docker Score',
      error: 'Literal text "N/A" instead of null token',
      fixLabel: 'Coerce to IEEE P2863 NULL (Unassessed)',
      resolved: issuesFixed.includes(89),
    },
    {
      id: 103,
      rowNumber: 103,
      candidate: 'Maya Chen (#STU-2026-14)',
      field: 'Student ID Collision',
      error: 'Duplicate student ID detected',
      fixLabel: 'Apply Merge & Update Strategy',
      resolved: issuesFixed.includes(103),
    },
  ];

  const handleFixIssue = (id: number) => {
    setIssuesFixed(prev => [...prev, id]);
    onShowToast?.(`Resolved pre-flight schema issue on Row ${id}!`, 'success');
  };

  const handleCommit = () => {
    setCommitted(true);
    onShowToast?.("Atomic commit executed! 148 verified records successfully ingested into Cohort 2026.", "success");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              DATA STAGING ENGINE
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Cohort 2026 Ingestion Pipeline</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Roster CSV Ingestion & Pre-Flight Sieve</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Validate candidate schema mappings, resolve format errors, and atomically commit candidate batches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate?.('admin/students')}
            className="px-3.5 py-2 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors"
          >
            ← View Student Roster
          </button>
        </div>
      </div>

      {/* File Upload Shelf */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#16161A] border-2 border-dashed border-[#363639] rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#8052ff] text-[32px]">description</span>
            <div>
              <div className="text-sm font-bold text-white">cohort_2026_cse_placement_export_v2.csv</div>
              <div className="text-xs text-[#8B8B93] font-mono">148 rows • 42.6 KB • UTF-8 Encoded • Verified Header Checksum</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#55C98B]/10 text-[#55C98B] border border-[#55C98B]/30 font-bold">
              FILE PARSED (9/9 COLS)
            </span>
          </div>
        </div>
      </div>

      {/* 9 Canonical Schema Mapping Engine */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Canonical Schema Column Mapping</h2>
            <p className="text-xs text-[#8B8B93]">Validates 9 mandatory institutional telemetry fields</p>
          </div>
          <span className="text-xs font-mono text-[#55C98B]">100% Automated Alignment</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-2.5 px-4">CSV Source Header</th>
                <th className="py-2.5 px-4">Target Canonical Field</th>
                <th className="py-2.5 px-4">Type / Format</th>
                <th className="py-2.5 px-4">Sample Value</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {[
                { src: 'student_id', tgt: 'Student ID (Primary Key)', type: 'STRING (#STU-...)', sample: '#STU-2026-88' },
                { src: 'full_name', tgt: 'Full Name', type: 'STRING', sample: 'Aravind R.' },
                { src: 'email_addr', tgt: 'Institutional Email', type: 'EMAIL (FERPA)', sample: 'ra2211003010482@srmist.edu.in' },
                { src: 'gpa_score', tgt: 'Cumulative GPA', type: 'FLOAT [0.0 - 4.0]', sample: '3.82' },
                { src: 'track_role', tgt: 'Target Role', type: 'STRING ENUM', sample: 'Backend Systems Engineer' },
                { src: 'py_score', tgt: 'Python Rubric', type: 'FLOAT [1.0 - 5.0]', sample: '4.2' },
                { src: 'docker_status', tgt: 'Docker Score (NULL allowed)', type: 'FLOAT or NULL', sample: 'NULL' },
                { src: 'readiness_idx', tgt: 'Readiness Score', type: 'INT [0 - 100]', sample: '84%' },
                { src: 'review_state', tgt: 'Review Status', type: 'STRING ENUM', sample: 'Approved' },
              ].map((col, idx) => (
                <tr key={idx} className="hover:bg-[#16161A]/50">
                  <td className="py-2.5 px-4 text-white font-bold">{col.src}</td>
                  <td className="py-2.5 px-4 text-[#8052ff]">{col.tgt}</td>
                  <td className="py-2.5 px-4 text-[#8B8B93]">{col.type}</td>
                  <td className="py-2.5 px-4 text-[#D6D6DC]">{col.sample}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[#55C98B] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Mapped
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Flight Issue Sieve & Duplicate Strategy Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Issue Sieve (4 Issues) */}
        <div className="lg:col-span-7 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
            <div>
              <h3 className="text-sm font-semibold text-white">Pre-Flight Issue Sieve (4 Records)</h3>
              <p className="text-xs text-[#8B8B93]">Anomalies detected in raw CSV rows requiring inline remediation</p>
            </div>
            <span className="text-xs font-mono text-[#ffba35]">
              {issuesFixed.length} / 4 Cleared
            </span>
          </div>

          <div className="space-y-3">
            {issues.map((iss) => (
              <div
                key={iss.id}
                className={`p-3.5 rounded border transition-all ${
                  iss.resolved
                    ? 'bg-[#16161A]/50 border-[#55C98B]/30 opacity-75'
                    : 'bg-[#16161A] border-[#202023]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#202023] text-white">
                        Row {iss.rowNumber}
                      </span>
                      <span className="text-xs font-bold text-white">{iss.candidate}</span>
                    </div>
                    <div className="text-xs text-[#ffba35] mt-1 font-mono">
                      Field [{iss.field}]: {iss.error}
                    </div>
                  </div>

                  <button
                    onClick={() => handleFixIssue(iss.id)}
                    disabled={iss.resolved}
                    className={`px-3 py-1 text-xs font-mono rounded font-bold transition-colors ${
                      iss.resolved
                        ? 'bg-[#55C98B]/20 text-[#55C98B] cursor-default'
                        : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                    }`}
                  >
                    {iss.resolved ? 'Resolved ✓' : iss.fixLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Duplicate Strategy Selector */}
        <div className="lg:col-span-5 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-[#202023]">
            <h3 className="text-sm font-semibold text-white">Duplicate Resolution Policy</h3>
            <p className="text-xs text-[#8B8B93]">How to handle existing student ID collisions</p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'merge',
                label: 'Merge & Update Existing Records',
                desc: 'Overwrites competencies while retaining prior faculty notes and overrides.',
              },
              {
                id: 'reject',
                label: 'Reject Duplicate Rows',
                desc: 'Skip incoming records if candidate ID exists in database.',
              },
              {
                id: 'alias',
                label: 'Create Revision Alias',
                desc: 'Create side-by-side branch version (e.g., #STU-2026-14-rev2).',
              },
            ].map((strat) => (
              <label
                key={strat.id}
                className={`p-3 rounded-lg border block cursor-pointer transition-all ${
                  duplicateStrategy === strat.id
                    ? 'bg-[#16161A] border-[#8052ff]'
                    : 'bg-[#000000] border-[#202023] hover:border-[#363639]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="duplicatePolicy"
                    checked={duplicateStrategy === strat.id}
                    onChange={() => setDuplicateStrategy(strat.id as any)}
                    className="accent-[#8052ff]"
                  />
                  <span className="text-xs font-bold text-white">{strat.label}</span>
                </div>
                <p className="text-[11px] text-[#8B8B93] mt-1 pl-6">
                  {strat.desc}
                </p>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-flight Atomic Commit Bar */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#55C98B] font-bold">
            PRE-FLIGHT VALIDATION PASSED
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            148 Clean Student Records Prepared for Ingestion
          </div>
          <p className="text-xs text-[#8B8B93]">
            FERPA schema checks completed with cryptographic audit logging.
          </p>
        </div>

        <button
          onClick={handleCommit}
          disabled={committed}
          className={`px-5 py-2.5 text-xs font-mono font-bold rounded transition-colors flex items-center gap-2 ${
            committed
              ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
              : 'bg-[#55C98B] hover:bg-[#55C98B]/90 text-black'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {committed ? 'check_circle' : 'cloud_upload'}
          </span>
          {committed ? 'Cohort 2026 Ingested Successfully ✓' : 'Execute Atomic Commit (148 Records)'}
        </button>
      </div>
    </div>
  );
}
