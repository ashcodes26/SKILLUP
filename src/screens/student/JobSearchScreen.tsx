import React, { useState } from 'react';
import { initialJobs, initialSkillDemand, INITIAL_STUDENT_PROFILE } from '../../data/mockData';
import { JobPosting, StudentProfileData } from '../../types';
import SkillTechTreeModal from '../../components/SkillTechTreeModal';

interface JobSearchScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  profile?: StudentProfileData;
}

const ACTION_WEIGHTS: Record<'Learn' | 'Assess' | 'Maintain', number> = {
  Learn: 2.0,
  Assess: 1.5,
  Maintain: 0.25,
};

// Map SkillDemandItem IDs to StudentProfileData competency IDs
const DEMAND_TO_COMP_ID: Record<string, string> = {
  'dem-py': 'comp-py',
  'dem-sql': 'comp-sql',
  'dem-dck': 'comp-docker',
  'dem-red': 'comp-redis',
  'dem-git': 'comp-git',
  'dem-kaf': 'comp-kafka',
};

export default function JobSearchScreen({
  onNavigate,
  onShowToast,
  profile = INITIAL_STUDENT_PROFILE,
}: JobSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobs[0].id);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_match' | 'campus_partner'>('all');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [techTreeSkillKey, setTechTreeSkillKey] = useState<string | null>(null);

  // Enrich top 6 market skills with live studentProfile competencies
  const radarSkills = initialSkillDemand.slice(0, 6).map((skill) => {
    const compId = DEMAND_TO_COMP_ID[skill.id];
    const matchingComp = profile.competencies.find((c) => c.id === compId);
    const verifiedDepth = matchingComp ? matchingComp.proficiency : skill.verifiedDepth;

    // Action classification: null -> Learn (or Assess if unassessed SQL/Docker), < target -> Assess, >= target -> Maintain
    const actionType: 'Learn' | 'Assess' | 'Maintain' =
      verifiedDepth === null
        ? compId === 'comp-sql' || compId === 'comp-docker'
          ? 'Assess'
          : 'Learn'
        : verifiedDepth < (matchingComp?.targetLevel ?? 3.5)
        ? 'Assess'
        : 'Maintain';

    const demandPercentage = Math.round((skill.jobCount / Math.max(1, skill.totalSample)) * 100);
    const demandFraction = skill.jobCount / Math.max(1, skill.totalSample);
    const requiredFraction = skill.requiredFraction ?? 0.6;
    const actionWeight = ACTION_WEIGHTS[actionType];

    // Priority Weighting Formula: demand_fraction * (1 + 0.5 * required_fraction) * action_weight
    const priorityScore = Number(
      (demandFraction * (1 + 0.5 * requiredFraction) * actionWeight).toFixed(3)
    );

    // Student evidenced proficiency on 0-100 scale (strictly null if unverified; never coerced to 0 in data)
    const studentProficiencyPct =
      verifiedDepth !== null ? Math.round((verifiedDepth / 5.0) * 100) : null;

    return {
      ...skill,
      compId,
      verifiedDepth,
      studentProficiencyPct,
      demandPercentage,
      demandFraction,
      requiredFraction,
      actionType,
      actionWeight,
      priorityScore,
      evidenceLabel: matchingComp?.evidenceLabel ?? (verifiedDepth === null ? 'Needs assessment' : 'Verified'),
    };
  });

  // Ranked priority recommendations (highest priority score first)
  const priorityRecommendations = [...radarSkills].sort((a, b) => b.priorityScore - a.priorityScore);

  // SVG Radar Geometry (6 axes, 0-100 scale)
  const cx = 155;
  const cy = 155;
  const maxR = 106;

  const radarAxes = radarSkills.map((s, idx) => ({
    id: s.id,
    label: s.name.split(' ')[0],
    fullName: s.name,
    angle: idx * 60,
    marketDemandPct: s.demandPercentage,
    // For SVG polygon rendering only, unverified (null) plots at center vertex while label explicitly states "null"
    studentPlotPct: s.studentProficiencyPct !== null ? s.studentProficiencyPct : 0,
    studentProficiencyPct: s.studentProficiencyPct,
    verifiedDepth: s.verifiedDepth,
  }));

  const getCoordinates = (angleDeg: number, pctVal: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const r = (pctVal / 100) * maxR;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const makePolygon = (getter: (axis: typeof radarAxes[0]) => number) =>
    radarAxes
      .map((axis) => {
        const { x, y } = getCoordinates(axis.angle, getter(axis));
        return `${x},${y}`;
      })
      .join(' ');

  // Dynamically synchronize job postings with live student competencies
  const sqlComp = profile.competencies.find((c) => c.id === 'comp-sql');
  const dockerComp = profile.competencies.find((c) => c.id === 'comp-docker');
  const redisComp = profile.competencies.find((c) => c.id === 'comp-redis');
  const kafkaComp = profile.competencies.find((c) => c.id === 'comp-kafka');

  const liveJobs: JobPosting[] = initialJobs.map((job) => {
    let bonusMatch = 0;
    if (sqlComp?.proficiency !== null && (sqlComp?.proficiency ?? 0) >= 3.0) bonusMatch += 4;
    if (dockerComp?.proficiency !== null && (dockerComp?.proficiency ?? 0) >= 3.5) bonusMatch += 3;

    const updatedThresholds = job.roleThresholds.map((th) => {
      const skillLower = th.skill.toLowerCase();
      if (skillLower.includes('sql') && sqlComp) {
        const lvl = sqlComp.proficiency;
        const met = lvl !== null && lvl >= th.threshold;
        return {
          ...th,
          verifiedLevel: lvl,
          isGap: !met,
          outcome:
            lvl === null
              ? 'Unassessed (Take Quiz #SQL-01)'
              : met
              ? `Verified (${lvl.toFixed(1)}/5.0 • #SQL-01)`
              : `Below Threshold (${lvl.toFixed(1)}/${th.threshold.toFixed(1)})`,
        };
      }
      if (skillLower.includes('docker') && dockerComp) {
        const lvl = dockerComp.proficiency;
        const met = lvl !== null && lvl >= th.threshold;
        return {
          ...th,
          verifiedLevel: lvl,
          isGap: !met,
          outcome:
            lvl === null
              ? 'Unassessed (Take Quiz #DCK-101)'
              : met
              ? `Verified (${lvl.toFixed(1)}/5.0 • #DCK-101)`
              : `Below Threshold (${lvl.toFixed(1)}/${th.threshold.toFixed(1)})`,
        };
      }
      return th;
    });

    const updatedTags = job.tags.map((tag) => {
      const tLower = tag.name.toLowerCase();
      if (tLower.includes('sql') && sqlComp?.proficiency !== null) {
        return { ...tag, name: `SQL (${sqlComp?.proficiency.toFixed(1)})`, status: 'verified' as const };
      }
      if (tLower.includes('docker') && dockerComp?.proficiency !== null) {
        return { ...tag, name: `Docker (${dockerComp?.proficiency.toFixed(1)})`, status: 'verified' as const };
      }
      if (tLower.includes('redis') && redisComp?.proficiency !== null) {
        return { ...tag, name: `Redis (${redisComp?.proficiency.toFixed(1)})`, status: 'verified' as const };
      }
      if (tLower.includes('kafka') && kafkaComp?.proficiency !== null) {
        return { ...tag, name: `Kafka (${kafkaComp?.proficiency.toFixed(1)})`, status: 'verified' as const };
      }
      return tag;
    });

    return {
      ...job,
      matchPct: Math.min(99, job.matchPct + bonusMatch),
      roleThresholds: updatedThresholds,
      tags: updatedTags,
    };
  });

  const filteredJobs = liveJobs.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (activeFilter === 'high_match') return job.matchPct >= 85;
    if (activeFilter === 'campus_partner')
      return job.source.includes('Campus') || job.source.includes('Institutional');
    return true;
  });

  const selectedJob: JobPosting = liveJobs.find((j) => j.id === selectedJobId) || liveJobs[0];

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs((prev) => [...prev, jobId]);
      onShowToast?.(
        `Application package for ${selectedJob.company} dispatched with verified institutional credential!`,
        'success'
      );
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* SECTION 4: Market Demand Radar & Priority Recommendations (Top of Opportunities Tab) */}
      <section className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#202023]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8052ff] font-semibold">
              <span>MARKET DEMAND RADAR</span>
              <span>·</span>
              <span>TOP 6 TARGET ROLE SKILLS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Opportunities &amp; Market Demand Radar — SRM CDC Placement Console
            </h1>
            <p className="text-xs text-[#9A9A9A] mt-0.5">
              Target Role: <strong className="text-white">{profile.targetRole}</strong> · Directorate of Career Centre (CDC), SRMIST Kattankulathur
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => onNavigate?.('interview-room')}
              className="px-3.5 py-2 rounded-lg bg-[#ffba35] hover:bg-[#ffba35]/90 text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap"
              title="Practice live technical and HR interviews for Amazon, Cisco, Barclays"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>AI Interview Room</span>
            </button>
            <button
              onClick={() => onNavigate?.('career-plan')}
              className="px-3.5 py-2 rounded-lg bg-[#8052ff] hover:bg-[#8052ff]/90 text-white text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Career Plan →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 6-Axis SVG Radar Chart (5 Cols) */}
          <div className="lg:col-span-5 bg-[#16161A] border border-[#202023] rounded-lg p-4 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#202023]">
              <span className="text-xs font-bold text-white">Evidenced Proficiency vs. Market Demand</span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-[#55C98B]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#55C98B]" />
                  Student (0–100)
                </span>
                <span className="flex items-center gap-1.5 text-[#8052ff]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#8052ff]" />
                  Market Demand %
                </span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-center">
              <svg width="310" height="310" className="overflow-visible">
                {/* Concentric Grid Circles: 20%, 40%, 60%, 80%, 100% */}
                {[20, 40, 60, 80, 100].map((pct) => {
                  const r = (pct / 100) * maxR;
                  return (
                    <circle
                      key={pct}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="#26262B"
                      strokeDasharray={pct === 100 ? 'none' : '3 3'}
                    />
                  );
                })}

                {/* 6 Axis Spokes */}
                {radarAxes.map((axis, idx) => {
                  const { x, y } = getCoordinates(axis.angle, 100);
                  return <line key={idx} x1={cx} y1={cy} x2={x} y2={y} stroke="#26262B" strokeWidth="1" />;
                })}

                {/* Market Demand Polygon (%) */}
                <polygon
                  points={makePolygon((a) => a.marketDemandPct)}
                  fill="#8052ff"
                  fillOpacity="0.16"
                  stroke="#8052ff"
                  strokeWidth="2"
                />

                {/* Student Evidenced Proficiency Polygon (0-100 scale) */}
                <polygon
                  points={makePolygon((a) => a.studentPlotPct)}
                  fill="#55C98B"
                  fillOpacity="0.24"
                  stroke="#55C98B"
                  strokeWidth="2.5"
                />

                {/* Vertex Dots & Axis Labels (Clickable -> Opens Tech Tree Modal) */}
                {radarAxes.map((axis, idx) => {
                  const labelPos = getCoordinates(axis.angle, 122);
                  const studentVertex = getCoordinates(axis.angle, axis.studentPlotPct);
                  return (
                    <g
                      key={idx}
                      onClick={() => setTechTreeSkillKey(axis.id)}
                      className="cursor-pointer group"
                      tabIndex={0}
                    >
                      <circle
                        cx={studentVertex.x}
                        cy={studentVertex.y}
                        r={4.5}
                        fill={axis.studentProficiencyPct === null ? '#ffba35' : '#55C98B'}
                        className="transition-transform group-hover:scale-150"
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y + 4}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="group-hover:fill-[#cdbdff] group-hover:font-bold transition-colors underline cursor-pointer"
                      >
                        {axis.label}{' '}
                        {axis.studentProficiencyPct === null
                          ? '(null)'
                          : `${axis.studentProficiencyPct}%`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="w-full pt-2.5 border-t border-[#202023] flex items-center justify-between text-[11px] font-mono text-[#9A9A9A]">
              <button
                onClick={() => setTechTreeSkillKey('dem-kaf')}
                className="text-[#cdbdff] hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer bg-[#8052ff]/10 hover:bg-[#8052ff]/20 px-2 py-0.5 rounded border border-[#8052ff]/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] text-[#8052ff]">account_tree</span>
                <span>Open Skill Tech-Tree ↗</span>
              </button>
              <span className="text-[10px] text-[#A0A0AB]">Click any skill on radar to inspect</span>
            </div>
          </div>

          {/* Right: Priority Recommendations Engine (7 Cols) */}
          <div className="lg:col-span-7 bg-[#16161A] border border-[#202023] rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202023]">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Priority Recommendations (Weighted Priority Formula)
                </h2>
                <p className="text-[11px] text-[#9A9A9A] font-mono mt-0.5">
                  Formula: demand_fraction × (1 + 0.5 × required_fraction) × action_weight
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#cdbdff]">
                Learn=2.0 · Assess=1.5 · Maintain=0.25
              </span>
            </div>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {priorityRecommendations.map((item, idx) => {
                const isPriority = item.actionType === 'Learn' || item.actionType === 'Assess';
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isPriority
                        ? 'bg-[#0D0D0F] border-[#8052ff]/40 hover:border-[#8052ff]'
                        : 'bg-[#0D0D0F]/60 border-[#202023]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#8052ff]/20 text-[#cdbdff] font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white">{item.name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] border ${
                            item.actionType === 'Learn'
                              ? 'bg-[#EB5757]/15 text-[#EB5757] border-[#EB5757]/40'
                              : item.actionType === 'Assess'
                              ? 'bg-[#ffba35]/15 text-[#ffba35] border-[#ffba35]/40'
                              : 'bg-[#55C98B]/15 text-[#55C98B] border-[#55C98B]/40'
                          }`}
                        >
                          {item.actionType} ({item.actionWeight}x)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[#ffba35] font-bold tabular-nums text-[11px]">
                          Score: {item.priorityScore.toFixed(3)}
                        </span>

                        <button
                          onClick={() => setTechTreeSkillKey(item.id)}
                          className="px-2 py-0.5 rounded bg-[#8052ff]/20 hover:bg-[#8052ff]/30 text-[#cdbdff] hover:text-white border border-[#8052ff]/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Inspect Prerequisite Tech-Tree"
                        >
                          <span className="material-symbols-outlined text-[12px]">account_tree</span>
                          <span>Tech-Tree →</span>
                        </button>

                        {isPriority && (
                          <button
                            onClick={() => onNavigate?.('career-plan')}
                            className="text-[#cdbdff] hover:text-white underline text-[11px] cursor-pointer"
                          >
                            {item.actionType === 'Assess' ? 'Assessment →' : 'Roadmap →'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                      <div>
                        <div className="flex justify-between text-[#9A9A9A] mb-1">
                          <span>Market Demand ({item.jobCount}/{item.totalSample} jobs)</span>
                          <span className="text-[#8052ff] font-bold">{item.demandPercentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#16161A] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8052ff] rounded-full"
                            style={{ width: `${item.demandPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#9A9A9A] mb-1">
                          <span>Student Evidenced (0–100)</span>
                          <span
                            className={
                              item.studentProficiencyPct === null
                                ? 'text-[#ffba35] font-bold'
                                : 'text-[#55C98B] font-bold'
                            }
                          >
                            {item.studentProficiencyPct === null
                              ? 'null (Unassessed)'
                              : `${item.studentProficiencyPct}% (${item.verifiedDepth?.toFixed(1)}/5.0)`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#16161A] rounded-full overflow-hidden">
                          {item.studentProficiencyPct !== null && (
                            <div
                              className="h-full bg-[#55C98B] rounded-full transition-all duration-500"
                              style={{ width: `${item.studentProficiencyPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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
              placeholder="Filter by role title, technology (e.g. Python, SQL, Docker), company or location..."
              className="w-full pl-10 pr-4 py-2 bg-[#16161A] border border-[#202023] rounded-md text-sm text-white placeholder-[#8B8B93] focus:outline-none focus:border-[#8052ff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#8052ff] text-white'
                  : 'bg-[#16161A] text-[#8B8B93] hover:text-white border border-[#202023]'
              }`}
            >
              All Openings ({liveJobs.length})
            </button>
            <button
              onClick={() => setActiveFilter('high_match')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeFilter === 'high_match'
                  ? 'bg-[#8052ff] text-white'
                  : 'bg-[#16161A] text-[#8B8B93] hover:text-white border border-[#202023]'
              }`}
            >
              High Match (≥85%)
            </button>
            <button
              onClick={() => setActiveFilter('campus_partner')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
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
            <span>Grounded against active institutional drives &amp; live verified skills profile</span>
          </div>
          <span className="font-mono">Candidate ID: {profile.id} ({profile.name})</span>
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
                  <div className="text-[10px] font-mono text-[#8B8B93]">Live Evidence Sync</div>
                </div>
              </div>
            </div>

            {/* Application action bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleApply(selectedJob.id)}
                disabled={appliedJobs.includes(selectedJob.id)}
                className={`flex-1 min-w-[200px] py-2.5 px-4 rounded text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                className="py-2.5 px-4 bg-[#16161A] hover:bg-[#202023] text-xs font-mono text-[#D6D6DC] border border-[#363639] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
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
                            <span className="text-[#ffba35] italic">null (Needs assessment)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.isGap ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#ffba35] text-[11px]">{row.outcome}</span>
                              <button
                                onClick={() => onNavigate?.('career-plan')}
                                className="px-2 py-0.5 bg-[#8052ff]/20 text-[#cdbdff] border border-[#8052ff]/40 rounded text-[10px] hover:bg-[#8052ff]/30 cursor-pointer"
                              >
                                Take Assessment →
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
                Tech Stack Coverage &amp; Architecture
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
                Role Brief &amp; Institutional Handoff
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

      {/* Skill Dependency Tech-Tree Modal Inspector */}
      {techTreeSkillKey && (
        <SkillTechTreeModal
          isOpen={Boolean(techTreeSkillKey)}
          onClose={() => setTechTreeSkillKey(null)}
          targetSkillKey={techTreeSkillKey}
          profile={profile}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
