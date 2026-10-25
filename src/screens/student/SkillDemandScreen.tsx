import React, { useState } from 'react';
import { initialSkillDemand, INITIAL_STUDENT_PROFILE } from '../../data/mockData';
import { StudentProfileData } from '../../types';

interface SkillDemandScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  profile?: StudentProfileData;
  dockerScore?: number | null;
}

const ACTION_WEIGHTS: Record<'Learn' | 'Assess' | 'Maintain', number> = {
  Learn: 2.0,
  Assess: 1.5,
  Maintain: 0.25,
};

const DEMAND_TO_COMP_ID: Record<string, string> = {
  'dem-py': 'comp-py',
  'dem-sql': 'comp-sql',
  'dem-dck': 'comp-docker',
  'dem-red': 'comp-redis',
  'dem-git': 'comp-git',
  'dem-kaf': 'comp-kafka',
};

export default function SkillDemandScreen({
  onNavigate,
  onShowToast,
  profile = INITIAL_STUDENT_PROFILE,
  dockerScore,
}: SkillDemandScreenProps) {
  // Multi-role comparison state (compare 1, 2, or 3 target roles simultaneously)
  const [selectedTracks, setSelectedTracks] = useState<('backend' | 'devops' | 'data')[]>(['backend', 'devops']);
  const [mentionFilter, setMentionFilter] = useState<'all' | 'Required' | 'Preferred' | 'Mentioned'>('all');

  const toggleTrack = (track: 'backend' | 'devops' | 'data') => {
    setSelectedTracks((prev) => {
      if (prev.includes(track)) {
        if (prev.length === 1) return prev; // Keep at least 1 selected
        return prev.filter((t) => t !== track);
      }
      return [...prev, track];
    });
  };

  // Enrich skills with live profile competencies and compute Priority Score
  const enrichedSkills = initialSkillDemand.map((skill) => {
    const compId = DEMAND_TO_COMP_ID[skill.id];
    const matchingComp = profile.competencies.find((c) => c.id === compId);
    const isDockerVerified = skill.id === 'dem-dck' && dockerScore !== null && dockerScore !== undefined;
    const verifiedDepth = matchingComp
      ? matchingComp.proficiency
      : isDockerVerified
      ? dockerScore
      : skill.verifiedDepth;

    const actionType: 'Learn' | 'Assess' | 'Maintain' =
      verifiedDepth === null
        ? compId === 'comp-sql' || compId === 'comp-docker'
          ? 'Assess'
          : 'Learn'
        : verifiedDepth < 3.5
        ? 'Assess'
        : 'Maintain';

    // Exact AIMORA formula: demand_percentage = (jobs_mentioning_skill / total_jobs_analyzed) * 100
    const demandPercentage = Math.round((skill.jobCount / Math.max(1, skill.totalSample)) * 100);
    const demandFraction = skill.jobCount / Math.max(1, skill.totalSample);
    const requiredFraction = skill.requiredFraction ?? 0.6;
    const actionWeight = ACTION_WEIGHTS[actionType];

    // Priority Formula: demand_fraction * (1 + 0.5 * required_fraction) * action_weight
    const priorityScore = Number(
      (demandFraction * (1 + 0.5 * requiredFraction) * actionWeight).toFixed(3)
    );

    // Student evidenced proficiency on 0-100 scale (strictly null if unverified)
    const studentProficiencyPct = verifiedDepth !== null ? Math.round((verifiedDepth / 5.0) * 100) : null;

    return {
      ...skill,
      verifiedDepth,
      studentProficiencyPct,
      demandPercentage,
      demandFraction,
      requiredFraction,
      actionType,
      actionWeight,
      priorityScore,
      isGap: verifiedDepth === null || verifiedDepth < 3.5,
    };
  });

  // Sort by Priority Engine score descending for the Recommendation Priority Engine
  const prioritizedSkills = [...enrichedSkills].sort((a, b) => b.priorityScore - a.priorityScore);

  const filteredTableSkills = prioritizedSkills.filter((s) =>
    mentionFilter === 'all' ? true : s.mentionType === mentionFilter
  );

  // SVG Radar Polygon calculations (0-100% scale on 6 axes)
  const cx = 160;
  const cy = 160;
  const maxR = 112;

  const radarAxes = enrichedSkills.map((s, idx) => ({
    name: s.name.split(' ')[0],
    angle: idx * 60,
    backendPct: s.roleDemandByTrack?.backend ?? s.demandPercentage,
    devopsPct: s.roleDemandByTrack?.devops ?? 65,
    dataPct: s.roleDemandByTrack?.data ?? 60,
    studentPct: s.studentProficiencyPct ?? 0, // visual polygon vertex at 0 when null, labeled explicitly
    isNull: s.studentProficiencyPct === null,
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

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Multi-Role Selector */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#9A9A9A]">
            <span className="text-[#8052ff] font-semibold">INDUSTRY SKILL DEMAND &amp; MARKET RADAR</span>
            <span>·</span>
            <span>Sample: 86 Regional Postings Analyzed</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Multi-Role Market Intelligence &amp; Priority Engine
          </h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Compare student evidenced proficiency (0–100%) against market demand frequency across up to 3 target roles simultaneously.
          </p>
        </div>

        {/* Multi-Role Comparison Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-mono text-[#9A9A9A] whitespace-nowrap">Compare Roles (1–3):</span>
          <div className="flex items-center gap-1.5 bg-[#16161A] p-1.5 rounded-lg border border-[#202023]">
            <button
              onClick={() => toggleTrack('backend')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTracks.includes('backend')
                  ? 'bg-[#8052ff] text-white font-semibold'
                  : 'text-[#8B8B93] hover:text-white'
              }`}
            >
              Backend Systems
            </button>
            <button
              onClick={() => toggleTrack('devops')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTracks.includes('devops')
                  ? 'bg-[#ffba35] text-black font-semibold'
                  : 'text-[#8B8B93] hover:text-white'
              }`}
            >
              Cloud / DevOps
            </button>
            <button
              onClick={() => toggleTrack('data')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTracks.includes('data')
                  ? 'bg-[#78d8be] text-black font-semibold'
                  : 'text-[#8B8B93] hover:text-white'
              }`}
            >
              Data Platform
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Multi-Role Radar Visualization + Recommendation Priority Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Radar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col items-center justify-between">
          <div className="w-full flex flex-col gap-2 pb-3 border-b border-[#202023]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Multi-Role Radar Comparison (0–100%)</h2>
              <span className="text-[11px] font-mono text-[#9A9A9A]">
                {selectedTracks.length} Role{selectedTracks.length > 1 ? 's' : ''} Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-[#55C98B]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#55C98B]" />
                <span>Student Evidenced</span>
              </div>
              {selectedTracks.includes('backend') && (
                <div className="flex items-center gap-1.5 text-[#8052ff]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#8052ff]" />
                  <span>Backend</span>
                </div>
              )}
              {selectedTracks.includes('devops') && (
                <div className="flex items-center gap-1.5 text-[#ffba35]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#ffba35]" />
                  <span>DevOps</span>
                </div>
              )}
              {selectedTracks.includes('data') && (
                <div className="flex items-center gap-1.5 text-[#78d8be]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#78d8be]" />
                  <span>Data Platform</span>
                </div>
              )}
            </div>
          </div>

          {/* SVG Radar */}
          <div className="py-4 relative flex items-center justify-center">
            <svg width="320" height="320" className="overflow-visible">
              {/* Concentric grid circles (20%, 40%, 60%, 80%, 100%) */}
              {[20, 40, 60, 80, 100].map((pct) => {
                const r = (pct / 100) * maxR;
                return (
                  <circle
                    key={pct}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#202023"
                    strokeDasharray={pct === 100 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis rays */}
              {radarAxes.map((axis, idx) => {
                const { x, y } = getCoordinates(axis.angle, 100);
                return <line key={idx} x1={cx} y1={cy} x2={x} y2={y} stroke="#202023" strokeWidth="1" />;
              })}

              {/* Role Polygons */}
              {selectedTracks.includes('backend') && (
                <polygon
                  points={makePolygon((a) => a.backendPct)}
                  fill="#8052ff"
                  fillOpacity="0.14"
                  stroke="#8052ff"
                  strokeWidth="2"
                />
              )}
              {selectedTracks.includes('devops') && (
                <polygon
                  points={makePolygon((a) => a.devopsPct)}
                  fill="#ffba35"
                  fillOpacity="0.12"
                  stroke="#ffba35"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}
              {selectedTracks.includes('data') && (
                <polygon
                  points={makePolygon((a) => a.dataPct)}
                  fill="#78d8be"
                  fillOpacity="0.12"
                  stroke="#78d8be"
                  strokeWidth="2"
                />
              )}

              {/* Student Evidenced Proficiency Polygon */}
              <polygon
                points={makePolygon((a) => a.studentPct)}
                fill="#55C98B"
                fillOpacity="0.22"
                stroke="#55C98B"
                strokeWidth="2.5"
              />

              {/* Axis Labels */}
              {radarAxes.map((axis, idx) => {
                const { x, y } = getCoordinates(axis.angle, 118);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={y + 4}
                    fill="#D6D6DC"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {axis.name} {axis.isNull ? '(null)' : `${axis.studentPct}%`}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="w-full bg-[#16161A] p-3 rounded border border-[#202023] text-xs text-[#8B8B93] flex items-center justify-between">
            <span>
              Demand Formula: <code className="font-mono text-white">(jobs_mentioning / total_jobs) * 100</code>
            </span>
            <button
              onClick={() => onNavigate?.('career-plan')}
              className="text-[#cdbdff] hover:underline font-mono text-[11px] cursor-pointer"
            >
              Verify Gaps →
            </button>
          </div>
        </div>

        {/* Right: Recommendation Priority Engine (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#202023]">
            <div>
              <h2 className="text-sm font-semibold text-white">Deterministic Recommendation Priority Engine</h2>
              <p className="text-xs text-[#8B8B93] font-mono mt-0.5">
                Rank = demand_fraction × (1 + 0.5 × required_fraction) × action_weight
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#9A9A9A]">
              Weights: Learn=2.0 · Assess=1.5 · Maintain=0.25
            </div>
          </div>

          <div className="space-y-3">
            {prioritizedSkills.map((skill, index) => (
              <div
                key={skill.id}
                className="p-3.5 bg-[#16161A] border border-[#202023] rounded-lg hover:border-[#363639] transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#cdbdff] font-bold">#{index + 1}</span>
                    <span className="font-bold text-white">{skill.name}</span>
                    <span className="text-[#9A9A9A]">· {skill.mentionType}</span>
                    <span className="text-[#9A9A9A]">· {skill.provenance}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#9A9A9A] tabular-nums">
                      Action: <strong className="text-white">{skill.actionType} ({skill.actionWeight}x)</strong>
                    </span>
                    <span className="font-bold text-[#ffba35] tabular-nums">
                      Priority: {skill.priorityScore.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Comparison Bars: Student Evidenced Proficiency (%) vs Market Demand (%) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between text-[#9A9A9A] mb-1">
                      <span>Market Demand ({skill.jobCount}/{skill.totalSample} jobs)</span>
                      <span className="text-[#8052ff] font-bold tabular-nums">{skill.demandPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-[#8052ff] rounded-full" style={{ width: `${skill.demandPercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#9A9A9A] mb-1">
                      <span>Student Evidenced Proficiency</span>
                      <span className="text-white font-bold tabular-nums">
                        {skill.studentProficiencyPct === null
                          ? 'null (Unverified)'
                          : `${skill.studentProficiencyPct}% (${skill.verifiedDepth?.toFixed(1)}/5.0)`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                      {skill.studentProficiencyPct !== null && (
                        <div
                          className="h-full bg-[#55C98B] rounded-full"
                          style={{ width: `${skill.studentProficiencyPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Role & Classification Comparison Table */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Multi-Role Demand Frequency &amp; Classification Matrix
            </h3>
            <p className="text-xs text-[#8B8B93]">
              Classifies mentions as Required, Preferred, or Mentioned with provenance tracking
            </p>
          </div>

          {/* Filter by Mention Classification */}
          <div className="flex items-center gap-1.5 bg-[#16161A] p-1 rounded-lg border border-[#202023] text-xs font-mono">
            {(['all', 'Required', 'Preferred', 'Mentioned'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setMentionFilter(f)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  mentionFilter === f ? 'bg-[#8052ff] text-white font-semibold' : 'text-[#9A9A9A] hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Mentions' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-3 px-4">Skill &amp; Provenance</th>
                <th className="py-3 px-4">Classification</th>
                {selectedTracks.includes('backend') && <th className="py-3 px-4 text-right">Backend %</th>}
                {selectedTracks.includes('devops') && <th className="py-3 px-4 text-right">DevOps %</th>}
                {selectedTracks.includes('data') && <th className="py-3 px-4 text-right">Data %</th>}
                <th className="py-3 px-4 text-right">Student Depth</th>
                <th className="py-3 px-4 text-right">Priority Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {filteredTableSkills.map((row) => (
                <tr key={row.id} className="hover:bg-[#16161A]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{row.name}</div>
                    <div className="text-[11px] text-[#8B8B93]">
                      {row.tools} · <span className="text-[#cdbdff]">{row.provenance}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#D6D6DC]">{row.mentionType}</td>
                  {selectedTracks.includes('backend') && (
                    <td className="py-3 px-4 text-right tabular-nums text-[#8052ff] font-bold">
                      {row.roleDemandByTrack?.backend}%
                    </td>
                  )}
                  {selectedTracks.includes('devops') && (
                    <td className="py-3 px-4 text-right tabular-nums text-[#ffba35] font-bold">
                      {row.roleDemandByTrack?.devops}%
                    </td>
                  )}
                  {selectedTracks.includes('data') && (
                    <td className="py-3 px-4 text-right tabular-nums text-[#78d8be] font-bold">
                      {row.roleDemandByTrack?.data}%
                    </td>
                  )}
                  <td className="py-3 px-4 text-right font-bold tabular-nums">
                    {row.verifiedDepth !== null ? (
                      <span className={row.verifiedDepth >= 3.5 ? 'text-[#55C98B]' : 'text-[#ffba35]'}>
                        {row.verifiedDepth.toFixed(1)} / 5.0 ({row.studentProficiencyPct}%)
                      </span>
                    ) : (
                      <span className="text-[#ffba35]">null (Unverified)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums text-white">
                    {row.priorityScore.toFixed(3)} ({row.actionType})
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.isGap ? (
                      <button
                        onClick={() => onNavigate?.('career-plan')}
                        className="px-2.5 py-1 bg-[#8052ff] hover:bg-[#8052ff]/90 text-white rounded text-[11px] transition-colors cursor-pointer"
                      >
                        {row.actionType} Now →
                      </button>
                    ) : (
                      <span className="text-[#55C98B] text-[11px]">Verified ✓</span>
                    )}
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
