import React from 'react';
import { ShieldAlert, BarChart3, Activity } from 'lucide-react';

const ACTIVITIES = [
  { name: 'Card Testing Sweep', count: 42, max: 50, color: 'from-[#FF4D6D] to-rose-600', text: 'text-[#FF4D6D]' },
  { name: 'Mule Syndicate Ring', count: 28, max: 50, color: 'from-[#A970FF] to-purple-600', text: 'text-[#A970FF]' },
  { name: 'Account Takeover', count: 19, max: 50, color: 'from-[#F5B82E] to-amber-600', text: 'text-[#F5B82E]' },
  { name: 'Geo-Hop Anomaly', count: 11, max: 50, color: 'from-[#00C2D9] to-cyan-600', text: 'text-[#00C2D9]' }
];

export default function AttackActivity() {
  return (
    <div className="soc-card rounded-xl p-4 shadow-md select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase font-bold text-[#E8EDF7] tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#FF4D6D]" />
          Attack Vector Activity
        </span>
        <span className="text-[10px] font-mono text-[#7F8AA0] px-1.5 py-0.2 rounded bg-[#060911] border border-[#1D2940]">100 Sampled</span>
      </div>

      {/* Bar List */}
      <div className="space-y-2.5 font-mono text-xs">
        {ACTIVITIES.map((act) => {
          const pct = Math.round((act.count / act.max) * 100);
          return (
            <div key={act.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#E8EDF7] font-medium">{act.name}</span>
                <span className={`font-bold ${act.text}`}>{act.count}</span>
              </div>
              <div className="w-full h-1.5 bg-[#060911] rounded-full overflow-hidden border border-[#1D2940]">
                <div 
                  className={`h-full bg-gradient-to-r ${act.color} rounded-full transition-all duration-300 shadow-sm`} 
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
