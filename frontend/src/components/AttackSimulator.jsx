import React, { useState } from 'react';
import { 
  Play, Square, Radio, CreditCard, Network, Globe, 
  RefreshCw, ShieldCheck, Zap, Sliders, AlertTriangle, Sparkles 
} from 'lucide-react';
import { triggerSimulation } from '../services/api';

const SCENARIOS = [
  {
    id: 'NORMAL',
    name: 'NORMAL',
    label: 'Benign Merchant Traffic',
    detail: 'Authentic checkout volume · ₹150–₹8,500 · Standard velocity',
    rate: '12 tx/sec',
    accent: 'from-[#26D69A]/20 to-[#26D69A]/5 border-[#26D69A]/40 text-[#26D69A]'
  },
  {
    id: 'CARD_TESTING',
    name: 'CARD TESTING',
    label: 'Velocity Micro-Sweep Attack',
    detail: 'Velocity attack · ₹1–₹5 sweep · 5 rotating botnet IPs · 411111 BIN',
    rate: '↑ 34 tx/sec',
    accent: 'from-[#FF4D6D]/25 to-[#FF4D6D]/5 border-[#FF4D6D]/50 text-[#FF4D6D]'
  },
  {
    id: 'MULE_RING',
    name: 'MULE SYNDICATE',
    label: 'High-Dispersion VPA Aggregation',
    detail: '8 victim merchant IDs · Shared device farm · Payout to mule VPAs',
    rate: '↑ 8 high-value payouts',
    accent: 'from-[#A970FF]/25 to-[#A970FF]/5 border-[#A970FF]/50 text-[#A970FF]'
  },
  {
    id: 'ACCOUNT_TAKEOVER',
    name: 'ACCOUNT TAKEOVER',
    label: 'Credential Stuffing & Session Hijack',
    detail: 'Legitimate Mumbai checkout → 3m later London foreign IP switch',
    rate: 'High risk anomaly',
    accent: 'from-[#F5B82E]/25 to-[#F5B82E]/5 border-[#F5B82E]/50 text-[#F5B82E]'
  },
  {
    id: 'GEO_HOP',
    name: 'GEO-HOP',
    label: 'Impossible Physical Velocity Hop',
    detail: 'Commercial aviation speed violation · 1,420 km/h intercontinental hop',
    rate: '1,420 km/h',
    accent: 'from-[#00C2D9]/25 to-[#00C2D9]/5 border-[#00C2D9]/50 text-[#00C2D9]'
  }
];

export default function AttackSimulator({ onSimulationTriggered }) {
  const [selectedScenario, setSelectedScenario] = useState('CARD_TESTING');
  const [intensity, setIntensity] = useState('HIGH'); // LOW, MEDIUM, HIGH, EXTREME
  const [isRunning, setIsRunning] = useState(false);

  const activeMeta = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[1];

  const handleToggleSimulation = async () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    const countMap = { LOW: 10, MEDIUM: 20, HIGH: 35, EXTREME: 60 };
    const count = countMap[intensity] || 30;

    try {
      await triggerSimulation(selectedScenario === 'NORMAL' ? 'NORMAL_STREAM' : selectedScenario, count);
      if (onSimulationTriggered) onSimulationTriggered(selectedScenario, intensity);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setTimeout(() => {
        setIsRunning(false);
      }, 4000);
    }
  };

  return (
    <div className="bg-[#0A0E1C]/80 backdrop-blur-md border-b border-[#1D2940] px-4 lg:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs select-none">
      
      {/* Left: Title & Scenario Tabs */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        <span className="font-bold text-[11px] font-mono text-[#7F8AA0] uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <Sliders className="w-3.5 h-3.5 text-[#4C8DFF]" />
          Attack Simulator
        </span>

        <div className="flex flex-wrap items-center gap-1 bg-[#060911] p-1 rounded-xl border border-[#1D2940] font-mono text-[11px]">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`px-3 py-1 rounded-lg transition font-medium text-[11px] ${
                  isSelected
                    ? `bg-gradient-to-r ${sc.accent} font-bold border shadow-sm`
                    : 'text-[#7F8AA0] hover:text-[#E8EDF7] hover:bg-[#11192B]'
                }`}
              >
                {sc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: Scenario Dynamic Info Pill */}
      <div className="hidden xl:flex items-center space-x-2 bg-[#060911] px-3.5 py-1.5 rounded-xl border border-[#1D2940] text-[11px] font-mono shadow-inner">
        <span className={`font-bold ${activeMeta.accent.split(' ').pop()}`}>
          {activeMeta.name}
        </span>
        <span className="text-[#1D2940]">·</span>
        <span className="text-[#E8EDF7] truncate max-w-[290px]">
          {activeMeta.detail}
        </span>
        <span className="text-[#1D2940]">·</span>
        <span className="text-[#00C2D9] font-bold">
          {activeMeta.rate}
        </span>
      </div>

      {/* Right: Intensity Selector & Start CTA */}
      <div className="flex items-center space-x-3">
        
        {/* Intensity Control */}
        <div className="flex items-center space-x-1 font-mono text-[10px]">
          <span className="text-[#7F8AA0] mr-1 uppercase font-semibold">Intensity:</span>
          {['LOW', 'MED', 'HIGH', 'EXTREME'].map((lvl) => {
            const fullLvl = lvl === 'MED' ? 'MEDIUM' : lvl;
            const isSel = intensity === fullLvl;
            return (
              <button
                key={lvl}
                onClick={() => setIntensity(fullLvl)}
                className={`px-2 py-0.5 rounded-md border transition font-bold ${
                  isSel
                    ? fullLvl === 'EXTREME'
                      ? 'bg-[#FF4D6D]/20 text-[#FF4D6D] border-[#FF4D6D]/50 shadow-sm'
                      : 'bg-[#4C8DFF]/20 text-[#4C8DFF] border-[#4C8DFF]/50 shadow-sm'
                    : 'bg-[#060911] text-[#7F8AA0] border-[#1D2940] hover:text-[#E8EDF7]'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handleToggleSimulation}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl font-mono font-bold text-xs transition shadow-md active:scale-98 ${
            isRunning
              ? 'bg-gradient-to-r from-[#FF4D6D] to-rose-600 text-white animate-pulse shadow-[#FF4D6D]/30'
              : 'bg-gradient-to-r from-[#4C8DFF] to-[#00C2D9] hover:from-blue-500 hover:to-cyan-400 text-white shadow-[#4C8DFF]/25'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>INJECTING ({intensity})...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>START SIMULATION</span>
            </>
          )}
        </button>

        {/* Live Status Dot */}
        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#7F8AA0]">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#FF4D6D] animate-ping' : 'bg-[#26D69A] shadow-sm shadow-[#26D69A]'}`}></span>
          <span className={isRunning ? 'text-[#FF4D6D] font-bold' : 'text-[#7F8AA0]'}>
            {isRunning ? 'SIM ACTIVE' : 'LIVE'}
          </span>
        </div>

      </div>

    </div>
  );
}
