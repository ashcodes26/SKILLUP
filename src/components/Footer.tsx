import React from 'react';

interface FooterProps {
  onNavigate?: (path: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowToast }) => {
  return (
    <footer className="w-full bg-[#09090b] border-t border-[#27272a] py-4 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Skillup</span>
          <span>·</span>
          <span>SRMIST Directorate of Career Centre (CDC)</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#71717A]">
          <button
            onClick={() => {
              onShowToast?.('Immutable institutional audit ledger verified (SHA-256).', 'info');
              onNavigate?.('admin-reports');
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Audit Logs
          </button>
          <span>·</span>
          <button
            onClick={() => {
              onShowToast?.('Navigating to Scoped Data Export & Reports.', 'info');
              onNavigate?.('admin-reports');
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Export Scoped Data
          </button>
          <span>·</span>
          <span className="text-[#52525B]">© 2026 Skillup · SRMIST CDC</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
