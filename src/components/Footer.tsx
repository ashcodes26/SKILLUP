import React from 'react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0D0D0F] border-t border-[#202023] py-6 mt-auto">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs text-[#9A9A9A]">
          <div className="flex items-center gap-1.5 text-[#55C98B]">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-medium">FERPA &amp; Institutional Compliance Validated</span>
          </div>
          <span className="text-[#363639] hidden sm:inline">•</span>
          <span className="hidden sm:inline">Deterministic Provenance &amp; Scoped RBAC Active</span>
          <span className="text-[#363639] hidden sm:inline">•</span>
          <span className="hidden md:inline">AI Assistance Non-Evaluative Advisory</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#9A9A9A]">
          <button
            onClick={() => alert('Viewing immutable institutional audit ledger (SHA-256 enabled). 148 authorized records active in CSE scope.')}
            className="text-[#9A9A9A] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">history</span>
            <span>Audit Logs</span>
          </button>
          <span className="text-[#363639]">•</span>
          <button
            onClick={() => alert('Exporting scoped cohort dataset (CSV format with RFC-3161 audit block).')}
            className="text-[#9A9A9A] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>Export Scoped Data</span>
          </button>
          <span className="text-[#363639]">•</span>
          <span className="text-[#606066]">© 2026 Skillup Systems Inc.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
