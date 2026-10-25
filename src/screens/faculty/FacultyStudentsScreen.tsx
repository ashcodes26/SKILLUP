import React, { useState } from 'react';
import { initialStudents } from '../../data/mockData';
import { StudentRecord } from '../../types';

interface FacultyStudentsScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function FacultyStudentsScreen({ onNavigate, onShowToast }: FacultyStudentsScreenProps) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudents[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [facultyFeedback, setFacultyFeedback] = useState('');
  const [overrideActive, setOverrideActive] = useState<Record<string, boolean>>({});

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ready') return s.tier === 'Tier 1 Ready';
    if (statusFilter === 'remediation') return s.tier === 'In Remediation';
    if (statusFilter === 'pending') return s.reviewStatus === 'Pending Review';
    return true;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleApproveReview = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, reviewStatus: 'Approved' } : s)
    );
    onShowToast?.(`Approved & endorsed resume assets for ${selectedStudent.name}!`, 'success');
  };

  const handleToggleOverride = (studentId: string) => {
    setOverrideActive(prev => {
      const updated = !prev[studentId];
      if (updated) {
        onShowToast?.(`Provisional gate override granted for ${selectedStudent.name}.`, 'warning');
      } else {
        onShowToast?.(`Provisional gate override revoked for ${selectedStudent.name}.`, 'info');
      }
      return { ...prev, [studentId]: updated };
    });
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              CANDIDATE DOSSIER
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Cohort 2026 Directory</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Student Competency & Placement Roster</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Individual student audits, institutional rubric scores, resume diff approvals, and gate overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.('admin/import')}
            className="px-3.5 py-2 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors"
          >
            Import New Candidates
          </button>
          <button
            onClick={() => onNavigate?.('admin/skill-analytics')}
            className="px-3.5 py-2 bg-[#8052ff] hover:bg-[#8052ff]/90 text-xs font-mono text-white rounded transition-colors"
          >
            Cohort Analytics View
          </button>
        </div>
      </div>

      {/* Main Split: Left Roster List & Right Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Candidate Directory */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-3 space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B93] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, ID (#STU-...), or role..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#16161A] border border-[#202023] rounded text-xs text-white placeholder-[#8B8B93] focus:outline-none focus:border-[#8052ff]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#8052ff] text-white'
                    : 'bg-[#16161A] text-[#8B8B93] hover:text-white'
                }`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('ready')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'ready'
                    ? 'bg-[#55C98B]/20 text-[#55C98B] font-bold'
                    : 'bg-[#16161A] text-[#8B8B93] hover:text-white'
                }`}
              >
                Tier 1 Ready
              </button>
              <button
                onClick={() => setStatusFilter('remediation')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'remediation'
                    ? 'bg-[#ffba35]/20 text-[#ffba35] font-bold'
                    : 'bg-[#16161A] text-[#8B8B93] hover:text-white'
                }`}
              >
                In Remediation
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'pending'
                    ? 'bg-[#8052ff]/20 text-[#8052ff] font-bold'
                    : 'bg-[#16161A] text-[#8B8B93] hover:text-white'
                }`}
              >
                Pending Review
              </button>
            </div>
          </div>

          {/* Student list */}
          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredStudents.map((s) => {
              const isSelected = s.id === selectedStudentId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#16161A] border-[#8052ff]'
                      : 'bg-[#0D0D0F] border-[#202023] hover:border-[#363639]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#202023] text-white flex items-center justify-center font-mono font-bold text-xs border border-[#363639]">
                        {s.avatarText}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{s.name}</span>
                          <span className="text-[10px] font-mono text-[#8B8B93] font-normal">{s.id}</span>
                        </div>
                        <div className="text-[11px] text-[#8B8B93]">{s.targetRole}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#55C98B]">
                        {s.readinessPct}%
                      </div>
                      <div className="text-[10px] text-[#8B8B93] font-mono">GPA {s.gpa.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#202023] flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        s.tier === 'Tier 1 Ready'
                          ? 'bg-[#55C98B]/10 text-[#55C98B]'
                          : s.tier === 'In Remediation'
                          ? 'bg-[#ffba35]/10 text-[#ffba35]'
                          : 'bg-[#16161A] text-[#8B8B93]'
                      }`}
                    >
                      {s.tier}
                    </span>

                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        s.reviewStatus === 'Approved'
                          ? 'bg-[#55C98B]/10 text-[#55C98B]'
                          : s.reviewStatus === 'Pending Review'
                          ? 'bg-[#8052ff]/10 text-[#8052ff]'
                          : 'text-[#8B8B93]'
                      }`}
                    >
                      {s.reviewStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Candidate Detail Pane */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#202023]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#16161A] border-2 border-[#8052ff] flex items-center justify-center font-mono font-bold text-lg text-white">
                  {selectedStudent.avatarText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#16161A] text-[#8B8B93] border border-[#202023]">
                      {selectedStudent.id}
                    </span>
                  </div>
                  <div className="text-xs text-[#8B8B93] mt-1">
                    {selectedStudent.department} • Cumulative GPA: <strong className="text-white">{selectedStudent.gpa.toFixed(2)}</strong>
                  </div>
                  <div className="text-xs text-[#D6D6DC] mt-0.5">
                    Target Track: <strong className="text-[#8052ff]">{selectedStudent.targetRole}</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    selectedStudent.tier === 'Tier 1 Ready'
                      ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40'
                      : 'bg-[#ffba35]/20 text-[#ffba35] border border-[#ffba35]/40'
                  }`}
                >
                  {selectedStudent.tier}
                </span>
                <span className="text-xs font-mono text-[#8B8B93]">
                  Readiness: <strong className="text-white">{selectedStudent.readinessPct}%</strong>
                </span>
              </div>
            </div>

            {/* Rubric Competency Matrix (Distinguishing NULL from 0) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Evaluated Competency Matrix
                </h3>
                <span className="text-[11px] font-mono text-[#8B8B93]">IEEE P2863 Assessment Standard</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#16161A] border border-[#202023] rounded">
                  <div className="text-[11px] font-mono text-[#8B8B93]">PYTHON</div>
                  <div className="text-lg font-bold font-mono text-[#55C98B] mt-0.5">
                    {selectedStudent.skills.python.toFixed(1)} / 5.0
                  </div>
                  <div className="text-[10px] text-[#55C98B]">Verified Advanced</div>
                </div>

                <div className="p-3 bg-[#16161A] border border-[#202023] rounded">
                  <div className="text-[11px] font-mono text-[#8B8B93]">POSTGRESQL</div>
                  <div className="text-lg font-bold font-mono text-[#55C98B] mt-0.5">
                    {selectedStudent.skills.postgres.toFixed(1)} / 5.0
                  </div>
                  <div className="text-[10px] text-[#55C98B]">Verified Proficient</div>
                </div>

                <div className="p-3 bg-[#16161A] border border-[#202023] rounded">
                  <div className="text-[11px] font-mono text-[#8B8B93]">GIT & WORKFLOW</div>
                  <div className="text-lg font-bold font-mono text-[#55C98B] mt-0.5">
                    {selectedStudent.skills.git.toFixed(1)} / 5.0
                  </div>
                  <div className="text-[10px] text-[#55C98B]">Verified Core</div>
                </div>

                {/* Docker - Notice NULL unassessed handling */}
                <div className="p-3 bg-[#16161A] border border-[#202023] rounded">
                  <div className="text-[11px] font-mono text-[#8B8B93]">DOCKER</div>
                  <div className="text-lg font-bold font-mono mt-0.5">
                    {selectedStudent.skills.docker !== null ? (
                      <span className="text-[#55C98B]">{selectedStudent.skills.docker.toFixed(1)} / 5.0</span>
                    ) : (
                      <span className="text-[#ffba35]">NULL</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#ffba35]">
                    {selectedStudent.skills.docker !== null ? 'Verified' : 'Unassessed Deficit (#DCK-101)'}
                  </div>
                </div>

                <div className="p-3 bg-[#16161A] border border-[#202023] rounded">
                  <div className="text-[11px] font-mono text-[#8B8B93]">REDIS</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedStudent.skills.redis !== null ? `${selectedStudent.skills.redis.toFixed(1)} / 5.0` : 'NULL'}
                  </div>
                  <div className="text-[10px] text-[#8B8B93]">Caching / Queues</div>
                </div>

                <div className="p-3 bg-[#16161A] border border-[#202023] rounded">
                  <div className="text-[11px] font-mono text-[#8B8B93]">KAFKA</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedStudent.skills.kafka !== null ? `${selectedStudent.skills.kafka.toFixed(1)} / 5.0` : 'NULL'}
                  </div>
                  <div className="text-[10px] text-[#8B8B93]">Streaming Hub</div>
                </div>
              </div>
            </div>

            {/* Resume Diff Review & Endorsement Box */}
            <div className="space-y-3 pt-3 border-t border-[#202023]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Resume Diff Approval: Version {selectedStudent.reviewVersion || 'v4.0'}
                  </h3>
                  <p className="text-[11px] text-[#8B8B93]">Submission date: {selectedStudent.reviewDate || 'Recent'}</p>
                </div>
                <span className="text-xs font-mono text-[#8052ff] font-bold">
                  Status: {selectedStudent.reviewStatus}
                </span>
              </div>

              {/* Diff inspection */}
              <div className="p-3 bg-[#000000] border border-[#202023] rounded font-mono text-xs space-y-2">
                <div className="text-[#8B8B93] text-[10px] uppercase font-bold">Original Bullet:</div>
                <div className="text-[#F87171] line-through bg-[#F87171]/10 p-1.5 rounded">
                  Implemented PostgreSQL database indexing to optimize slow queries for the order service.
                </div>
                <div className="text-[#8B8B93] text-[10px] uppercase font-bold mt-2">Proposed Replacement (Quantified):</div>
                <div className="text-[#55C98B] bg-[#55C98B]/10 p-1.5 rounded">
                  Architected composite B-tree indices on PostgreSQL 15, reducing 99th percentile query latency from 420ms to 68ms under 4,500 req/s load.
                </div>
              </div>

              {/* Faculty Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleApproveReview(selectedStudent.id)}
                  disabled={selectedStudent.reviewStatus === 'Approved'}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded transition-colors flex items-center gap-1.5 ${
                    selectedStudent.reviewStatus === 'Approved'
                      ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
                      : 'bg-[#55C98B] hover:bg-[#55C98B]/90 text-black'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  {selectedStudent.reviewStatus === 'Approved' ? 'Approved & Endorsed ✓' : 'Approve & Endorse for Drives'}
                </button>

                {/* Faculty Override Toggle */}
                <button
                  onClick={() => handleToggleOverride(selectedStudent.id)}
                  className={`px-3 py-2 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
                    overrideActive[selectedStudent.id]
                      ? 'bg-[#ffba35]/20 text-[#ffba35] border-[#ffba35]/40'
                      : 'bg-[#16161A] text-[#8B8B93] hover:text-white border-[#363639]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  {overrideActive[selectedStudent.id] ? 'Provisional Waiver Active' : 'Grant Gate Waiver'}
                </button>
              </div>
            </div>

            {/* Drive Pipeline Allocation */}
            <div className="space-y-2 pt-3 border-t border-[#202023]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Assigned Recruiting Drive Pipeline
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.driveEligible.map((d, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[#16161A] border border-[#202023] text-xs font-mono text-[#D6D6DC] flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#55C98B]"></span>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
