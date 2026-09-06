import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Beaker } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';

export const PlaygroundLayout = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isIndex = location.pathname === '/playground';

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back to portfolio */}
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white/80 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{t.playground.layout.backToPortfolio}</span>
            </Link>

            <div className="w-[1px] h-4 bg-white/10" />

            {/* Playground brand */}
            <Link
              to="/playground"
              className="flex items-center gap-2 text-sm font-mono text-white/80 hover:text-white transition-colors"
            >
              <Beaker size={16} strokeWidth={1.5} />
              <span className="font-semibold tracking-tight">{t.playground.layout.brand}</span>
            </Link>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              {t.playground.layout.status}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`pt-14 ${isIndex ? '' : 'h-screen'}`}>
        <Outlet />
      </main>
    </div>
  );
};
