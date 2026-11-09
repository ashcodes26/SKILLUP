import React from 'react';
import ParticleBrain from './ParticleBrain';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About Skillup Platform"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0d10] border border-[#27272a] rounded-2xl shadow-2xl p-6 sm:p-8 text-[#e5e1e4] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#9a9a9a] hover:text-white hover:bg-[#18181e] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8052ff] flex items-center justify-center text-white shadow-md shadow-[#8052ff]/30">
            <span className="material-symbols-outlined text-[22px]">terminal</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
                About SKILLUP
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#8052ff]/20 text-[#c9b3fa] border border-[#8052ff]/30 text-[10px] font-mono font-semibold">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-[#9a9a9a] mt-0.5">
              Deterministic Career Readiness &amp; Institutional Placement Platform
            </p>
          </div>
        </div>

        {/* Brain Visual Strip */}
        <div className="w-full h-36 rounded-xl bg-[#070709] border border-[#202028] relative overflow-hidden flex items-center justify-center">
          <div className="w-64 h-36">
            <ParticleBrain compact />
          </div>
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-[#71717a]">
            Interactive Neural Architecture
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-semibold text-[#8052ff] uppercase tracking-wider">
            Platform Mission
          </h3>
          <p className="text-sm text-[#cac7d6] leading-relaxed">
            SKILLUP connects verified student academic evidence directly to real-world corporate recruitment benchmarks. By eliminating self-reported inflation and algorithmic hallucinations, SKILLUP provides institutions and hiring partners with deterministic competency scores grounded strictly in institutional transcripts, lab practicals, and proof-of-work repositories.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#121217] border border-[#202028] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="material-symbols-outlined text-[16px] text-[#2dd4bf]">verified</span>
              <span>Deterministic Readiness</span>
            </div>
            <p className="text-[11px] text-[#8e8c9c] leading-relaxed">
              Unassessed competencies are preserved strictly as <code className="text-[#ffb829] font-mono">null</code>, never defaulted to zero or assumed positive.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121217] border border-[#202028] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="material-symbols-outlined text-[16px] text-[#8052ff]">lock</span>
              <span>FERPA &amp; IEEE P2863 Audited</span>
            </div>
            <p className="text-[11px] text-[#8e8c9c] leading-relaxed">
              Strict role-based access control safeguarding candidate privacy, student audit trails, and institutional placement drives.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121217] border border-[#202028] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="material-symbols-outlined text-[16px] text-[#ffb829]">groups</span>
              <span>Class of 2026/2027 Pipeline</span>
            </div>
            <p className="text-[11px] text-[#8e8c9c] leading-relaxed">
              Active engineering cohorts calibrated across Computer Science, Data Science, and Cloud Engineering benchmarks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121217] border border-[#202028] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="material-symbols-outlined text-[16px] text-[#c9b3fa]">psychology</span>
              <span>Reactive Interview Avatar</span>
            </div>
            <p className="text-[11px] text-[#8e8c9c] leading-relaxed">
              Real-time conversational simulation with dynamic speech synthesis and audio-reactive 3D interviewer feedback.
            </p>
          </div>
        </div>

        {/* Footer Details */}
        <div className="pt-3 border-t border-[#202028] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717a]">
          <span>© 2026 SKILLUP • SRMIST Directorate of Career Centre (CDC)</span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#8052ff] hover:bg-[#925dff] text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
