import React, { useState } from 'react';
import { initialSkillDemand } from '../../data/mockData';

interface SkillDemandScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function SkillDemandScreen({ onNavigate, onShowToast }: SkillDemandScreenProps) {
  const [targetTrack, setTargetTrack] = useState<'backend' | 'devops' | 'data'>('backend');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // SVG Radar Polygon calculations for 6 axes: Python, PostgreSQL, Docker, Redis, Kafka, Git
  // Radii for max level 5: 0 to 100px from center (150, 150)
  const cx = 150;
  const cy = 150;
  const maxR = 110;

  const radarAxes = [
    { name: 'Python', angle: 0, target: 4.5, current: 4.2 },
    { name: 'PostgreSQL', angle: 60, target: 4.0, current: 3.8 },
    { name: 'Docker', angle: 120, target: 4.0, current: 1.0 }, // current unassessed / 0
    { name: 'Redis', angle: 180, target: 3.5, current: 3.2 },
    { name: 'Kafka', angle: 240, target: 3.5, current: 2.8 },
    { name: 'Git & CI', angle: 300, target: 4.0, current: 4.0 },
  ];

  const getCoordinates = (angleDeg: number, val: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const r = (val / 5.0) * maxR;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const targetPolygon = radarAxes
    .map(axis => {
      const { x, y } = getCoordinates(axis.angle, axis.target);
      return `${x},${y}`;
    })
    .join(' ');

  const currentPolygon = radarAxes
    .map(axis => {
      const { x, y } = getCoordinates(axis.angle, axis.current);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30">
              LABOR MARKET TELEMETRY
            </span>
            <span className="text-xs text-[#8B8B93] font-mono">Q3-Q4 Placement Aggregate</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Skill Demand & Penetration Index</h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Real-time market requirement frequency synthesized across 1,420 regional systems engineering postings.
          </p>
        </div>

        {/* Track switcher */}
        <div className="flex items-center gap-2 bg-[#16161A] p-1.5 rounded-lg border border-[#202023]">
          <button
            onClick={() => setTargetTrack('backend')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              targetTrack === 'backend'
                ? 'bg-[#8052ff] text-white font-semibold'
                : 'text-[#8B8B93] hover:text-white'
            }`}
          >
            Backend Systems
          </button>
          <button
            onClick={() => setTargetTrack('devops')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              targetTrack === 'devops'
                ? 'bg-[#8052ff] text-white font-semibold'
                : 'text-[#8B8B93] hover:text-white'
            }`}
          >
            Cloud / DevOps
          </button>
          <button
            onClick={() => setTargetTrack('data')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              targetTrack === 'data'
                ? 'bg-[#8052ff] text-white font-semibold'
                : 'text-[#8B8B93] hover:text-white'
            }`}
          >
            Data Platform
          </button>
        </div>
      </div>

      {/* Grid: Radar Visualization + High Demand Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Radar Chart */}
        <div className="lg:col-span-5 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-[#202023]">
            <h2 className="text-sm font-semibold text-white">Competency Radar Spectrum</h2>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-[#8052ff]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#8052ff]"></span>
                <span>Market Baseline</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#55C98B]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#55C98B]"></span>
                <span>Alex R. Mercer</span>
              </div>
            </div>
          </div>

          {/* SVG Radar */}
          <div className="py-4 relative flex items-center justify-center">
            <svg width="300" height="300" className="overflow-visible">
              {/* Concentric grid circles */}
              {[1, 2, 3, 4, 5].map((lvl) => {
                const r = (lvl / 5.0) * maxR;
                return (
                  <circle
                    key={lvl}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#202023"
                    strokeDasharray={lvl === 5 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis rays */}
              {radarAxes.map((axis, idx) => {
                const { x, y } = getCoordinates(axis.angle, 5);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke="#202023"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Target Polygon (Market Baseline) */}
              <polygon
                points={targetPolygon}
                fill="#8052ff"
                fillOpacity="0.15"
                stroke="#8052ff"
                strokeWidth="2"
              />

              {/* Candidate Current Polygon */}
              <polygon
                points={currentPolygon}
                fill="#55C98B"
                fillOpacity="0.25"
                stroke="#55C98B"
                strokeWidth="2"
              />

              {/* Axis Labels */}
              {radarAxes.map((axis, idx) => {
                const { x, y } = getCoordinates(axis.angle, 5.7);
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
                    {axis.name}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Radar takeaway note */}
          <div className="w-full bg-[#16161A] p-3 rounded border border-[#202023] text-xs text-[#8B8B93] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#ffba35]">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Docker axis deficit (-3.0 pts)
            </span>
            <button
              onClick={() => onNavigate?.('placement-hub')}
              className="text-[#8052ff] hover:underline font-mono text-[11px]"
            >
              Take Quiz →
            </button>
          </div>
        </div>

        {/* Right: Key Frequency Insights */}
        <div className="lg:col-span-7 bg-[#0D0D0F] border border-[#202023] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
            <h2 className="text-sm font-semibold text-white">Market Penetration Frequencies</h2>
            <span className="text-xs text-[#8B8B93] font-mono">1,420 Active Roles Surveyed</span>
          </div>

          <div className="space-y-3">
            {initialSkillDemand.slice(0, 4).map((skill) => (
              <div
                key={skill.id}
                className="p-3 bg-[#16161A] border border-[#202023] rounded-lg hover:border-[#363639] transition-all"
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="font-bold text-white">{skill.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8B8B93]">{skill.jobCount} / {skill.totalSample} postings</span>
                    <span className="font-bold text-[#8052ff]">{skill.penetrationPct}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#000000] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8052ff] to-[#55C98B] rounded-full"
                    style={{ width: `${skill.penetrationPct}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-[#8B8B93]">
                  <span>Candidate: <strong className="text-white font-mono">{skill.verifiedLabel}</strong></span>
                  <span className="font-mono text-[10px] text-[#D6D6DC]">{skill.tools}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#8052ff]/10 border border-[#8052ff]/30 rounded text-xs text-[#D6D6DC] flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Insight:</span> Dual proficiency in Python + PostgreSQL satisfies 84% of campus recruiting criteria.
            </div>
            <button
              onClick={() => onNavigate?.('career-plan')}
              className="text-[#8052ff] hover:underline font-mono text-xs font-bold"
            >
              View Plan →
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Tabular Fractions Table */}
      <div className="bg-[#0D0D0F] border border-[#202023] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#202023] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Comprehensive Competency Penetration & Depth Table</h3>
            <p className="text-xs text-[#8B8B93]">Exact rubric scoring with IEEE P2863 unassessed distinction</p>
          </div>
          <span className="text-xs font-mono text-[#8B8B93]">Active Filter: {targetTrack.toUpperCase()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#16161A] text-[#8B8B93] text-[11px] border-b border-[#202023]">
              <tr>
                <th className="py-3 px-4">Skill & Focus Area</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Industry Penetration</th>
                <th className="py-3 px-4 text-center">Required Target Depth</th>
                <th className="py-3 px-4 text-center">Verified Candidate Depth</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202023]">
              {initialSkillDemand.map((row) => (
                <tr key={row.id} className="hover:bg-[#16161A]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{row.name}</div>
                    <div className="text-[10px] text-[#8B8B93]">{row.tools}</div>
                  </td>
                  <td className="py-3 px-4 text-[#8B8B93]">{row.category}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-[#8052ff]">{row.penetrationPct}%</span>
                    <span className="text-[10px] text-[#8B8B93] block">({row.jobCount}/{row.totalSample})</span>
                  </td>
                  <td className="py-3 px-4 text-center text-[#D6D6DC]">
                    {row.targetDepth}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {row.verifiedDepth !== null ? (
                      <span className={row.verifiedDepth >= 3.5 ? 'text-[#55C98B]' : 'text-[#ffba35]'}>
                        {row.verifiedDepth.toFixed(1)} / 5.0
                      </span>
                    ) : (
                      <span className="text-[#ffba35] italic">NULL (Unassessed)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {row.isGap ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#ffba35]/10 text-[#ffba35] border border-[#ffba35]/30">
                          Critical Deficit
                        </span>
                        <button
                          onClick={() => onNavigate?.('placement-hub')}
                          className="px-2 py-0.5 bg-[#8052ff] hover:bg-[#8052ff]/90 text-white rounded text-[10px] transition-colors"
                        >
                          Take Lab Quiz
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#55C98B]/10 text-[#55C98B] border border-[#55C98B]/30 inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                        {row.verifiedLabel}
                      </span>
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
