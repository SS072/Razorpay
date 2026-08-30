import React, { useState } from 'react';
import { 
  Bot, Sparkles, AlertOctagon, Terminal, ShieldAlert, 
  CheckCircle2, ArrowRight, FileText, Lock, RefreshCw, 
  Layers, ShieldCheck, Cpu, Flame, Check, Shield
} from 'lucide-react';
import { triggerInvestigation, applyFirewallRule } from '../services/api';

export default function AgentCopilot({ 
  report, 
  onRuleApplied, 
  onOpenDossier,
  selectedEntityId,
  onRefreshReport
}) {
  const [investigating, setInvestigating] = useState(false);
  const [activeTab, setActiveTab] = useState('SUMMARY'); // SUMMARY | EVIDENCE | REASONING | RULE
  const [applyingRule, setApplyingRule] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleStartInvestigation = async (targetId) => {
    setInvestigating(true);
    setAppliedSuccess(false);
    try {
      const res = await triggerInvestigation(targetId || selectedEntityId || 'vpa:mule_aggregate@okhdfcbank');
      if (onRefreshReport) onRefreshReport(res);
    } catch (err) {
      console.error('Investigation error:', err);
    } finally {
      setInvestigating(false);
    }
  };

  const handleApplyFirewallRule = async () => {
    if (!report || !report.recommended_firewall_rule) return;
    setApplyingRule(true);
    try {
      await applyFirewallRule(report.recommended_firewall_rule, 'ACTIVE');
      setAppliedSuccess(true);
      if (onRuleApplied) onRuleApplied(report.recommended_firewall_rule);
    } catch (err) {
      console.error('Apply rule error:', err);
    } finally {
      setApplyingRule(false);
    }
  };

  if (!report && !investigating) {
    return (
      <div className="flex flex-col h-full bg-[#0A0F1D]/80 border-l border-white/[0.08] p-6 items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-xl shadow-blue-950">
          <Bot className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1.5">Autonomous AI Forensic Copilot</h3>
        <p className="text-xs text-gray-400 max-w-xs mb-5 leading-relaxed">
          Select any entity or flagged transaction to trigger Gemini multi-hop graph intelligence & adaptive firewall synthesis.
        </p>
        <button
          onClick={() => handleStartInvestigation(selectedEntityId)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-blue-600/30"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Investigate Default Mule Ring</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0F1D]/80 border-l border-white/[0.08]">
      
      {/* Top Header */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#0D1424]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-gray-100 uppercase tracking-wider font-mono">
                Forensic Copilot
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleStartInvestigation(selectedEntityId)}
              disabled={investigating}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition"
              title="Re-run investigation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${investigating ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Target Entity Pill */}
        <div className="flex items-center justify-between text-xs bg-[#070B14] p-2 rounded-xl border border-white/[0.08] font-mono mb-2.5">
          <span className="text-gray-400 text-[11px]">Entity:</span>
          <span className="text-blue-400 font-bold truncate max-w-[170px]">
            {report?.target_entity || selectedEntityId || 'vpa:mule_aggregate@okhdfcbank'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
            {report?.confidence_score || 94}% CONF
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1">
          {['SUMMARY', 'EVIDENCE', 'REASONING', 'RULE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded-lg font-mono transition duration-150 ${
                activeTab === tab
                  ? 'bg-blue-600/25 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-950'
                  : 'bg-[#10172B] text-gray-400 hover:bg-[#16203B] hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        
        {investigating ? (
          <div className="py-20 text-center space-y-3.5">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-xs font-mono text-gray-300">Interrogating graph & velocity metrics...</div>
            <div className="text-[11px] font-mono text-gray-500">Synthesizing RBI-compliant forensic dossier</div>
          </div>
        ) : (
          <>
            {/* TAB: SUMMARY */}
            {activeTab === 'SUMMARY' && (
              <div className="space-y-3">
                <div className="bg-[#0D1424]/80 p-3.5 rounded-xl border border-white/[0.08] shadow-sm">
                  <h4 className="text-xs font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>{report?.title || 'Distributed Mule Syndicate Ring'}</span>
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {report?.summary}
                  </p>
                </div>

                {/* Blast Radius Gauge Card */}
                {report?.blast_radius && (
                  <div className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 p-3.5 rounded-xl border border-blue-800/40 shadow-inner">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-300 font-mono">
                      Impact & Blast Radius Telemetry
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                      <div className="bg-[#070B14]/80 p-2 rounded-lg border border-white/[0.04]">
                        <div className="text-[10px] text-gray-400">Prevented Fraud</div>
                        <div className="text-emerald-400 font-bold text-sm">
                          ₹{report.blast_radius.fraud_volume_prevented_inr?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="bg-[#070B14]/80 p-2 rounded-lg border border-white/[0.04]">
                        <div className="text-[10px] text-gray-400">False Positive Rate</div>
                        <div className="text-amber-400 font-bold text-sm">
                          {report.blast_radius.false_positive_rate_pct?.toFixed(3)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Syndicate Members Matrix */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 font-mono">
                    Syndicate Entity Attribution ({report?.syndicate_members?.length || 0})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {report?.syndicate_members?.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#070B14] px-2.5 py-1.5 rounded-lg border border-white/[0.06] text-[11px] font-mono">
                        <span className="text-blue-400 truncate max-w-[130px]">{m.id}</span>
                        <span className="text-gray-400 text-[10px] truncate max-w-[150px]">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EVIDENCE */}
            {activeTab === 'EVIDENCE' && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 font-mono">
                  Chronological Audit Trail
                </span>
                {report?.evidence_trail?.map((ev, idx) => (
                  <div key={idx} className="bg-[#070B14] p-3 rounded-xl border-l-2 border-blue-500 border-y border-r border-white/[0.06]">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mb-1">
                      <span className="text-cyan-400 font-medium">{ev.source}</span>
                      <span>{ev.timestamp?.split(' ')[1] || '00:00:00'}</span>
                    </div>
                    <p className="text-xs text-gray-200">{ev.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: REASONING */}
            {activeTab === 'REASONING' && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 font-mono flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>Gemini Agent Tool Interrogation</span>
                </span>
                <pre className="bg-[#05080F] p-3 rounded-xl border border-white/[0.06] text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {report?.raw_reasoning_log || 'Agent reasoning telemetry active.'}
                </pre>
              </div>
            )}

            {/* TAB: RULE */}
            {activeTab === 'RULE' && report?.recommended_firewall_rule && (
              <div className="space-y-3">
                <div className="bg-[#0D1424] p-3.5 rounded-xl border border-rose-900/40">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 font-mono">
                    AI-Synthesized Dynamic Firewall Rule
                  </span>
                  <div className="text-xs font-bold text-white mt-1">
                    {report.recommended_firewall_rule.name}
                  </div>
                  <div className="bg-[#070B14] p-2.5 rounded-lg border border-white/[0.08] mt-2 font-mono text-xs text-rose-300 break-all">
                    {report.recommended_firewall_rule.condition_dsl}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2 font-mono">
                    Action: <span className="font-bold text-rose-400">{report.recommended_firewall_rule.action}</span> | Estimated FP: <span className="text-emerald-400">0.01%</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#0D1424]/95 space-y-2">
        {appliedSuccess ? (
          <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-400 font-semibold py-2 bg-emerald-950/60 rounded-xl border border-emerald-800/50 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Firewall Rule Enforced in Tier-1 Engine</span>
          </div>
        ) : (
          <button
            onClick={handleApplyFirewallRule}
            disabled={applyingRule || !report?.recommended_firewall_rule}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/40 active:scale-[0.99]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{applyingRule ? 'Enforcing Rule...' : '1-Click Apply Firewall Rule'}</span>
          </button>
        )}

        <button
          onClick={onOpenDossier}
          className="w-full py-2 rounded-xl bg-[#121A30] hover:bg-[#182442] text-gray-200 font-medium text-xs transition flex items-center justify-center space-x-2 border border-white/[0.08]"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>Export RBI Compliance Dossier</span>
        </button>
      </div>

    </div>
  );
}
