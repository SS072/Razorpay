import React from 'react';
import { Lock, SlidersHorizontal, ShieldAlert, Cpu } from 'lucide-react';

const RULES = [
  { id: 'MULE-002', name: 'Mule Syndicate Quarantine', count: 182, max: 200, color: 'from-[#FF4D6D] to-rose-600', rank: '01' },
  { id: 'VELOCITY-007', name: 'Card Sweep Burst Velocity', count: 129, max: 200, color: 'from-[#F5B82E] to-amber-600', rank: '02' },
  { id: 'GEO-014', name: 'Impossible Geo-Velocity Hop', count: 87, max: 200, color: 'from-[#00C2D9] to-cyan-600', rank: '03' },
  { id: 'DEVICE-021', name: 'Device Multi-Accounting Farm', count: 54, max: 200, color: 'from-[#4C8DFF] to-blue-600', rank: '04' }
];

export default function TopRules() {
  return (
    <div className="soc-card rounded-xl p-4 shadow-md select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase font-bold text-[#E8EDF7] tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#A970FF]" />
          Top Gating Firewall Rules
        </span>
        <span className="text-[10px] font-mono text-[#7F8AA0] px-1.5 py-0.2 rounded bg-[#060911] border border-[#1D2940]">Live Hits</span>
      </div>

      {/* Rules List */}
      <div className="space-y-2.5 font-mono text-xs">
        {RULES.map((r) => {
          const pct = Math.round((r.count / r.max) * 100);
          return (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-bold text-[#7F8AA0] px-1 rounded bg-[#060911] border border-[#1D2940]">
                    {r.rank}
                  </span>
                  <span className="text-[#E8EDF7] font-semibold" title={r.name}>
                    {r.id} <span className="text-[#7F8AA0] text-[10px] font-sans font-normal">({r.name.split(' ')[0]})</span>
                  </span>
                </div>
                <span className="font-bold text-[#E8EDF7]">{r.count}</span>
              </div>
              <div className="w-full h-1.5 bg-[#060911] rounded-full overflow-hidden border border-[#1D2940]">
                <div 
                  className={`h-full bg-gradient-to-r ${r.color} rounded-full transition-all duration-300 shadow-sm`} 
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
