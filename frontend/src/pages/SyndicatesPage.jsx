import React, { useState, useEffect, useRef } from 'react';
import { Network, Shield, Smartphone, CreditCard, MapPin, User, ArrowRight, Eye, AlertTriangle } from 'lucide-react';

// Lightweight SVG-based bipartite graph — no external graph library required
const SYNDICATE_DATA = {
  id: 'MULE-RING-001',
  accounts: 12,
  devices: 4,
  ipClusters: 3,
  volume: '₹8.42L',
  similarity: '87%',
  nodes: [
    { id: 'DEV-A1', type: 'device', label: 'dev_fp_A1', x: 80, y: 80 },
    { id: 'DEV-A2', type: 'device', label: 'dev_fp_A2', x: 80, y: 200 },
    { id: 'DEV-A3', type: 'device', label: 'dev_fp_A3', x: 80, y: 320 },
    { id: 'DEV-A4', type: 'device', label: 'dev_fp_A4', x: 80, y: 440 },
    { id: 'IP-B1', type: 'ip', label: '103.21.244.x', x: 250, y: 120 },
    { id: 'IP-B2', type: 'ip', label: '45.79.182.x', x: 250, y: 260 },
    { id: 'IP-B3', type: 'ip', label: '139.59.41.x', x: 250, y: 400 },
    { id: 'ACC-C1', type: 'account', label: 'mule1@okhdfcbank', x: 440, y: 60 },
    { id: 'ACC-C2', type: 'account', label: 'mule2@oksbi', x: 440, y: 140 },
    { id: 'ACC-C3', type: 'account', label: 'mule3@okicici', x: 440, y: 220 },
    { id: 'ACC-C4', type: 'account', label: 'mule4@ybl', x: 440, y: 300 },
    { id: 'ACC-C5', type: 'account', label: 'mule5@paytm', x: 440, y: 380 },
    { id: 'ACC-C6', type: 'account', label: 'mule6@apl', x: 440, y: 460 },
    { id: 'PAYOUT', type: 'payout', label: 'PAYOUT HUB', x: 620, y: 260 }
  ],
  edges: [
    { from: 'DEV-A1', to: 'IP-B1' }, { from: 'DEV-A1', to: 'IP-B2' },
    { from: 'DEV-A2', to: 'IP-B1' }, { from: 'DEV-A2', to: 'IP-B2' },
    { from: 'DEV-A3', to: 'IP-B2' }, { from: 'DEV-A3', to: 'IP-B3' },
    { from: 'DEV-A4', to: 'IP-B3' },
    { from: 'IP-B1', to: 'ACC-C1' }, { from: 'IP-B1', to: 'ACC-C2' }, { from: 'IP-B1', to: 'ACC-C3' },
    { from: 'IP-B2', to: 'ACC-C3' }, { from: 'IP-B2', to: 'ACC-C4' }, { from: 'IP-B2', to: 'ACC-C5' },
    { from: 'IP-B3', to: 'ACC-C4' }, { from: 'IP-B3', to: 'ACC-C5' }, { from: 'IP-B3', to: 'ACC-C6' },
    { from: 'ACC-C1', to: 'PAYOUT' }, { from: 'ACC-C2', to: 'PAYOUT' },
    { from: 'ACC-C3', to: 'PAYOUT' }, { from: 'ACC-C4', to: 'PAYOUT' },
    { from: 'ACC-C5', to: 'PAYOUT' }, { from: 'ACC-C6', to: 'PAYOUT' }
  ]
};

const NODE_COLORS = {
  device: '#A970FF',
  ip: '#00C2D9',
  account: '#FF4D6D',
  payout: '#F5B82E'
};
const NODE_ICONS = {
  device: '📱',
  ip: '🌐',
  account: '💳',
  payout: '🏦'
};

function SyndicateGraph({ nodes, edges }) {
  const [hovered, setHovered] = useState(null);

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <svg width="100%" viewBox="0 0 720 540" className="overflow-visible" aria-label="Syndicate network graph">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#1D2940"/>
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => {
        const from = getNode(e.from);
        const to = getNode(e.to);
        if (!from || !to) return null;
        const isHot = hovered === e.from || hovered === e.to;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke={isHot ? '#4C8DFF' : '#1D2940'}
            strokeWidth={isHot ? 1.5 : 0.8}
            strokeDasharray={isHot ? '' : '4 3'}
            markerEnd="url(#arrow)"
            opacity={isHot ? 0.9 : 0.5}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const color = NODE_COLORS[node.type] || '#4C8DFF';
        const isHot = hovered === node.id;
        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={isHot ? 20 : 14}
              fill={`${color}25`}
              stroke={color}
              strokeWidth={isHot ? 2 : 1}
              filter={isHot ? 'url(#glow)' : undefined}
            />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill={color} fontFamily="monospace">
              {NODE_ICONS[node.type]}
            </text>
            <text x="0" y="28" textAnchor="middle" fontSize="7.5" fill="#7F8AA0" fontFamily="monospace">
              {node.label.length > 18 ? node.label.slice(0, 17) + '…' : node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SyndicatesPage() {
  const [selectedRing, setSelectedRing] = useState(SYNDICATE_DATA);

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-5 font-mono select-none">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1D2940] pb-4">
        <div>
          <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
            <span>Syndicate Intelligence — Bipartite Network Graph</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#A970FF]/15 text-[#A970FF] border border-[#A970FF]/30 font-mono">
              1 ACTIVE RING DETECTED
            </span>
          </h1>
          <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
            In-memory bipartite graph engine connecting devices → IP clusters → mule accounts → payout hubs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 soc-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#E8EDF7] uppercase tracking-wider flex items-center gap-1.5">
              <Network className="w-4 h-4 text-[#A970FF]" />
              {selectedRing.id} — Network Topology
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                  <span className="text-[#7F8AA0] capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#060911] rounded-xl border border-[#1D2940] p-2 overflow-hidden">
            <SyndicateGraph nodes={selectedRing.nodes} edges={selectedRing.edges} />
          </div>
        </div>

        {/* Sidebar: Ring Summary + Accounts (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Ring Summary Card */}
          <div className="soc-card rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#A970FF]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="text-xs font-bold text-[#E8EDF7] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D6D]" />
              Syndicate Detected
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: 'Linked Accounts', value: selectedRing.accounts, color: 'text-[#FF4D6D]' },
                { label: 'Device Farm Nodes', value: selectedRing.devices, color: 'text-[#A970FF]' },
                { label: 'IP Clusters', value: selectedRing.ipClusters, color: 'text-[#00C2D9]' },
                { label: 'Transaction Volume', value: selectedRing.volume, color: 'text-[#F5B82E]' },
                { label: 'Behavioral Similarity', value: selectedRing.similarity, color: 'text-[#26D69A]' },
                { label: 'Detection Engine', value: 'Tier-2 Graph', color: 'text-[#4C8DFF]' }
              ].map(m => (
                <div key={m.label} className="bg-[#060911] border border-[#1D2940] p-2.5 rounded-lg">
                  <div className="text-[9px] text-[#7F8AA0] uppercase">{m.label}</div>
                  <div className={`font-bold text-sm mt-0.5 ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mule VPA List */}
          <div className="soc-card rounded-xl p-4 space-y-2.5">
            <div className="text-[11px] font-bold text-[#E8EDF7] uppercase tracking-wider">
              Identified Mule VPAs
            </div>
            <div className="space-y-1 text-[11px]">
              {selectedRing.nodes
                .filter(n => n.type === 'account')
                .map(acc => (
                  <div key={acc.id} className="flex items-center justify-between bg-[#060911] border border-[#1D2940] rounded-md px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5 text-[#FF4D6D]">
                      <CreditCard className="w-3 h-3" />
                      <span className="font-mono">{acc.label}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF4D6D]/15 text-[#FF4D6D] border border-[#FF4D6D]/30 font-bold">
                      MULE
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Detection Method */}
          <div className="soc-card rounded-xl p-4 space-y-2 text-[11px] font-sans">
            <div className="font-bold text-[#E8EDF7] font-mono text-xs uppercase">Detection Method</div>
            <p className="text-[#A5AEC0] leading-relaxed">
              The Tier-2 graph engine runs <strong className="text-[#00C2D9]">bipartite mule cluster detection</strong> using shared device fingerprints and IP subnet overlaps. Connected components with ≥3 accounts sharing ≥2 device nodes are flagged as high-confidence syndicate rings.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
