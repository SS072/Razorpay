import React from 'react';
import { Network, Bot, Sparkles, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

export default function SyndicateIntelWidget({ onOpenDossier, stats = {} }) {
  return (
    <div className="soc-card rounded-xl p-4 shadow-md select-none relative overflow-hidden group">
      
      {/* Background Cyber Beam */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#A970FF]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[11px] font-mono uppercase font-bold text-[#E8EDF7] tracking-wider flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-[#00C2D9]" />
          Syndicate Copilot
        </span>
        <span className="text-[10px] font-mono text-[#26D69A] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#26D69A] animate-ping-subtle"></span>
          AUTONOMOUS
        </span>
      </div>

      <div className="bg-[#060911] p-3 rounded-xl border border-[#1D2940] space-y-2 relative z-10 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#7F8AA0]">Active Mule Ring:</span>
          <span className="text-[#FF4D6D] font-bold">MULE-RING-001</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#7F8AA0]">Graph Entities:</span>
          <span className="text-[#00C2D9] font-bold">{stats.graph_node_count || 124} Linked Nodes</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#7F8AA0]">Synthesized DSL:</span>
          <span className="text-[#A970FF] font-bold truncate max-w-[140px]">vpa == 'mule_ops'</span>
        </div>
      </div>

      <button
        onClick={onOpenDossier}
        className="w-full mt-3 py-2 px-3 rounded-lg bg-[#11192B] hover:bg-[#162038] border border-[#1D2940] hover:border-[#4C8DFF]/40 text-[#E8EDF7] font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 relative z-10"
      >
        <Sparkles className="w-3 h-3 text-[#00C2D9]" />
        <span>INSPECT FORENSIC DOSSIER</span>
      </button>

    </div>
  );
}
