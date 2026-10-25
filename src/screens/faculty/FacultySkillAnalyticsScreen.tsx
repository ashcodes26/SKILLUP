import React, { useState } from 'react';
import { initialStudents } from '../../data/mockData';

interface FacultySkillAnalyticsScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultySkillAnalyticsScreen({ onNavigate, onShowToast }: FacultySkillAnalyticsScreenProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>('docker');
  const [benchmarkThreshold, setBenchmarkThreshold] = useState<number>(3.5);
  const [batchDispatched, setBatchDispatched] = useState(false);

  const skillRows = [
    {
      id: 'python',
      name: 'Python Systems Core',
      avgScore: 4.1,
      passPct: 94,
      unassessedCount: 0,
      deficitCount: 8,
      status: 'healthy',
      sample: 148,
    },
    {
      id: 'postgres',
      name: 'PostgreSQL Relational DB & Indices',
      avgScore: 3.7,
      passPct: 86,
      unassessedCount: 6,
      deficitCount: 20,
      status: 'healthy',
      sample: 148,
    },
    {
      id: 'git',
      name: 'Git Branching & CI Pipelines',
      avgScore: 3.9,
      passPct: 92,
      unassessedCount: 2,
      deficitCount: 12,
      status: 'healthy',
      sample: 148,
    },
    {
      id: 'docker',
      name: 'Docker Containerization & Multi-stage',
      avgScore: 2.3,
      passPct: 54,
      unassessedCount: 56, // Critical NULL distinction
      deficitCount: 68,
      status: 'critical_blocker',
      sample: 148,
    },
    {
      id: 'redis',
      name: 'Redis In-Memory & Caching Queues',
      avgScore: 3.1,
      passPct: 71,
      unassessedCount: 32,
      deficitCount: 42,
      status: 'warning',
      sample: 148,
    },
    {
      id: 'kafka',
      name: 'Kafka Event Streaming Architecture',
      avgScore: 2.6,
      passPct: 58,
      unassessedCount: 48,
      deficitCount: 62,
      status: 'warning',
      sample: 148,
    },
  ];

  // Candidates with unassessed Docker
  const dockerAffectedStudents = initialStudents.filter(s => s.skills.docker === null || s.skills.docker < 3.0);

  const handleDispatchBatch = () => {
    setBatchDispatched(true);
    onShowToast?.("Dispatched automated remediation notice (#DCK-101) to 56 candidate portals!", "success");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              COHORT TELEMETRY
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Curricular Deficit Sieve</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Skill Deficit & Competency Analytics</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Identify institutional curriculum gaps, unassessed candidate cohorts, and drive gate blockers.
          </p>
        </div>

        {/* Benchmark Threshold Selector */}
        <div className="flex items-center gap-3 bg-[#16161A] p-2.5 rounded-lg border border-[#202023]">
          <span className="text-xs font-mono text-[#8B8B93]">Pass Threshold:</span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[3.0, 3.5, 4.0].map((val) => (
              <button
                key={val}
                onClick={() => setBenchmarkThreshold(val)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  benchmarkThreshold === val
                    ? 'bg-[#8052ff] text-white font-bold'
                    : 'text-[#8B8B93] hover:text-white'
                }`}
              >
                ≥ {val.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table: Cohort Competency Telemetry */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Curricular Competency Telemetry</h2>
            <p className="text-xs text-[#8B8B93]">Cohort N=148 Students (Class of 2026)</p>
          </div>
          <span className="text-xs font-mono text-[#8B8B93]">Click row to inspect affected candidate sieve</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-3 px-4">Competency Domain</th>
                <th className="py-3 px-4 text-center">Cohort Avg</th>
                <th className="py-3 px-4 text-center">Threshold Pass Rate</th>
                <th className="py-3 px-4 text-center">Unassessed (NULL)</th>
                <th className="py-3 px-4 text-center">Deficit Count</th>
                <th className="py-3 px-4">Institutional Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {skillRows.map((row) => {
                const isSelected = row.id === selectedSkill;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedSkill(row.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#16161A]' : 'hover:bg-[#16161A]/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        row.status === 'critical_blocker'
                          ? 'bg-[#ffba35] animate-pulse'
                          : row.status === 'warning'
                          ? 'bg-[#ffba35]'
                          : 'bg-[#55C98B]'
                      }`} />
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {row.avgScore.toFixed(1)} / 5.0
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${row.passPct >= 80 ? 'text-[#55C98B]' : 'text-[#ffba35]'}`}>
                          {row.passPct}%
                        </span>
                        <div className="w-16 h-1.5 bg-[#000000] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.passPct >= 80 ? 'bg-[#55C98B]' : 'bg-[#ffba35]'}`}
                            style={{ width: `${row.passPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.unassessedCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-[#ffba35]/10 text-[#ffba35] border border-[#ffba35]/30 font-bold">
                          {row.unassessedCount} NULL
                        </span>
                      ) : (
                        <span className="text-[#55C98B]">0 (Full Coverage)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8B8B93]">
                      {row.deficitCount} students
                    </td>
                    <td className="py-3.5 px-4">
                      {row.status === 'critical_blocker' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#ffba35]/20 text-[#ffba35] border border-[#ffba35]/40 font-bold flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          Primary Gate Blocker
                        </span>
                      ) : row.status === 'warning' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#8052ff]/20 text-[#8052ff] border border-[#8052ff]/40 font-bold w-fit block">
                          Remediation Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 font-bold w-fit block">
                          Curricular Target Met
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Sieve for Selected Skill (Docker by default) */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202023]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#ffba35]/20 text-[#ffba35] font-bold">
                DRILL-DOWN SIEVE
              </span>
              <h3 className="text-base font-bold text-white">
                {selectedSkill === 'docker' ? 'Docker Orchestration: 56 Blocked Candidates' : `Detailed Analysis: ${selectedSkill.toUpperCase()}`}
              </h3>
            </div>
            <p className="text-xs text-[#8B8B93] mt-1">
              Candidates below threshold or with unassessed NULL records risking CloudScale Systems drive cutoff.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDispatchBatch}
              disabled={batchDispatched}
              className={`px-4 py-2 text-xs font-mono font-bold rounded transition-colors flex items-center gap-1.5 ${
                batchDispatched
                  ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
                  : 'bg-[#ffba35] hover:bg-[#ffba35]/90 text-black'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {batchDispatched ? 'done_all' : 'send'}
              </span>
              {batchDispatched
                ? 'Batch Assigned (#DCK-101) ✓'
                : 'Dispatch Remediation Lab (#DCK-101)'}
            </button>
          </div>
        </div>

        {/* Affected candidates mini-grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dockerAffectedStudents.map((s) => (
            <div
              key={s.id}
              className="p-3 bg-[#16161A] border border-[#202023] rounded flex items-center justify-between text-xs font-mono"
            >
              <div>
                <div className="font-bold text-white">{s.name}</div>
                <div className="text-[11px] text-[#8B8B93]">{s.id} • GPA {s.gpa.toFixed(2)}</div>
              </div>

              <div className="text-right">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#ffba35]/20 text-[#ffba35] border border-[#ffba35]/30">
                  {s.skills.docker !== null ? `Score: ${s.skills.docker}` : 'NULL (Unassessed)'}
                </span>
                <button
                  onClick={() => onNavigate?.('admin/students')}
                  className="text-[10px] text-[#8052ff] hover:underline block mt-1"
                >
                  View Dossier →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
