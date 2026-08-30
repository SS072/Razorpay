import React, { useState } from 'react';
import { Cpu, Zap, Network, Shield, ArrowDown, ArrowRight, GitBranch, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

const COMPONENTS = [
  {
    id: 'frontend',
    label: 'React Frontend',
    desc: 'Vite + React 18 SPA. Connects to FastAPI via REST + Server-Sent Events (SSE) for live streaming. No external state library — React useState + useEffect + useMemo.',
    color: '#4C8DFF',
    tier: null
  },
  {
    id: 'gateway',
    label: 'FastAPI Gateway',
    desc: 'Python 3.11 + Uvicorn ASGI. Receives Razorpay-compatible webhooks with HMAC-SHA256 signature verification. Routes to Risk Orchestrator.',
    color: '#00C2D9',
    tier: null
  },
  {
    id: 'orchestrator',
    label: 'Risk Orchestrator',
    desc: 'Routes each transaction through Tier-1 first. If Tier-1 issues ALLOW with borderline score (40–59), transaction is escalated asynchronously to Tier-2.',
    color: '#A970FF',
    tier: null
  },
  {
    id: 'tier1',
    label: 'Tier-1 Fast Path',
    desc: 'Synchronous, in-process deterministic engine. Evaluates: sliding-window velocity (last 60s), card BIN reputation, device fingerprint blacklists, IP subnet scoring. Target: <30ms P99.',
    color: '#26D69A',
    tier: 1
  },
  {
    id: 'tier2',
    label: 'Tier-2 Deep Analysis',
    desc: 'Asynchronous bipartite graph analysis using NetworkX. Detects mule cluster membership, account age behavioral baselines, syndicate ring proximity scores, and historical pattern deviations.',
    color: '#F5B82E',
    tier: 2
  },
  {
    id: 'decision',
    label: 'Decision Engine',
    desc: 'Combines Tier-1 and (if escalated) Tier-2 signals into a composite risk score 0–100. Applies policy thresholds: ALLOW (<40), STEP_UP_AUTH (40–69), HARD_BLOCK (≥70). Emits to Audit Store.',
    color: '#4C8DFF',
    tier: null
  },
  {
    id: 'audit',
    label: 'Audit & Event Store',
    desc: 'In-memory ring buffer (expandable to Redis/Postgres). Stores decision records, signal weights, rule triggers, latency, confidence, and model version for every evaluated transaction.',
    color: '#7F8AA0',
    tier: null
  }
];

const FAQ = [
  {
    q: 'Why Two Tiers?',
    a: 'Tier-1 covers 95%+ of decisions in <1ms using deterministic rules — zero merchant friction. Tier-2 handles ambiguous edge-cases (score 40–59) with graph analysis that would be too slow for a synchronous checkout path. This separation ensures low P99 latency without sacrificing detection depth.'
  },
  {
    q: 'What happens when the model is uncertain?',
    a: 'Score in the 40–69 range triggers STEP_UP_AUTH — a 3DS 2.0 challenge is issued to the cardholder\'s bank. This is preferable to a premature hard block that would generate a false positive and cart abandonment.'
  },
  {
    q: 'What happens if the model fails?',
    a: 'The Orchestrator has a fail-safe: if Tier-2 analysis exceeds the 250ms async timeout OR throws an unhandled exception, it defaults to Tier-1\'s deterministic decision. The system never hangs a transaction indefinitely.'
  },
  {
    q: 'How are false positives handled?',
    a: 'Tier-1 only hard-blocks on high-confidence signals (score ≥70). Borderline scores go to 3DS step-up instead. A human analyst can override any decision via the Firewall Drawer. All overrides are audit-logged with reason codes.'
  },
  {
    q: 'Where does AI actually run vs static rules?',
    a: 'Tier-1 uses deterministic sliding-window velocity counters and IP/device reputation lookups — these are rules, not AI. Tier-2 uses a bipartite graph clustering algorithm (community detection) that is a machine learning technique applied to the live transaction graph. The Autonomous Forensic Copilot (AgentCopilot) uses heuristic LLM-style reasoning for evidence synthesis and DSL rule generation.'
  }
];

export default function ArchitecturePage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-6 font-mono select-none">
      
      {/* Header */}
      <div className="border-b border-[#1D2940] pb-4">
        <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
          <span>System Architecture — Dual-Tier Autonomous Risk Engine</span>
        </h1>
        <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
          End-to-end transaction flow from payment gateway ingestion through dual-tier risk scoring to decision enforcement and audit storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: Architecture Flow Diagram (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="text-[10px] font-bold text-[#7F8AA0] uppercase tracking-wider mb-3">
            Transaction Processing Pipeline
          </div>

          {COMPONENTS.map((comp, idx) => {
            const isLast = idx === COMPONENTS.length - 1;
            const isFork = comp.id === 'orchestrator';
            return (
              <div key={comp.id}>
                <div 
                  className="bg-[#0D1322] border border-[#1D2940] rounded-xl p-4 space-y-1.5 relative"
                  style={{ borderLeftColor: comp.color, borderLeftWidth: '3px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#E8EDF7]" style={{ color: comp.color }}>
                        {comp.label}
                      </span>
                      {comp.tier && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded border font-bold" 
                          style={{ color: comp.color, borderColor: `${comp.color}50`, backgroundColor: `${comp.color}15` }}>
                          TIER {comp.tier}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#A5AEC0] leading-relaxed font-sans">{comp.desc}</p>
                </div>

                {/* Connector */}
                {!isLast && (
                  isFork ? (
                    <div className="flex items-center justify-around px-4 py-1 text-[10px] font-mono text-[#7F8AA0]">
                      <div className="flex flex-col items-center">
                        <ArrowDown className="w-4 h-4 text-[#26D69A]" />
                        <span className="text-[#26D69A]">High-conf. → Tier-1 Only</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowDown className="w-4 h-4 text-[#F5B82E]" />
                        <span className="text-[#F5B82E]">Borderline → Tier-1 + Tier-2</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-4 h-4 text-[#1D2940]" />
                    </div>
                  )
                )}
              </div>
            );
          })}

          {/* Decision Outcomes */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: 'ALLOW', desc: 'Score < 40 · Frictionless', color: '#26D69A' },
              { label: 'STEP_UP_AUTH', desc: 'Score 40–69 · 3DS Challenge', color: '#F5B82E' },
              { label: 'HARD_BLOCK', desc: 'Score ≥ 70 · Instant reject', color: '#FF4D6D' }
            ].map(outcome => (
              <div 
                key={outcome.label}
                className="p-3 rounded-xl border text-center text-xs"
                style={{ borderColor: `${outcome.color}40`, backgroundColor: `${outcome.color}10` }}
              >
                <div className="font-bold text-xs" style={{ color: outcome.color }}>{outcome.label}</div>
                <div className="text-[10px] text-[#7F8AA0] mt-0.5">{outcome.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: FAQ / Engineering Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] font-bold text-[#7F8AA0] uppercase tracking-wider mb-3">
            Engineering Q&A
          </div>

          {FAQ.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0D1322] border border-[#1D2940] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold text-[#E8EDF7] hover:bg-[#11192B] transition"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#4C8DFF] flex-shrink-0" />
                  <span>{item.q}</span>
                </div>
                <span className="text-[#7F8AA0] text-base">{expandedFaq === idx ? '−' : '+'}</span>
              </button>
              {expandedFaq === idx && (
                <div className="px-4 pb-4 text-[11px] text-[#A5AEC0] leading-relaxed font-sans border-t border-[#1D2940] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}

          {/* Latency Budget Breakdown */}
          <div className="soc-card rounded-xl p-4 space-y-2.5">
            <div className="text-[11px] font-bold text-[#E8EDF7] uppercase tracking-wider">
              Latency Budget (Simulated — Demo Data)
            </div>
            {[
              { stage: 'HMAC webhook verify', budget: '<0.1ms', color: '#26D69A' },
              { stage: 'Feature extraction', budget: '<0.5ms', color: '#26D69A' },
              { stage: 'Tier-1 velocity check', budget: '<0.8ms', color: '#26D69A' },
              { stage: 'Decision + emit audit', budget: '<0.3ms', color: '#26D69A' },
              { stage: 'P99 end-to-end (Tier-1)', budget: '< 14ms', color: '#00C2D9' },
              { stage: 'Tier-2 graph analysis (async)', budget: '40–180ms', color: '#F5B82E' }
            ].map(item => (
              <div key={item.stage} className="flex items-center justify-between text-[11px]">
                <span className="text-[#A5AEC0] font-sans">{item.stage}</span>
                <span className="font-bold font-mono" style={{ color: item.color }}>{item.budget}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
