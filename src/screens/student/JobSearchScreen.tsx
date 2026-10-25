import React, { useState } from 'react';
import { initialJobs } from '../../data/mockData';
import { JobPosting } from '../../types';

interface JobSearchScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function JobSearchScreen({ onNavigate, onShowToast }: JobSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobs[0].id);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_match' | 'campus_partner'>('all');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const filteredJobs = initialJobs.filter(job => {
    const matchesQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (activeFilter === 'high_match') return job.matchPct >= 85;
    if (activeFilter === 'campus_partner') return job.source.includes('Campus') || job.source.includes('Institutional');
    return true;
  });

  const selectedJob: JobPosting = initialJobs.find(j => j.id === selectedJobId) || initialJobs[0];

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs(prev => [...prev, jobId]);
      onShowToast?.(`Application package for ${selectedJob.company} dispatched with verified institutional credential!`, 'success');
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B93] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by role title, technology (e.g. Python, Docker), company or location..."
              className="w-full pl-10 pr-4 py-2 bg-[#16161A] border border-[#202023] rounded-md text-sm text-white placeholder-[#8B8B93] focus:outline-none focus:border-[#8052ff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#8052ff] text-white'
                  : 'bg-[#16161A] text-[#8B8B93] hover:text-white border border-[#202023]'
              }`}
            >
              All Openings ({initialJobs.length})
            </button>
            <button
              onClick={() => setActiveFilter('high_match')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeFilter === 'high_match'
                  ? 'bg-[#8052ff] text-white'
                  : 'bg-[#16161A] text-[#8B8B93] hover:text-white border border-[#202023]'
              }`}
            >
              High Match (≥85%)
            </button>
            <button
              onClick={() => setActiveFilter('campus_partner')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeFilter === 'campus_partner'
                  ? 'bg-[#8052ff] text-white'
                  : 'bg-[#16161A] text-[#8B8B93] hover:text-white border border-[#202023]'
              }`}
            >
              Campus Partners
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8B8B93] pt-2 border-t border-[#202023]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#55C98B]"></span>
            <span>Grounded against active institutional drives & verified skills profile</span>
          </div>
          <span className="font-mono">Candidate ID: #STU-2026-88 (Alex R. Mercer)</span>
        </div>
      </div>

      {/* Main Split: Job List Left & Detailed Match Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ranked Job Listings */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-[#8B8B93] px-1 flex justify-between">
            <span>RANKED MATCHES ({filteredJobs.length})</span>
            <span>SORT: CONCORDANCE ↓</span>
          </div>

          <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              const isApplied = appliedJobs.includes(job.id);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#16161A] border-[#8052ff] shadow-sm'
                      : 'bg-[#0D0D0F] border-[#202023] hover:border-[#363639]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white hover:text-[#8052ff] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#8B8B93]">
                        <span className="text-[#D6D6DC] font-medium">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#55C98B]/10 text-[#55C98B] border border-[#55C98B]/30">
                        {job.matchPct}% Match
                      </div>
                      <div className="text-[10px] text-[#8B8B93] mt-1 font-mono">{job.postedAgo}</div>
                    </div>
                  </div>

                  {job.compensation && (
                    <div className="mt-2 text-xs font-mono text-[#55C98B]">
                      {job.compensation}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          tag.status === 'verified'
                            ? 'bg-[#55C98B]/10 text-[#55C98B] border-[#55C98B]/30'
                            : tag.status === 'gap'
                            ? 'bg-[#ffba35]/10 text-[#ffba35] border-[#ffba35]/30'
                            : 'bg-[#16161A] text-[#8B8B93] border-[#202023]'
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#202023] flex items-center justify-between text-[11px] text-[#8B8B93]">
                    <span className="font-mono">{job.source}</span>
                    {isApplied && (
                      <span className="text-[#55C98B] font-mono font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check</span> Applied
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Match & Competency Gap Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-6 space-y-6">
            {/* Header of selected job */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#202023]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
                    {selectedJob.source}
                  </span>
                  <span className="text-xs text-[#8B8B93] font-mono">{selectedJob.concordance}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">{selectedJob.title}</h2>
                <div className="flex items-center gap-3 text-xs text-[#8B8B93] mt-1">
                  <span className="text-[#D6D6DC] font-medium">{selectedJob.company}</span>
                  <span>•</span>
                  <span>{selectedJob.location}</span>
                  <span>•</span>
                  <span className="text-[#55C98B] font-mono font-semibold">{selectedJob.compensation}</span>
                </div>
              </div>

              {/* Match Gauge */}
              <div className="flex items-center gap-3 bg-[#16161A] p-3 rounded-lg border border-[#202023]">
                <div className="w-12 h-12 rounded-full border-4 border-[#55C98B] flex items-center justify-center font-mono font-bold text-sm text-[#55C98B]">
                  {selectedJob.matchPct}%
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Match Level</div>
                  <div className="text-[10px] font-mono text-[#8B8B93]">Institutional Baseline</div>
                </div>
              </div>
            </div>

            {/* Application action bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleApply(selectedJob.id)}
                disabled={appliedJobs.includes(selectedJob.id)}
                className={`flex-1 min-w-[200px] py-2.5 px-4 rounded text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                  appliedJobs.includes(selectedJob.id)
                    ? 'bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 cursor-default'
                    : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {appliedJobs.includes(selectedJob.id) ? 'check' : 'send'}
                </span>
                {appliedJobs.includes(selectedJob.id)
                  ? 'Application Dispatched (Institutional Fast-Track)'
                  : 'Apply with Endorsed Profile V4'}
              </button>

              <button
                onClick={() => onNavigate?.('resume-analyzer')}
                className="py-2.5 px-4 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Tune Resume for this Drive
              </button>
            </div>

            {/* Grounded Competency Threshold Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Competency Threshold Benchmark
                </h3>
                <span className="text-[11px] font-mono text-[#8B8B93]">Target Scale: 1.0 – 5.0</span>
              </div>

              <div className="border border-[#202023] rounded-lg overflow-hidden bg-[#16161A]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#000000] border-b border-[#202023] text-[#8B8B93] text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Competency</th>
                      <th className="py-2 px-3 text-center">Required Min</th>
                      <th className="py-2 px-3 text-center">Verified Score</th>
                      <th className="py-2 px-3">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202023]">
                    {selectedJob.roleThresholds.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#202023]/40">
                        <td className="py-2.5 px-3 font-medium text-white">{row.skill}</td>
                        <td className="py-2.5 px-3 text-center text-[#8B8B93]">{row.threshold.toFixed(1)}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {row.verifiedLevel !== null ? (
                            <span className={row.verifiedLevel >= row.threshold ? 'text-[#55C98B]' : 'text-[#ffba35]'}>
                              {row.verifiedLevel.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-[#ffba35] italic">NULL (Unassessed)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.isGap ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#ffba35] text-[11px]">{row.outcome}</span>
                              <button
                                onClick={() => onNavigate?.('placement-hub')}
                                className="px-2 py-0.5 bg-[#ffba35]/20 text-[#ffba35] border border-[#ffba35]/40 rounded text-[10px] hover:bg-[#ffba35]/30"
                              >
                                Take Lab →
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#55C98B] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              {row.outcome}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preferred Tech Stack Delta */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Tech Stack Coverage & Architecture
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedJob.preferredStack.map((tech, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border text-xs font-mono flex items-center justify-between ${
                      tech.missing
                        ? 'bg-[#ffba35]/5 border-[#ffba35]/30 text-[#ffba35]'
                        : 'bg-[#16161A] border-[#202023] text-[#D6D6DC]'
                    }`}
                  >
                    <span>{tech.name}</span>
                    <span className="text-[10px]">
                      {tech.missing ? 'Needs Lab' : tech.delta || 'Verified'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Placement Note */}
            <div className="space-y-2 pt-2 border-t border-[#202023]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Role Brief & Institutional Handoff
              </h3>
              <p className="text-xs text-[#8B8B93] leading-relaxed">
                {selectedJob.description}
              </p>
              <div className="p-3 bg-[#16161A] border border-[#202023] rounded text-xs text-[#8B8B93] flex items-center justify-between">
                <span>Direct HR Coordinator: Institutional Talent Operations</span>
                <span className="text-[#55C98B] font-mono">Fast-Track ID: #DIR-CS-2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
