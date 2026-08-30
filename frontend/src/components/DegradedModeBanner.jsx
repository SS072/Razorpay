import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function DegradedModeBanner({ isDegraded, onToggle, onDismiss }) {
  if (!isDegraded) return null;

  return (
    <div className="bg-[#F5B82E]/10 border-b border-[#F5B82E]/30 px-4 py-2 flex items-center justify-between text-xs font-mono select-none">
      <div className="flex items-center space-x-2.5">
        <span className="w-2 h-2 rounded-full bg-[#F5B82E] animate-ping-subtle"></span>
        <span className="font-bold text-[#F5B82E] uppercase tracking-wider">
          FAIL-SAFE MODE ACTIVE:
        </span>
        <span className="text-[#E8EDF7]">
          Tier-2 Deep Analysis latency threshold exceeded. Automatically falling back to Tier-1 deterministic sliding-window rules.
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onToggle}
          className="px-2 py-0.5 rounded bg-[#11192B] hover:bg-[#1D2940] text-[#00C2D9] border border-[#1D2940] text-[10px] font-semibold transition"
        >
          RESTORE FULL DUAL-TIER
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="text-[#7F8AA0] hover:text-[#E8EDF7]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
