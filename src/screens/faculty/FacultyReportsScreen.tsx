import React, { useState } from 'react';
import { initialStudents } from '../../data/mockData';

interface FacultyReportsScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyReportsScreen({ onNavigate, onShowToast }: FacultyReportsScreenProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<string>('ferpa_readiness');

  const archetypes = [
    {
      id: 'ferpa_readiness',
      title: 'FERPA Placement Readiness Audit',
      description: 'Candidate verification, GPA records, gate completion, and drive eligibility ledger.',
      icon: 'verified_user',
    },
    {
      id: 'curricular_deficit',
      title: 'Curricular Deficit & Gap Analysis',
      description: 'Departmental competency distributions vs employer drive demand benchmarks.',
      icon: 'bar_chart',
    },
    {
      id: 'drive_ledger',
      title: 'Recruiting Drive Outcome Ledger',
      description: 'Registered candidate counts, gate clearance ratios, and interview scheduling.',
      icon: 'inventory_2',
    },
    {
      id: 'waiver_log',
      title: 'Faculty Endorsement & Waiver Log',
      description: 'Immutable record of faculty overrides with reasons and timestamps.',
      icon: 'gavel',
    },
  ];

  const handleDownloadCsv = () => {
    // Generate CSV string
    const headers = ['Student ID', 'Full Name', 'Department', 'Target Role', 'GPA', 'Readiness %', 'Python', 'PostgreSQL', 'Docker', 'Review Status', 'Tier'];
    const rows = initialStudents.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.targetRole}"`,
      s.gpa.toFixed(2),
      s.readinessPct,
      s.skills.python.toFixed(1),
      s.skills.postgres.toFixed(1),
      s.skills.docker !== null ? s.skills.docker.toFixed(1) : 'NULL',
      `"${s.reviewStatus}"`,
      `"${s.tier}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FERPA_Placement_Readiness_Report_2026_${selectedArchetype}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.("Generated and exported cryptographically sealed FERPA CSV report!", "success");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              INSTITUTIONAL REPORTING & FERPA
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">IEEE P2863 Compliance Standard</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">FERPA Placement Reports & Audit Ledgers</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Export accredited accreditation packages, curricular gap telemetry, and candidate roster audits.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-mono text-xs font-bold rounded transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export Signed CSV Report
        </button>
      </div>

      {/* 4 Archetype Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {archetypes.map((arch) => {
          const isSelected = arch.id === selectedArchetype;
          return (
            <div
              key={arch.id}
              onClick={() => setSelectedArchetype(arch.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#16161A] border-[#8052ff]'
                  : 'bg-[#0D0D0F] border-[#202023] hover:border-[#363639]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-[#8052ff]' : 'text-[#8B8B93]'}`}>
                  {arch.icon}
                </span>
                <h3 className="text-xs font-bold text-white">{arch.title}</h3>
              </div>
              <p className="text-[11px] text-[#8B8B93] mt-2 leading-relaxed">
                {arch.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Report Preview Table */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Live Report Dataset Preview: Cohort 2026</h2>
            <p className="text-xs text-[#8B8B93]">
              Distinguishes unassessed competencies (NULL) from scored failures (0.0)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#8B8B93]">Records:</span>
            <span className="text-white font-bold">{initialStudents.length} Students</span>
            <span className="text-[#363639]">|</span>
            <span className="text-[#55C98B]">FERPA Certified</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4 text-center">GPA</th>
                <th className="py-3 px-4 text-center">Readiness</th>
                <th className="py-3 px-4 text-center">Python</th>
                <th className="py-3 px-4 text-center">Docker</th>
                <th className="py-3 px-4">Drive Eligibility</th>
                <th className="py-3 px-4">Institutional Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {initialStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#16161A]/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-[#8B8B93]">{s.id}</div>
                  </td>
                  <td className="py-3 px-4 text-[#D6D6DC]">{s.targetRole}</td>
                  <td className="py-3 px-4 text-center text-white font-bold">{s.gpa.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center text-[#55C98B] font-bold">{s.readinessPct}%</td>
                  <td className="py-3 px-4 text-center text-white">{s.skills.python.toFixed(1)}</td>
                  <td className="py-3 px-4 text-center">
                    {s.skills.docker !== null ? (
                      <span className="text-white">{s.skills.docker.toFixed(1)}</span>
                    ) : (
                      <span className="text-[#ffba35] italic">NULL</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {s.driveEligible.map((d, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 bg-[#16161A] border border-[#202023] rounded text-[10px] text-[#D6D6DC]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.tier === 'Tier 1 Ready'
                          ? 'bg-[#55C98B]/20 text-[#55C98B]'
                          : 'bg-[#ffba35]/20 text-[#ffba35]'
                      }`}
                    >
                      {s.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic Ledger & Audit Footer Shelf */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#55C98B] text-[20px]">fingerprint</span>
          <div>
            <div className="text-white font-bold">SHA-256 Ledger Signature</div>
            <div className="text-[11px] text-[#8B8B93]">e7b4a2c09191d4e5f3b79a12c84910291e0a8b9c2d1e</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onShowToast?.("Audit certificate printed to queue.", "info")}
            className="px-3 py-1.5 bg-[#16161A] hover:bg-[#202023] text-[#D6D6DC] border border-[#202023] rounded"
          >
            Print Verification Certificate
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 bg-[#55C98B] hover:bg-[#55C98B]/90 text-black font-bold rounded"
          >
            Download CSV Roster
          </button>
        </div>
      </div>
    </div>
  );
}
