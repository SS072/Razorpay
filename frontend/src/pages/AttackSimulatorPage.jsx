import React, { useState, useCallback } from 'react';
import { 
  Play, Square, Sliders, AlertTriangle, ShieldCheck,
  CreditCard, Network, Globe, User, Zap, Radio, ChevronRight
} from 'lucide-react';
import { triggerSimulation } from '../services/api';

const SCENARIOS = [
  {
    id: 'NORMAL',
    name: 'Normal Traffic',
    attackType: 'Benign baseline checkout',
    description: 'Authentic merchant checkout load — verified users, consistent devices, clean IP subnets.',
    txPerSec: '12 tx/sec',
    detection: 'No threats — Tier-1 ALLOW path',
    accent: '#26D69A',
    accentBg: 'bg-[#26D69A]/10',
    accentBorder: 'border-[#26D69A]/30',
    accentText: 'text-[#26D69A]',
    icon: ShieldCheck
  },
  {
    id: 'CARD_TESTING',
    name: 'Card Testing Sweep',
    attackType: 'Distributed Velocity Attack',
    description: 'Stolen card BINs (411111) used in ₹1–₹5 micro-sweeps across 5 rotating proxy IPs to verify card validity before large-value fraud.',
    txPerSec: '↑ 34 tx/sec',
    detection: 'RULE-VELOCITY-007 · Tier-1 sliding-window velocity gate',
    accent: '#FF4D6D',
    accentBg: 'bg-[#FF4D6D]/10',
    accentBorder: 'border-[#FF4D6D]/30',
    accentText: 'text-[#FF4D6D]',
    icon: CreditCard
  },
  {
    id: 'MULE_RING',
    name: 'Mule Syndicate Ring',
    attackType: 'High-Value Network Aggregation',
    description: '8 victim merchant IDs drained via 12 mule VPAs operating on a shared device farm. Tier-2 bipartite graph analysis detects coordinated payout hubs.',
    txPerSec: '↑ 8 high-value payouts/min',
    detection: 'RULE-FW-MULE-002 · Tier-2 graph cluster detection',
    accent: '#A970FF',
    accentBg: 'bg-[#A970FF]/10',
    accentBorder: 'border-[#A970FF]/30',
    accentText: 'text-[#A970FF]',
    icon: Network
  },
  {
    id: 'ACCOUNT_TAKEOVER',
    name: 'Account Takeover (ATO)',
    attackType: 'Credential Stuffing + Session Hijack',
    description: 'Legitimate Mumbai login session (08:00 IST), then a foreign IP switch to London (08:04 IST) — physically impossible in 4 minutes. Geo-velocity violation triggers 3DS step-up.',
    txPerSec: 'High-value single spike',
    detection: 'RULE-GEO-014 · Step-up 3DS challenge enforced',
    accent: '#F5B82E',
    accentBg: 'bg-[#F5B82E]/10',
    accentBorder: 'border-[#F5B82E]/30',
    accentText: 'text-[#F5B82E]',
    icon: User
  },
  {
    id: 'GEO_HOP',
    name: 'Geo-Velocity Hop',
    attackType: 'Impossible Physical Travel Violation',
    description: 'Transaction accepted in Mumbai, followed 3 minutes later by a transaction in London. Implied travel speed: 1,420 km/h — exceeding commercial aviation.',
    txPerSec: '2 tx / 3 min window',
    detection: 'RULE-GEO-014 · Impossible geo-velocity hard block',
    accent: '#00C2D9',
    accentBg: 'bg-[#00C2D9]/10',
    accentBorder: 'border-[#00C2D9]/30',
    accentText: 'text-[#00C2D9]',
    icon: Globe
  }
];

const INTENSITIES = [
  { id: 'LOW', count: 10, desc: '10 injected transactions' },
  { id: 'MEDIUM', count: 20, desc: '20 injected transactions' },
  { id: 'HIGH', count: 35, desc: '35 injected transactions' },
  { id: 'EXTREME', count: 60, desc: '60 injected transactions — high system load' }
];

export default function AttackSimulatorPage({ onSimulationTriggered }) {
  const [selectedScenario, setSelectedScenario] = useState('CARD_TESTING');
  const [selectedIntensity, setSelectedIntensity] = useState('HIGH');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const active = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[1];
  const intensityObj = INTENSITIES.find(i => i.id === selectedIntensity);

  const handleStart = useCallback(async () => {
    if (isRunning) { setIsRunning(false); return; }
    setIsRunning(true);
    setLastResult(null);

    try {
      const result = await triggerSimulation(selectedScenario === 'NORMAL' ? 'NORMAL_STREAM' : selectedScenario, intensityObj.count);
      setLastResult({ success: true, count: intensityObj.count, scenario: active.name });
      if (onSimulationTriggered) onSimulationTriggered(selectedScenario, selectedIntensity);
    } catch (err) {
      setLastResult({ success: false, error: err.message });
    } finally {
      setTimeout(() => setIsRunning(false), 5000);
    }
  }, [isRunning, selectedScenario, selectedIntensity, active, intensityObj, onSimulationTriggered]);

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-5 font-mono select-none">
      
      {/* Header */}
      <div className="border-b border-[#1D2940] pb-4">
        <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
          <span>Defensive Attack Simulation Lab</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#11192B] text-[#00C2D9] border border-[#1D2940] font-mono">
            DETECTION DEMONSTRATION ONLY
          </span>
        </h1>
        <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
          Injects synthetic fraud payloads into the live transaction stream to demonstrate Tier-1 / Tier-2 detection in real-time. No offensive capability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: Scenario Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-[10px] font-bold text-[#7F8AA0] uppercase tracking-wider mb-2">
            Select Attack Scenario
          </div>
          {SCENARIOS.map(sc => {
            const Icon = sc.icon;
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? `${sc.accentBg} ${sc.accentBorder} border shadow-sm`
                    : 'bg-[#0D1322] border-[#1D2940] hover:bg-[#11192B] hover:border-[#2B3C5E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? sc.accentBg : 'bg-[#11192B]'} border ${isSelected ? sc.accentBorder : 'border-[#1D2940]'}`}>
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? sc.accentText : 'text-[#7F8AA0]'}`} />
                    </div>
                    <div>
                      <div className={`font-bold text-xs ${isSelected ? sc.accentText : 'text-[#E8EDF7]'}`}>
                        {sc.name}
                      </div>
                      <div className="text-[10px] text-[#7F8AA0]">{sc.attackType}</div>
                    </div>
                  </div>
                  {isSelected && <ChevronRight className={`w-4 h-4 ${sc.accentText}`} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Configuration + Detail Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Scenario Detail Card */}
          <div className={`soc-card rounded-xl p-5 border-t-2 space-y-4`} style={{ borderTopColor: active.accent }}>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${active.accentText}`}>
                SELECTED SCENARIO
              </div>
              <div className="text-lg font-extrabold text-[#E8EDF7] mt-1 font-sans">{active.name}</div>
              <div className="text-xs text-[#7F8AA0] mt-0.5">{active.attackType}</div>
            </div>

            <p className="text-sm text-[#A5AEC0] leading-relaxed font-sans border-t border-[#1D2940] pt-3">
              {active.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#060911] border border-[#1D2940] p-3 rounded-xl">
                <div className="text-[10px] text-[#7F8AA0] uppercase">Injection Rate</div>
                <div className={`font-bold text-sm mt-0.5 ${active.accentText}`}>{active.txPerSec}</div>
              </div>
              <div className="bg-[#060911] border border-[#1D2940] p-3 rounded-xl">
                <div className="text-[10px] text-[#7F8AA0] uppercase">Expected Detection</div>
                <div className="font-bold text-xs text-[#00C2D9] mt-0.5 leading-snug">{active.detection}</div>
              </div>
            </div>
          </div>

          {/* Intensity Selector */}
          <div className="soc-card rounded-xl p-4 space-y-3">
            <div className="text-[10px] font-bold text-[#7F8AA0] uppercase tracking-wider">
              Simulation Intensity
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {INTENSITIES.map(lvl => {
                const isSel = selectedIntensity === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedIntensity(lvl.id)}
                    className={`py-2 px-1 rounded-xl border text-center font-bold transition ${
                      isSel
                        ? lvl.id === 'EXTREME'
                          ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border-[#FF4D6D]/50'
                          : 'bg-[#4C8DFF]/20 text-[#4C8DFF] border-[#4C8DFF]/50'
                        : 'bg-[#060911] text-[#7F8AA0] border-[#1D2940] hover:text-[#E8EDF7]'
                    }`}
                  >
                    <div className="text-xs">{lvl.id}</div>
                    <div className="text-[9px] font-normal mt-0.5 opacity-70">{lvl.count} txns</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={handleStart}
            className={`w-full py-3 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 active:scale-98 ${
              isRunning
                ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40'
                : 'bg-gradient-to-r from-[#4C8DFF] to-[#00C2D9] text-white shadow-[#4C8DFF]/25 hover:from-blue-500 hover:to-cyan-400'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>SIMULATION ACTIVE — INJECTING {intensityObj?.count} TRANSACTIONS…</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>▶ START SIMULATION — {selectedIntensity} INTENSITY</span>
              </>
            )}
          </button>

          {/* Result State */}
          {lastResult && !isRunning && (
            <div className={`rounded-xl p-3.5 text-xs border ${lastResult.success ? 'bg-[#26D69A]/10 border-[#26D69A]/30 text-[#26D69A]' : 'bg-[#FF4D6D]/10 border-[#FF4D6D]/30 text-[#FF4D6D]'}`}>
              {lastResult.success
                ? `✓ ${lastResult.count} synthetic "${lastResult.scenario}" transactions injected → check Dashboard feed for risk decisions.`
                : `✕ Simulation failed: ${lastResult.error}. Backend may be unreachable.`
              }
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-[10px] text-[#7F8AA0] leading-relaxed font-sans bg-[#060911] p-3 rounded-xl border border-[#1D2940]">
            <strong className="text-[#E8EDF7]">Defensive Demonstration Only.</strong> This simulator generates synthetic transaction payloads that are routed through the live Tier-1/Tier-2 risk scoring engine. All transactions are clearly marked as DEMO data. No real payment rails are accessed.
          </div>

        </div>

      </div>

    </div>
  );
}
