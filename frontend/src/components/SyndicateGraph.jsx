import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, ShieldAlert, Sparkles, 
  Filter, Info, Eye, Layers, Compass, Crosshair 
} from 'lucide-react';

const NODE_COLORS = {
  user: '#3B82F6',      // Blue
  card: '#A855F7',      // Purple
  vpa: '#F97316',       // Orange
  ip: '#EF4444',        // Red
  device: '#06B6D4',    // Cyan
  merchant: '#10B981',  // Green
  unknown: '#94A3B8'
};

export default function SyndicateGraph({ graphData, onSelectEntity, highlightedEntityId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState(null);

  // Initialize Force Simulation
  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const height = containerRef.current ? containerRef.current.clientHeight : 600;

    const simNodes = graphData.nodes.map((n, i) => {
      const angle = (i / graphData.nodes.length) * 2 * Math.PI;
      const radius = 130 + Math.random() * 190;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        radius: n.risk_level === 'critical' ? 14 : n.type === 'merchant' ? 12 : 9
      };
    });

    const nodeMap = new Map(simNodes.map(n => [n.id, n]));

    const simLinks = graphData.links.map(l => ({
      sourceNode: nodeMap.get(l.source),
      targetNode: nodeMap.get(l.target),
      relation: l.relation,
      is_suspicious: l.is_suspicious
    })).filter(l => l.sourceNode && l.targetNode);

    // Run 55 iterations of force relaxation
    for (let iter = 0; iter < 55; iter++) {
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 170) {
            const force = (170 - dist) / dist * 0.08;
            a.x -= dx * force;
            a.y -= dy * force;
            b.x += dx * force;
            b.y += dy * force;
          }
        }
      }

      for (const link of simLinks) {
        const dx = link.targetNode.x - link.sourceNode.x;
        const dy = link.targetNode.y - link.sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 75;
        const force = (dist - targetDist) * 0.03;
        link.sourceNode.x += (dx / dist) * force;
        link.sourceNode.y += (dy / dist) * force;
        link.targetNode.x -= (dx / dist) * force;
        link.targetNode.y -= (dy / dist) * force;
      }
    }

    setNodes(simNodes);
    setLinks(simLinks);
  }, [graphData]);

  // High-FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let animId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background Cyber Grid
      ctx.save();
      ctx.fillStyle = '#080C14';
      ctx.fillRect(0, 0, width, height);

      // Transform for Zoom and Pan
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Grid Dots
      const gridSize = 40;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      const startX = -pan.x / zoom - 200;
      const startY = -pan.y / zoom - 200;
      const endX = (width - pan.x) / zoom + 200;
      const endY = (height - pan.y) / zoom + 200;

      for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
        for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      const now = Date.now() / 1000;

      // Draw Graph Edges
      links.forEach(link => {
        ctx.beginPath();
        ctx.moveTo(link.sourceNode.x, link.sourceNode.y);
        ctx.lineTo(link.targetNode.x, link.targetNode.y);
        
        if (link.is_suspicious) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([6, 4]);
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Graph Nodes
      nodes.forEach(node => {
        const isHighlighted = highlightedEntityId && node.id.includes(highlightedEntityId);
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isCritical = node.risk_level === 'critical' || node.is_seed;

        // Radiant Pulsing Halos
        if (isCritical || isHighlighted) {
          const pulse = 5 + Math.sin(now * 3.5) * 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + pulse + 4, 0, 2 * Math.PI);
          ctx.fillStyle = isHighlighted ? 'rgba(59, 130, 246, 0.25)' : 'rgba(244, 63, 94, 0.25)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = isHighlighted ? 'rgba(59, 130, 246, 0.6)' : 'rgba(244, 63, 94, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Inner Node Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = NODE_COLORS[node.type] || NODE_COLORS.unknown;
        ctx.fill();

        // Node Outer Border
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(8, 12, 20, 0.9)';
        ctx.stroke();

        // Node Label Pill
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#60A5FA' : '#CBD5E1';
        ctx.textAlign = 'center';
        const labelShort = node.label.length > 14 ? node.label.substring(0, 12) + '..' : node.label;
        ctx.fillText(labelShort, node.x, node.y + node.radius + 12);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [nodes, links, zoom, pan, selectedNode, highlightedEntityId]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    const clicked = nodes.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clicked) {
      setSelectedNode(clicked);
      setDraggedNode(clicked);
      if (onSelectEntity) onSelectEntity(clicked.id);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      draggedNode.x = mouseX;
      draggedNode.y = mouseY;
      setNodes([...nodes]);
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const focusMuleCluster = () => {
    const muleNode = nodes.find(n => n.id.includes('mule_aggregate') || n.id.includes('mule_boss'));
    if (muleNode && containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      setZoom(1.4);
      setPan({
        x: width / 2 - muleNode.x * 1.4,
        y: height / 2 - muleNode.y * 1.4
      });
      setSelectedNode(muleNode);
      if (onSelectEntity) onSelectEntity(muleNode.id);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#080C14] relative overflow-hidden">
      
      {/* Top Legend HUD Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2.5 bg-[#0D1424]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-2 rounded-xl shadow-2xl">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Entity Legend:</span>
        <div className="flex items-center space-x-1.5 text-xs text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-sm shadow-blue-500/50"></span>
          <span>User</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-sm shadow-orange-500/50"></span>
          <span>UPI VPA</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-sm shadow-purple-500/50"></span>
          <span>Card</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-sm shadow-red-500/50"></span>
          <span>Flagged IP</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shadow-sm shadow-cyan-500/50"></span>
          <span>Device</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-sm shadow-emerald-500/50"></span>
          <span>Merchant</span>
        </div>
      </div>

      {/* Floating Action HUD Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <button
          onClick={focusMuleCluster}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold backdrop-blur transition shadow-lg"
        >
          <Crosshair className="w-3.5 h-3.5 text-purple-400" />
          <span>Focus Mule Ring</span>
        </button>
      </div>

      {/* Floating Bottom Zoom & Tool HUD */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-1 bg-[#0D1424]/90 backdrop-blur-xl border border-white/[0.08] p-1.5 rounded-xl shadow-2xl">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Node Inspector Card */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10 bg-[#0D1424]/95 backdrop-blur-2xl border border-blue-500/40 p-4 rounded-2xl shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-blue-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}></span>
              {selectedNode.type} Entity Inspector
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
          
          <div className="text-xs font-mono font-bold text-white truncate mb-2">
            {selectedNode.id}
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-300 bg-[#070B14] p-2.5 rounded-xl border border-white/[0.06]">
            <div>
              <div className="text-[10px] text-gray-400">Tx Count</div>
              <div className="text-white font-bold">{selectedNode.tx_count}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Volume</div>
              <div className="text-emerald-400 font-bold">₹{selectedNode.total_amount?.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Risk Level</div>
              <div className={`font-bold ${selectedNode.risk_level === 'critical' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedNode.risk_level?.toUpperCase()}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectEntity && onSelectEntity(selectedNode.id)}
            className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-900/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Investigate with AI Copilot</span>
          </button>
        </div>
      )}

      {/* Main High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        width={950}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
