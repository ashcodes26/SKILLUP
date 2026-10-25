import React from 'react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowToast }) => {
  return (
    <footer className="w-full bg-[#0D0D0F] border-t border-[#202023] py-6 mt-auto">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs text-[#9A9A9A]">
          <div className="flex items-center gap-1.5 text-[#55C98B]">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-medium">FERPA &amp; Institutional Compliance Validated</span>
          </div>
          <span className="text-[#363639] hidden sm:inline">·</span>
          <span className="hidden sm:inline">Deterministic Provenance &amp; Scoped RBAC Active</span>
          <span className="text-[#363639] hidden sm:inline">·</span>
          <span className="hidden md:inline">Readiness is an informational indicator, not a placement guarantee</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#9A9A9A]">
          <button
            onClick={() => {
              if (onShowToast) {
                onShowToast('Immutable institutional audit ledger verified (SHA-256). 148 authorized records active.', 'info');
              } else {
                onNavigate?.('admin-reports');
              }
            }}
            className="text-[#9A9A9A] hover:text-white transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">history</span>
            <span>Audit Logs</span>
          </button>
          <span className="text-[#363639]">·</span>
          <button
            onClick={() => {
              onShowToast?.('Navigating to FERPA Scoped Data Export & Reports ledger.', 'info');
              onNavigate?.('admin-reports');
            }}
            className="text-[#9A9A9A] hover:text-white transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>Export Scoped Data</span>
          </button>
          <span className="text-[#363639]">·</span>
          <span className="text-[#606066] whitespace-nowrap shrink-0">© 2026 Skillup · AIMORA Engine</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

