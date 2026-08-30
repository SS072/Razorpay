import React from 'react';
import { 
  TrendingUp, TrendingDown, ShieldAlert, Zap, 
  Activity, ArrowUpRight, ShieldCheck, Flame, Lock 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function KpiCard({ stats = {} }) {
  // Sparkline data for Fraud Prevented
  const sparklineData = [
    { v: 12.4 }, { v: 14.1 }, { v: 13.8 }, { v: 16.2 }, 
    { v: 15.9 }, { v: 17.5 }, { v: 18.2 }, { v: 19.3 }
  ];

  const totalPreventedInLakhs = stats.total_blocked_inr 
    ? (stats.total_blocked_inr / 100000).toFixed(2) 
    : '19.30';

  const totalEvaluated = (stats.total_evaluated || 24891).toLocaleString('en-IN');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 bg-[#060911] border-b border-[#1D2940]">
      
      {/* 1. HERO METRIC: Fraud Prevented */}
      <div className="soc-card soc-card-danger-glow rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-[#FF4D6D]/40 transition-all duration-300">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FF4D6D]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F8AA0] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] shadow-sm shadow-[#FF4D6D]"></span>
            Fraud Prevented
          </span>
          <span className="text-[11px] font-mono text-[#26D69A] flex items-center font-bold px-1.5 py-0.2 rounded bg-[#26D69A]/10 border border-[#26D69A]/20">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            +18.4% <span className="text-[#7F8AA0] ml-1 text-[9px] font-normal">today</span>
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-2.5 relative z-10">
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-[#E8EDF7] font-mono tracking-tight glow-text-red">
              ₹{totalPreventedInLakhs}<span className="text-base text-[#7F8AA0] font-normal ml-0.5">L</span>
            </div>
            <div className="text-[10px] font-mono text-[#7F8AA0] mt-0.5 flex items-center gap-1">
              <span className="text-[#FF4D6D] font-bold">142</span>
              <span>syndicate attacks gated</span>
            </div>
          </div>

          {/* Luminous Sparkline */}
          <div className="w-24 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke="#FF4D6D" 
                  strokeWidth={2} 
                  fillOpacity={1}
                  fill="url(#heroSpark)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Transactions Throughput */}
      <div className="soc-card soc-card-cyan-glow rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-[#00C2D9]/40 transition-all duration-300">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#00C2D9]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F8AA0] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2D9] shadow-sm shadow-[#00C2D9]"></span>
            Transactions
          </span>
          <span className="text-[11px] font-mono text-[#00C2D9] font-bold px-1.5 py-0.2 rounded bg-[#00C2D9]/10 border border-[#00C2D9]/20">
            +184/min
          </span>
        </div>

        <div className="mt-2.5 relative z-10">
          <div className="text-2xl lg:text-3xl font-extrabold text-[#E8EDF7] font-mono tracking-tight">
            {totalEvaluated}
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7F8AA0] mt-1">
            <span className="text-[#26D69A] font-semibold">✓ 94.2% Allow</span>
            <span className="text-[#1D2940]">·</span>
            <span className="text-[#F5B82E] font-semibold">! 3.6% 3DS</span>
            <span className="text-[#1D2940]">·</span>
            <span className="text-[#FF4D6D] font-semibold">✕ 2.2% Block</span>
          </div>
        </div>
      </div>

      {/* 3. Active Threats */}
      <div className="soc-card rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-[#FF4D6D]/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F8AA0] font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF4D6D]" />
            Active Threats
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#FF4D6D]/15 text-[#FF4D6D] text-[10px] font-bold font-mono border border-[#FF4D6D]/30 animate-pulse">
            3 CRITICAL
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-2xl lg:text-3xl font-extrabold text-[#FF4D6D] font-mono tracking-tight flex items-baseline space-x-2">
            <span>17</span>
            <span className="text-xs font-mono text-[#7F8AA0] font-normal">entities under active watch</span>
          </div>
          <div className="text-[10px] font-mono text-[#7F8AA0] mt-1 flex items-center space-x-1.5">
            <span>2 mule rings</span>
            <span className="text-[#1D2940]">·</span>
            <span>1 card botnet</span>
            <span className="text-[#1D2940]">·</span>
            <span>1 ATO</span>
          </div>
        </div>
      </div>

      {/* 4. Fast-Path P99 Latency */}
      <div className="soc-card soc-card-glow rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-[#4C8DFF]/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F8AA0] font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F5B82E]" />
            Fast-Path P99
          </span>
          <span className="text-[11px] font-mono text-[#26D69A] font-bold flex items-center px-1.5 py-0.2 rounded bg-[#26D69A]/10 border border-[#26D69A]/20">
            <TrendingDown className="w-3 h-3 mr-0.5" />
            -8.4% <span className="text-[#7F8AA0] ml-1 text-[9px] font-normal">vs 1h</span>
          </span>
        </div>

        <div className="mt-2.5">
          <div className="text-2xl lg:text-3xl font-extrabold text-[#E8EDF7] font-mono tracking-tight flex items-baseline space-x-1.5">
            <span>{stats.sub_30ms_latency_ms || 14.2}</span>
            <span className="text-sm font-normal text-[#7F8AA0]">ms</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#26D69A]/15 text-[#26D69A] font-mono ml-2 border border-[#26D69A]/30 font-bold">
              SLA &lt;30ms
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#7F8AA0] mt-1">
            Zero checkout friction · In-memory sliding window
          </div>
        </div>
      </div>

    </div>
  );
}
