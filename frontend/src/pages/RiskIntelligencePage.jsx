import React from 'react';
import { 
  TrendingUp, ShieldCheck, AlertOctagon, DollarSign, 
  BarChart2, PieChart as PieIcon, ArrowUpRight, Lock, 
  Sparkles, CheckCircle2, AlertTriangle, FileText 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, Cell, PieChart, Pie 
} from 'recharts';

export default function RiskIntelligencePage({ stats = {}, onOpenDossier }) {
  const financialData = [
    { period: 'Mon', prevented: 2.8, fpCost: 0.02 },
    { period: 'Tue', prevented: 3.4, fpCost: 0.03 },
    { period: 'Wed', prevented: 2.9, fpCost: 0.02 },
    { period: 'Thu', prevented: 4.1, fpCost: 0.04 },
    { period: 'Fri', prevented: 3.8, fpCost: 0.03 },
    { period: 'Sat', prevented: 5.2, fpCost: 0.05 },
    { period: 'Sun (Today)', prevented: 6.4, fpCost: 0.04 }
  ];

  const categoryBreakdown = [
    { category: 'Mule Ring Aggregation', preventedINR: 980000, pct: '50.8%', color: '#A970FF' },
    { category: 'Distributed Card Testing', preventedINR: 420000, pct: '21.8%', color: '#FF4D6D' },
    { category: 'Account Takeover (ATO)', preventedINR: 340000, pct: '17.6%', color: '#F5B82E' },
    { category: 'Geo-Velocity Violations', preventedINR: 190000, pct: '9.8%', color: '#00C2D9' }
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-5 font-mono select-none">
      
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1D2940] pb-4">
        <div>
          <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
            <span>Risk Intelligence & Business Impact</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11192B] text-[#26D69A] border border-[#1D2940] font-mono">
              FINANCIAL ROI METRICS
            </span>
          </h1>
          <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
            Quantifiable fraud loss mitigation vs merchant false-positive cost analysis
          </p>
        </div>

        <button
          onClick={onOpenDossier}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#4C8DFF] hover:bg-blue-600 text-white text-xs font-bold transition shadow-md shadow-[#4C8DFF]/20"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export RBI Impact Audit</span>
        </button>
      </div>

      {/* Hero Financial Impact Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Fraud Loss Avoided */}
        <div className="soc-card soc-card-danger-glow rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold flex items-center justify-between">
            <span>Gross Fraud Loss Avoided</span>
            <span className="text-[#26D69A] font-bold">+18.4%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#E8EDF7] font-mono mt-1 glow-text-red">
            ₹19,30,500
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Prevented across 142 blocked attack transactions
          </div>
        </div>

        {/* 2. False Positive Cost */}
        <div className="soc-card rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold flex items-center justify-between">
            <span>Estimated False Positive Cost</span>
            <span className="text-[#00C2D9] font-bold">0.012% Rate</span>
          </div>
          <div className="text-2xl font-extrabold text-[#F5B82E] font-mono mt-1">
            ₹18,450
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Estimated friction cost from false step-ups
          </div>
        </div>

        {/* 3. Net Protected Value */}
        <div className="soc-card soc-card-cyan-glow rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold flex items-center justify-between">
            <span>Net Protected Value</span>
            <span className="text-[#26D69A] font-bold">104.6x ROI</span>
          </div>
          <div className="text-2xl font-extrabold text-[#26D69A] font-mono mt-1 glow-text-green">
            ₹19,12,050
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Gross Fraud Avoided minus False Positive Cost
          </div>
        </div>

        {/* 4. Conversion Preservation */}
        <div className="soc-card rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold flex items-center justify-between">
            <span>Checkout Conversion</span>
            <span className="text-[#26D69A] font-bold">Optimal</span>
          </div>
          <div className="text-2xl font-extrabold text-[#00C2D9] font-mono mt-1">
            99.2%
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Frictionless 1-click rate on verified benign checkouts
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Weekly Net Benefit Bar Chart (8 cols) */}
        <div className="lg:col-span-8 soc-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#E8EDF7] tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-[#4C8DFF]" />
              7-Day Fraud Prevention vs False Positive Friction (in ₹ Lakhs)
            </span>
            <span className="text-[10px] text-[#7F8AA0]">Source: Tier-1 & Tier-2 Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2940" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#7F8AA0', fontSize: 10 }} stroke="#1D2940" />
                <YAxis tick={{ fill: '#7F8AA0', fontSize: 10 }} stroke="#1D2940" unit="L" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1322', borderColor: '#1D2940', borderRadius: '8px', fontSize: '11px' }} 
                  formatter={(val) => `₹${val} Lakhs`}
                />
                <Bar dataKey="prevented" name="Fraud Prevented" fill="#26D69A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fpCost" name="FP Friction Cost" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Category Breakdown (4 cols) */}
        <div className="lg:col-span-4 soc-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#E8EDF7] tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-[#A970FF]" />
              Threat Vector Breakdown
            </span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="bg-[#060911] p-3 rounded-xl border border-[#1D2940] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#E8EDF7] font-semibold">{item.category}</span>
                  <span className="text-[#00C2D9] font-bold">{item.pct}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#7F8AA0]">
                  <span>Prevented Volume:</span>
                  <span className="text-[#E8EDF7] font-bold">₹{item.preventedINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1322] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: item.pct, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Explanatory Context for Merchants */}
      <div className="soc-card rounded-xl p-4 space-y-2 text-xs font-sans">
        <h3 className="font-bold text-[#E8EDF7] flex items-center gap-1.5 font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-[#26D69A]" />
          Why False Positive Control is Critical in Payment Risk Management
        </h3>
        <p className="text-[#A5AEC0] leading-relaxed">
          Traditional rules engines frequently block legitimate customers during velocity spikes, causing up to <strong>3–5%</strong> cart abandonment and permanent customer churn. RazorShield AI's <strong>Dual-Tier Architecture</strong> maintains a sub-0.02% false positive rate by escalating ambiguous edge-cases to Tier-2 deep graph analysis and step-up 3DS auth rather than enforcing premature hard blocks.
        </p>
      </div>

    </div>
  );
}
