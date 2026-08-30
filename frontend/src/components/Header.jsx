import React from 'react';
import { 
  Shield, Radio, Activity, Lock, FileText, 
  CheckCircle2, RefreshCw, Cpu, Sparkles, Zap, 
  Wifi, HelpCircle, AlertTriangle 
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'transactions', label: 'Transactions', path: '/transactions' },
  { id: 'risk-intelligence', label: 'Risk Intelligence', path: '/risk-intelligence' },
  { id: 'model-evaluation', label: 'Model Evaluation', path: '/model-evaluation' },
  { id: 'syndicates', label: 'Syndicates', path: '/syndicates' },
  { id: 'simulator', label: 'Simulator', path: '/attack-simulator' },
  { id: 'architecture', label: 'Architecture', path: '/architecture' },
  { id: 'audit-log', label: 'Audit Log', path: '/audit-log' }
];

export default function Header({ 
  activeRoute = 'dashboard',
  onRouteChange,
  stats = {}, 
  onOpenFirewall, 
  onOpenDossier,
  onOpenShortcuts,
  isDegraded = false,
  onToggleDegraded
}) {
  return (
    <header className="bg-[#0A0E1C]/95 backdrop-blur-xl border-b border-[#1D2940] sticky top-0 z-40 select-none shadow-xl">
      
      {/* Top Main Row */}
      <div className="h-13 px-4 lg:px-6 flex items-center justify-between">
        
        {/* Left: Brand Identity & Title */}
        <div className="flex items-center space-x-3.5">
          <div 
            onClick={() => onRouteChange && onRouteChange('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4C8DFF] via-[#00C2D9] to-[#A970FF] p-[1.5px] shadow-lg shadow-[#4C8DFF]/20 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#080C16] rounded-[7px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#4C8DFF] fill-[#4C8DFF]/20" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-[#E8EDF7] tracking-tight font-sans">
                  RazorShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C8DFF] to-[#00C2D9]">AI</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#11192B] text-[#7F8AA0] border border-[#1D2940] font-semibold">
                  DEMO ENVIRONMENT
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#7F8AA0] font-medium">
                Autonomous Risk Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Right: Operational Health Telemetry & Global Controls */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Status Indicators */}
          <div className="hidden xl:flex items-center space-x-3 text-[11px] font-mono text-[#7F8AA0]">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#0D1322] border border-[#1D2940]">
              <span className="w-2 h-2 rounded-full bg-[#26D69A] shadow-sm shadow-[#26D69A]"></span>
              <span className="text-[#E8EDF7] font-bold text-[10px] tracking-wide">SYSTEM OPERATIONAL</span>
            </div>

            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-[#26D69A]" />
              <span className="text-[#7F8AA0]">Tier-1 Engine:</span>
              <span className="text-[#26D69A] font-bold">ONLINE</span>
            </div>

            <span className="text-[#1D2940]">|</span>

            <div className="flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-[#00C2D9]" />
              <span className="text-[#7F8AA0]">Payment Gateway:</span>
              <span className="text-[#00C2D9] font-bold">CONNECTED</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2">
            
            {/* Fail-Safe Mode Toggle */}
            <button
              onClick={onToggleDegraded}
              className={`px-2 py-1 rounded text-[10px] font-mono transition border ${
                isDegraded
                  ? 'bg-[#F5B82E]/20 text-[#F5B82E] border-[#F5B82E]/50 font-bold animate-pulse'
                  : 'bg-[#11192B] text-[#7F8AA0] hover:text-[#E8EDF7] border-[#1D2940]'
              }`}
              title="Test safe degradation to Tier-1 rules"
            >
              {isDegraded ? 'FAIL-SAFE: ACTIVE' : 'FAIL-SAFE TEST'}
            </button>

            {/* Firewall Rules Drawer Button */}
            <button
              onClick={onOpenFirewall}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#11192B] hover:bg-[#162038] border border-[#1D2940] hover:border-[#4C8DFF]/40 text-[#E8EDF7] transition text-xs font-mono group shadow-sm active:scale-98"
              title="Manage Tier-1 firewall rules"
            >
              <Lock className="w-3 h-3 text-[#4C8DFF]" />
              <span className="hidden sm:inline">FIREWALL</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#0D1322] text-[#4C8DFF] font-bold border border-[#1D2940]">
                {stats.active_firewall_rules || 2} ACTIVE
              </span>
            </button>

            {/* RBI Compliance Dossier Button */}
            <button
              onClick={onOpenDossier}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#11192B] hover:bg-[#162038] border border-[#1D2940] hover:border-[#26D69A]/40 text-[#E8EDF7] transition text-xs font-mono group shadow-sm active:scale-98"
              title="Open RBI Master Directions Compliance Dossier"
            >
              <FileText className="w-3 h-3 text-[#26D69A]" />
              <span className="hidden md:inline">RBI DOSSIER</span>
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={onOpenShortcuts}
              className="p-1 rounded-lg bg-[#11192B] hover:bg-[#162038] text-[#7F8AA0] hover:text-[#E8EDF7] border border-[#1D2940] transition"
              title="Keyboard Shortcuts Cheat Sheet"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Navigation Sub-Bar */}
      <div className="px-4 lg:px-6 flex items-center space-x-1 border-t border-[#1D2940]/60 overflow-x-auto py-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onRouteChange && onRouteChange(item.id)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#11192B] text-[#4C8DFF] border border-[#4C8DFF]/40 font-bold shadow-xs'
                  : 'text-[#7F8AA0] hover:text-[#E8EDF7] hover:bg-[#11192B]/50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

    </header>
  );
}
