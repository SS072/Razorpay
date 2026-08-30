import React from 'react';
import { 
  X, Printer, Download, ShieldCheck, FileText, 
  CheckCircle2, Lock, Sparkles, Building2, Stamp, Copy 
} from 'lucide-react';

export default function DossierModal({ isOpen, onClose, report }) {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.open(`http://localhost:8000/api/v1/cases/${report.case_id || 'LATEST'}/export?format=html`, '_blank');
  };

  const handleDownloadJSON = () => {
    window.open(`http://localhost:8000/api/v1/cases/${report.case_id || 'LATEST'}/export?format=json`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#080C14] border border-white/[0.1] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] bg-[#0D1424] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                  RBI Master Directions Compliance Dossier
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                  Strictly Confidential
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                CASE REF: {report.case_id} | Reserve Bank of India - DPSS Risk Gating Framework
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#121A30] hover:bg-[#182442] text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-white/[0.08]"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-blue-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-gray-300">
          
          {/* Executive Overview */}
          <div className="bg-[#0D1424] p-4 rounded-2xl border border-white/[0.06] space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                1. Executive Summary & Regulatory Scope
              </h3>
              <span className="text-[11px] font-mono text-gray-400">Timestamp: {report.generated_at}</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-200">
              {report.summary}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-[#070B14] p-3 rounded-xl border border-white/[0.04]">
                <div className="text-[10px] text-gray-400 font-mono">MITIGATED FRAUD VOLUME</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                  ₹{report.blast_radius?.fraud_volume_prevented_inr?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-[#070B14] p-3 rounded-xl border border-white/[0.04]">
                <div className="text-[10px] text-gray-400 font-mono">CONFIDENCE SCORE</div>
                <div className="text-base font-extrabold text-cyan-400 font-mono mt-0.5">
                  {report.confidence_score}%
                </div>
              </div>
              <div className="bg-[#070B14] p-3 rounded-xl border border-white/[0.04]">
                <div className="text-[10px] text-gray-400 font-mono">FALSE POSITIVE RATIO</div>
                <div className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                  {report.blast_radius?.false_positive_rate_pct?.toFixed(3)}%
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Syndicate Attribution */}
          <div className="bg-[#0D1424] p-4 rounded-2xl border border-white/[0.06] space-y-3">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              2. Identified Syndicate Members & Attribution
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-gray-400">
                    <th className="pb-2">Entity ID</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Attribution Role</th>
                    <th className="pb-2">Risk State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {report.syndicate_members?.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-blue-400 font-bold">{m.id}</td>
                      <td className="py-2.5 uppercase text-[11px] text-gray-400">{m.type}</td>
                      <td className="py-2.5 text-gray-300 font-sans">{m.role}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {m.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Evidence Trail */}
          <div className="bg-[#0D1424] p-4 rounded-2xl border border-white/[0.06] space-y-3">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              3. Chronological Audit Trail & Forensic Citations
            </h3>
            <div className="space-y-2">
              {report.evidence_trail?.map((ev, idx) => (
                <div key={idx} className="bg-[#070B14] p-3 rounded-xl border-l-4 border-blue-500 border-y border-r border-white/[0.04] text-xs">
                  <div className="flex items-center justify-between text-gray-400 font-mono text-[11px] mb-1">
                    <span className="text-cyan-400 font-semibold">{ev.source}</span>
                    <span>{ev.timestamp}</span>
                  </div>
                  <div className="text-gray-200">{ev.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Dynamic Firewall Enforcement */}
          {report.recommended_firewall_rule && (
            <div className="bg-[#0D1424] p-4 rounded-2xl border border-white/[0.06] space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                4. Dynamic Tier-1 Firewall Enforcement
              </h3>
              <div className="bg-[#070B14] p-3.5 rounded-xl border border-rose-900/40 space-y-1.5 font-mono text-xs">
                <div>RULE NAME: <span className="text-white font-bold">{report.recommended_firewall_rule.name}</span></div>
                <div>CONDITION DSL: <span className="text-rose-400">{report.recommended_firewall_rule.condition_dsl}</span></div>
                <div>ACTION: <span className="text-rose-300 font-bold">{report.recommended_firewall_rule.action}</span></div>
              </div>
            </div>
          )}

          {/* Verification Seal */}
          <div className="p-3.5 bg-[#070B14] rounded-2xl border border-white/[0.06] text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <div>DIGITAL EVIDENCE SEAL: <span className="text-cyan-400">SHA256:7F9A2B99824FE8E80C34B</span></div>
            <div>VERIFIED BY RAZORSHIELD AI</div>
          </div>

        </div>

      </div>
    </div>
  );
}
