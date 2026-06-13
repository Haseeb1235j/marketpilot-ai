import React from 'react';
import { ShieldAlert } from 'lucide-react';

const GlobalDisclaimer = ({ className = '' }) => {
  return (
    <div
      className={`w-full bg-red-950/60 border-b border-amber-800/30 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5">
        <ShieldAlert
          className="shrink-0 text-amber-400/80"
          size={11}
          strokeWidth={2.2}
        />
        {/* Mobile: truncated */}
        <p className="block sm:hidden text-amber-300/80 font-medium text-[11px] truncate max-w-[280px]">
          Educational tool only — not financial advice or buy/sell signals.
        </p>
        {/* Desktop: full text */}
        <p className="hidden sm:block text-amber-300/80 font-medium text-[11px] text-center leading-none">
          MarketPilot AI is an educational chart analysis tool. It does not provide financial advice, buy/sell signals, guaranteed predictions, or profit recommendations. All content is for educational chart study only.
        </p>
      </div>
    </div>
  );
};

export default GlobalDisclaimer;
