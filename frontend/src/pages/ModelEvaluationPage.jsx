import React from 'react';
import { 
  Cpu, CheckCircle2, AlertTriangle, ArrowUpRight, 
  BarChart2, FileText, Database, ShieldAlert, Sparkles, Activity 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ModelEvaluationPage() {
  const rocCurveData = [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.001, tpr: 0.45 },
    { fpr: 0.005, tpr: 0.78 },
    { fpr: 0.01, tpr: 0.88 },
    { fpr: 0.02, tpr: 0.94 },
    { fpr: 0.05, tpr: 0.98 },
    { fpr: 0.10, tpr: 0.99 },
    { fpr: 0.20, tpr: 0.995 },
    { fpr: 1.0, tpr: 1.0 }
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-5 font-mono select-none">
      
      {/* Title & Benchmark Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1D2940] pb-4">
        <div>
          <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
            <span>Model Evaluation & Benchmark Suite</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11192B] text-[#4C8DFF] border border-[#1D2940] font-mono">
              RiskNet v2.1
            </span>
          </h1>
          <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
            Standardized offline test corpus evaluation (50,000 synthetic transaction test set)
          </p>
        </div>

        <div className="text-[11px] text-[#00C2D9] px-3 py-1 rounded-lg bg-[#060911] border border-[#1D2940] font-mono flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>Test Set: 50,000 samples · 4.2% Fraud Prevalence</span>
        </div>
      </div>

      {/* Primary ML Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="soc-card rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold">PRECISION</div>
          <div className="text-2xl font-extrabold text-[#26D69A] font-mono mt-1 glow-text-green">
            94.8%
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Minimizes merchant false-positives
          </div>
        </div>

        <div className="soc-card rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold">RECALL / SENSITIVITY</div>
          <div className="text-2xl font-extrabold text-[#00C2D9] font-mono mt-1 glow-text-cyan">
            91.2%
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Detects 91.2% of sophisticated attacks
          </div>
        </div>

        <div className="soc-card rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold">F1 HARMONIC SCORE</div>
          <div className="text-2xl font-extrabold text-[#4C8DFF] font-mono mt-1">
            93.0%
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            Balanced classification effectiveness
          </div>
        </div>

        <div className="soc-card rounded-xl p-4">
          <div className="text-[10px] text-[#7F8AA0] uppercase font-bold">ROC - AUC</div>
          <div className="text-2xl font-extrabold text-[#A970FF] font-mono mt-1">
            0.984
          </div>
          <div className="text-[10px] text-[#7F8AA0] mt-1">
            High discrimination capacity
          </div>
        </div>

      </div>

      {/* 2x2 Confusion Matrix & ROC Curve Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Confusion Matrix (6 cols) */}
        <div className="lg:col-span-6 soc-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#E8EDF7] tracking-wider">
              2×2 Binary Classification Matrix
            </span>
            <span className="text-[10px] text-[#7F8AA0]">50,000 Evaluations</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            
            {/* True Negative */}
            <div className="bg-[#060911] p-3.5 rounded-xl border border-[#26D69A]/30 space-y-1">
              <div className="text-[10px] text-[#26D69A] font-bold uppercase">TRUE NEGATIVE (Legit &rarr; Allow)</div>
              <div className="text-xl font-bold text-[#E8EDF7]">47,820 <span className="text-xs text-[#7F8AA0] font-normal">(99.8%)</span></div>
              <div className="text-[10px] text-[#7F8AA0]">Zero checkout friction applied</div>
            </div>

            {/* False Positive */}
            <div className="bg-[#060911] p-3.5 rounded-xl border border-[#F5B82E]/30 space-y-1">
              <div className="text-[10px] text-[#F5B82E] font-bold uppercase">FALSE POSITIVE (Legit &rarr; Block)</div>
              <div className="text-xl font-bold text-[#F5B82E]">80 <span className="text-xs text-[#7F8AA0] font-normal">(0.2%)</span></div>
              <div className="text-[10px] text-[#7F8AA0]">Estimated cost: ₹18,450</div>
            </div>

            {/* False Negative */}
            <div className="bg-[#060911] p-3.5 rounded-xl border border-[#FF4D6D]/30 space-y-1">
              <div className="text-[10px] text-[#FF4D6D] font-bold uppercase">FALSE NEGATIVE (Fraud &rarr; Allow)</div>
              <div className="text-xl font-bold text-[#FF4D6D]">185 <span className="text-xs text-[#7F8AA0] font-normal">(8.8%)</span></div>
              <div className="text-[10px] text-[#7F8AA0]">Estimated loss: ₹42,100</div>
            </div>

            {/* True Positive */}
            <div className="bg-[#060911] p-3.5 rounded-xl border border-[#26D69A]/40 space-y-1">
              <div className="text-[10px] text-[#26D69A] font-bold uppercase">TRUE POSITIVE (Fraud &rarr; Block)</div>
              <div className="text-xl font-bold text-[#26D69A]">1,915 <span className="text-xs text-[#7F8AA0] font-normal">(91.2%)</span></div>
              <div className="text-[10px] text-[#7F8AA0]">Prevented loss: ₹19.30 Lakhs</div>
            </div>

          </div>
        </div>

        {/* ROC Curve Area (6 cols) */}
        <div className="lg:col-span-6 soc-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#E8EDF7] tracking-wider">
              ROC Discrimination Curve (AUC = 0.984)
            </span>
            <span className="text-[10px] text-[#26D69A] font-bold">Optimal Operating Point</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rocCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rocGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4C8DFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4C8DFF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2940" />
                <XAxis dataKey="fpr" tick={{ fill: '#7F8AA0', fontSize: 9 }} stroke="#1D2940" />
                <YAxis dataKey="tpr" tick={{ fill: '#7F8AA0', fontSize: 9 }} stroke="#1D2940" domain={[0, 1]} />
                <Tooltip contentStyle={{ backgroundColor: '#0D1322', borderColor: '#1D2940', fontSize: '10px' }} />
                <Area type="monotone" dataKey="tpr" stroke="#4C8DFF" strokeWidth={2} fill="url(#rocGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Comparison: Baseline Static Rules vs RazorShield AI */}
      <div className="soc-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-[#E8EDF7] tracking-wider">
            Baseline Static Rule-Set vs RazorShield Dual-Tier AI
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#11192B] border-b border-[#1D2940] text-[10px] text-[#7F8AA0] uppercase">
              <tr>
                <th className="py-2.5 px-3">EVALUATION METRIC</th>
                <th className="py-2.5 px-3">LEGACY STATIC RULES</th>
                <th className="py-2.5 px-3 text-[#4C8DFF]">RAZORSHIELD DUAL-TIER</th>
                <th className="py-2.5 px-3 text-right">DELTA IMPROVEMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2940]/50">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#E8EDF7]">Precision</td>
                <td className="py-2.5 px-3 text-[#7F8AA0]">68.4%</td>
                <td className="py-2.5 px-3 text-[#26D69A] font-bold">94.8%</td>
                <td className="py-2.5 px-3 text-right text-[#26D69A] font-bold">+26.4%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#E8EDF7]">Recall (Fraud Caught)</td>
                <td className="py-2.5 px-3 text-[#7F8AA0]">62.1%</td>
                <td className="py-2.5 px-3 text-[#00C2D9] font-bold">91.2%</td>
                <td className="py-2.5 px-3 text-right text-[#00C2D9] font-bold">+29.1%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#E8EDF7]">False Positive Rate</td>
                <td className="py-2.5 px-3 text-[#FF4D6D]">2.80%</td>
                <td className="py-2.5 px-3 text-[#26D69A] font-bold">0.16%</td>
                <td className="py-2.5 px-3 text-right text-[#26D69A] font-bold">-94.2% drop</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#E8EDF7]">Synchronous Latency P99</td>
                <td className="py-2.5 px-3 text-[#7F8AA0]">18.0 ms</td>
                <td className="py-2.5 px-3 text-[#26D69A] font-bold">14.2 ms (Fast Path)</td>
                <td className="py-2.5 px-3 text-right text-[#26D69A] font-bold">-21.1% faster</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
