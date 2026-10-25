import React, { useState } from 'react';
import { initialDrives } from '../../data/mockData';

interface FacultyPlacementDrivesScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyPlacementDrivesScreen({ onNavigate, onShowToast }: FacultyPlacementDrivesScreenProps) {
  const [selectedDriveId, setSelectedDriveId] = useState<string>(initialDrives[0].id);
  const [minGpa, setMinGpa] = useState<number>(3.50);
  const [minReadiness, setMinReadiness] = useState<number>(85);
  const [enforceDocker, setEnforceDocker] = useState<boolean>(true);
  const [enforcePostgres, setEnforcePostgres] = useState<boolean>(true);

  // Manual faculty overrides log
  const [overrides, setOverrides] = useState([
    {
      id: 'ov-1',
      studentId: '#STU-2026-88',
      studentName: 'Alex R. Mercer',
      grantedBy: 'Prof. Sarah Jenkins',
      timestamp: 'Today, 09:42 AM',
      reason: 'Verified Capstone containerization equivalent to Docker 4.0; awaiting quiz sync.',
      active: true,
    },
    {
      id: 'ov-2',
      studentId: '#STU-2026-14',
      studentName: 'Maya Chen',
      grantedBy: 'Prof. Sarah Jenkins',
      timestamp: 'Yesterday, 14:15 PM',
      reason: 'ACM ICPC Regional finalist waiver for algorithms benchmark.',
      active: true,
    },
  ]);

  const selectedDrive = initialDrives.find(d => d.id === selectedDriveId) || initialDrives[0];

  // Simulated eligible calculation based on sliders
  const simulatedEligible = Math.round(48 * (minReadiness < 80 ? 1.4 : minReadiness > 85 ? 0.7 : 1.0) * (minGpa > 3.6 ? 0.6 : 1.0));
  const simulatedRemediation = Math.max(12, 148 - simulatedEligible - 88);

  const handleSaveRules = () => {
    onShowToast?.(`Placement rules for ${selectedDrive.company} successfully compiled and locked!`, 'success');
  };

  const handleRevokeOverride = (ovId: string) => {
    setOverrides(prev => prev.filter(o => o.id !== ovId));
    onShowToast?.("Revoked provisional waiver. Candidate reverted to automated gate evaluation.", "info");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              RECRUITING POLICY ENGINE
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Drive Gates & Criteria</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Placement Drives & Institutional Rules Engine</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Configure algorithmic gates, ATS score cutoffs, and audited faculty override exceptions.
          </p>
        </div>

        <button
          onClick={() => onNavigate?.('admin/reports')}
          className="px-3.5 py-2 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          Export Audit Trail
        </button>
      </div>

      {/* Drive Selector Cards (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {initialDrives.map((drive) => {
          const isSelected = drive.id === selectedDriveId;
          return (
            <div
              key={drive.id}
              onClick={() => setSelectedDriveId(drive.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#16161A] border-[#8052ff]'
                  : 'bg-[#0D0D0F] border-[#202023] hover:border-[#363639]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8052ff] font-bold uppercase">{drive.track}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{drive.company}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#55C98B]">{drive.compensation}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#202023] text-[#8B8B93]">
                <div>Eligible: <strong className="text-white">{drive.eligibleCount}</strong></div>
                <div>Cutoff: <span className="text-[#ffba35]">{drive.cutoffDate}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules Config Engine & Real-Time Simulation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rules Config Form */}
        <div className="lg:col-span-7 bg-[#0D0D0F] border border-[#202023] rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Rule Formulation: {selectedDrive.company} ({selectedDrive.criteriaRuleId})
              </h2>
              <p className="text-xs text-[#8B8B93]">Changes immediately simulate candidate cohort eligibility</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#55C98B]/10 text-[#55C98B] border border-[#55C98B]/30">
              Active Rule Set
            </span>
          </div>

          {/* Slider 1: Min GPA */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white font-semibold">Minimum Cumulative GPA Threshold</span>
              <span className="text-[#8052ff] font-bold">{minGpa.toFixed(2)} / 4.00</span>
            </div>
            <input
              type="range"
              min="3.00"
              max="3.90"
              step="0.05"
              value={minGpa}
              onChange={(e) => setMinGpa(parseFloat(e.target.value))}
              className="w-full accent-[#8052ff] bg-[#16161A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8B8B93]">
              <span>3.00 (Inclusive)</span>
              <span>3.50 (Standard)</span>
              <span>3.90 (Honors Only)</span>
            </div>
          </div>

          {/* Slider 2: Benchmark Readiness Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-white font-semibold">Overall Readiness Benchmark Cutoff</span>
              <span className="text-[#55C98B] font-bold">{minReadiness}%</span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              step="1"
              value={minReadiness}
              onChange={(e) => setMinReadiness(parseInt(e.target.value))}
              className="w-full accent-[#55C98B] bg-[#16161A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8B8B93]">
              <span>65% (Open Pool)</span>
              <span>85% (CloudScale Standard)</span>
              <span>95% (Top Decile)</span>
            </div>
          </div>

          {/* Hard Gates Toggles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Mandatory Prerequisite Gates
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-[#16161A] border border-[#202023] rounded cursor-pointer hover:border-[#363639]">
                <div className="text-xs">
                  <div className="font-semibold text-white">Require Docker Orchestration Lab (#DCK-101)</div>
                  <div className="text-[11px] text-[#8B8B93]">Blocks candidates with unassessed NULL Docker scores</div>
                </div>
                <input
                  type="checkbox"
                  checked={enforceDocker}
                  onChange={(e) => setEnforceDocker(e.target.checked)}
                  className="w-4 h-4 accent-[#8052ff]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#16161A] border border-[#202023] rounded cursor-pointer hover:border-[#363639]">
                <div className="text-xs">
                  <div className="font-semibold text-white">Require PostgreSQL Indices Benchmark (#SQL-301)</div>
                  <div className="text-[11px] text-[#8B8B93]">Mandates verified score ≥ 3.5 in relational query optimization</div>
                </div>
                <input
                  type="checkbox"
                  checked={enforcePostgres}
                  onChange={(e) => setEnforcePostgres(e.target.checked)}
                  className="w-4 h-4 accent-[#8052ff]"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveRules}
            className="w-full py-2.5 bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-mono text-xs font-bold rounded transition-colors"
          >
            Commit & Publish Rule Set to Placement Engine
          </button>
        </div>

        {/* Right: Live Cohort Simulation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-6 space-y-5">
            <div className="pb-3 border-b border-[#202023]">
              <span className="text-[10px] font-mono uppercase text-[#55C98B] font-bold">REAL-TIME TELEMETRY</span>
              <h2 className="text-sm font-semibold text-white mt-0.5">Cohort Eligibility Simulation</h2>
              <p className="text-xs text-[#8B8B93]">Based on current rule parameters across N=148 candidates</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#16161A] border border-[#202023] rounded-lg">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#55C98B] font-bold">Eligible for Immediate Interview</span>
                  <span className="text-xl font-bold text-[#55C98B]">{simulatedEligible} Candidates</span>
                </div>
                <div className="w-full h-2 bg-[#000000] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#55C98B]" style={{ width: `${(simulatedEligible / 148) * 100}%` }} />
                </div>
                <div className="text-[10px] text-[#8B8B93] mt-1 font-mono">
                  {((simulatedEligible / 148) * 100).toFixed(1)}% of cohort meets all criteria
                </div>
              </div>

              <div className="p-4 bg-[#16161A] border border-[#202023] rounded-lg">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#ffba35] font-bold">Gated in Remediation (Can clear before cutoff)</span>
                  <span className="text-xl font-bold text-[#ffba35]">{simulatedRemediation} Candidates</span>
                </div>
                <div className="w-full h-2 bg-[#000000] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#ffba35]" style={{ width: `${(simulatedRemediation / 148) * 100}%` }} />
                </div>
                <div className="text-[10px] text-[#8B8B93] mt-1 font-mono">
                  Missing only 1 prerequisite lab (#DCK-101 or #SQL-301)
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#16161A] rounded border border-[#202023] text-xs text-[#8B8B93] space-y-1">
              <div className="font-semibold text-white">Rule Execution Guarantee:</div>
              <div>FERPA-compliant rule execution ensures transparent, objective criteria across all candidates.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Overrides Log & Audit Table */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Faculty Overrides & Provisional Waivers Audit Log</h3>
            <p className="text-xs text-[#8B8B93]">Every manual gate override is cryptographically logged under FERPA / IEEE P2863</p>
          </div>
          <span className="text-xs font-mono text-[#8B8B93]">{overrides.length} Active Waivers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Granted By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Institutional Justification</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {overrides.map((ov) => (
                <tr key={ov.id} className="hover:bg-[#16161A]/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{ov.studentName}</div>
                    <div className="text-[10px] text-[#8B8B93]">{ov.studentId}</div>
                  </td>
                  <td className="py-3 px-4 text-[#D6D6DC]">{ov.grantedBy}</td>
                  <td className="py-3 px-4 text-[#8B8B93]">{ov.timestamp}</td>
                  <td className="py-3 px-4 text-[#D6D6DC] max-w-xs">{ov.reason}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleRevokeOverride(ov.id)}
                      className="px-2 py-1 bg-[#202023] hover:bg-[#F87171]/20 hover:text-[#F87171] text-[#8B8B93] rounded text-[11px] transition-colors"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
