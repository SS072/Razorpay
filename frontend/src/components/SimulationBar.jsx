import React, { useState } from 'react';
import { 
  Play, CreditCard, Network, Globe, RefreshCw, 
  AlertTriangle, ShieldCheck, Zap, Radio 
} from 'lucide-react';
import { triggerSimulation } from '../services/api';

export default function SimulationBar({ onSimulationTriggered }) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScenario = async (scenarioKey, count = 25) => {
    setActiveScenario(scenarioKey);
    setLoading(true);
    try {
      await triggerSimulation(scenarioKey, count);
      if (onSimulationTriggered) onSimulationTriggered(scenarioKey);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setActiveScenario(null);
      }, 3500);
    }
  };

  return (
    <div className="bg-[#0C111F]/90 border-b border-white/[0.06] px-6 py-2.5 shadow-md">
      <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Section Label */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </div>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>Attack Simulator</span>
            <span className="text-[10px] text-gray-500 font-normal">| Live Vector Injection</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Normal Traffic */}
          <button
            onClick={() => runScenario('NORMAL_STREAM', 15)}
            disabled={loading}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition duration-200 border ${
              activeScenario === 'NORMAL_STREAM'
                ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950'
                : 'bg-[#10172B] border-white/[0.08] text-gray-300 hover:bg-[#16203B] hover:text-white hover:border-emerald-500/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Normal Merchant Stream</span>
          </button>

          {/* Card Testing */}
          <button
            onClick={() => runScenario('CARD_TESTING', 25)}
            disabled={loading}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition duration-200 border ${
              activeScenario === 'CARD_TESTING'
                ? 'bg-rose-600/25 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950 animate-pulse'
                : 'bg-[#10172B] border-white/[0.08] text-gray-300 hover:bg-[#16203B] hover:text-white hover:border-rose-500/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-400" />
            <span>Card Testing (₹1-₹5 Sweep)</span>
          </button>

          {/* Mule Syndicate */}
          <button
            onClick={() => runScenario('MULE_RING', 12)}
            disabled={loading}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition duration-200 border ${
              activeScenario === 'MULE_RING'
                ? 'bg-purple-600/25 border-purple-500 text-purple-300 ring-2 ring-purple-500/30 shadow-lg shadow-purple-950 animate-pulse'
                : 'bg-[#10172B] border-white/[0.08] text-gray-300 hover:bg-[#16203B] hover:text-white hover:border-purple-500/40'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Mule Syndicate Ring</span>
          </button>

          {/* Account Takeover */}
          <button
            onClick={() => runScenario('ACCOUNT_TAKEOVER', 2)}
            disabled={loading}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition duration-200 border ${
              activeScenario === 'ACCOUNT_TAKEOVER'
                ? 'bg-amber-600/25 border-amber-500 text-amber-300 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950 animate-pulse'
                : 'bg-[#10172B] border-white/[0.08] text-gray-300 hover:bg-[#16203B] hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Account Takeover (Geo-Hop)</span>
          </button>

        </div>

        {/* Live Vector Indicator */}
        {loading ? (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-xs text-cyan-300 font-mono animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Streaming attack transactions into Tier-1 Pipeline...</span>
          </div>
        ) : (
          <div className="text-[11px] text-gray-500 font-mono hidden xl:block">
            Auto-broadcasting telemetry via SSE Hub
          </div>
        )}

      </div>
    </div>
  );
}
