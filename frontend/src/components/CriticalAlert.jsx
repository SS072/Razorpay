import React, { useState } from 'react';
import { AlertOctagon, ArrowRight, X, ShieldAlert, Sparkles, Flame } from 'lucide-react';

export default function CriticalAlert({ onInvestigate, onDismiss }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="mx-4 mt-3 bg-gradient-to-r from-[#FF4D6D]/15 via-[#FF4D6D]/5 to-transparent border border-[#FF4D6D]/40 rounded-xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg shadow-[#FF4D6D]/5 select-none relative overflow-hidden">
      
      {/* Red Accent Beam */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4D6D]"></div>

      {/* Left Icon & Message */}
      <div className="flex items-center space-x-3 pl-1">
        <div className="w-6 h-6 rounded-lg bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 flex items-center justify-center text-[#FF4D6D] shadow-sm animate-pulse">
          <Flame className="w-3.5 h-3.5" />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-[#FF4D6D] uppercase tracking-wider font-mono text-[11px]">
            CRITICAL ATTACK DETECTED
          </span>
          <span className="text-[#E8EDF7] text-[11px]">
            Mule syndicate activity surged <strong className="text-[#FF4D6D] font-mono font-bold">+340%</strong> in Mumbai · 
            <span className="text-[#7F8AA0] font-mono ml-1">17 transactions blocked · RULE-FW-MULE-002</span>
          </span>
        </div>
      </div>

      {/* Right CTAs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onInvestigate}
          className="px-3.5 py-1 bg-gradient-to-r from-[#FF4D6D] to-rose-600 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg font-bold font-mono text-[11px] flex items-center space-x-1.5 transition shadow-md shadow-[#FF4D6D]/20 active:scale-98"
        >
          <Sparkles className="w-3 h-3 text-rose-200" />
          <span>INVESTIGATE SYNDICATE</span>
        </button>

        <button
          onClick={() => {
            setVisible(false);
            if (onDismiss) onDismiss();
          }}
          className="p-1 text-[#7F8AA0] hover:text-[#E8EDF7] rounded-lg hover:bg-[#11192B] transition"
          title="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
