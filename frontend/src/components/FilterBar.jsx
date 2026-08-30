import React, { useRef, useEffect } from 'react';
import { 
  Search, Pause, Play, Filter, ShieldCheck, 
  ShieldAlert, ShieldX, ChevronDown, Clock, MapPin 
} from 'lucide-react';

export default function FilterBar({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  isPaused,
  onTogglePause,
  totalCount = 0,
  riskFilter,
  onRiskFilterChange,
  locationFilter,
  onLocationFilterChange
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-3 bg-[#0A0E1C]/90 backdrop-blur-md border-b border-[#1D2940] flex flex-col gap-2.5 select-none">
      
      {/* Top Row: Stream State, Status Tabs, Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Section Title & Live State */}
        <div className="flex items-center space-x-3">
          <span className="font-bold text-xs font-mono uppercase tracking-wider text-[#E8EDF7] flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#F5B82E]' : 'bg-[#26D69A] animate-ping-subtle'}`}></span>
            Live Transactions
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#11192B] text-[#00C2D9] border border-[#1D2940] font-bold">
            {totalCount} events
          </span>

          {/* Pause / Resume Button */}
          <button
            onClick={onTogglePause}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition border ${
              isPaused 
                ? 'bg-[#F5B82E]/15 text-[#F5B82E] border-[#F5B82E]/40 font-bold' 
                : 'bg-[#11192B] text-[#7F8AA0] hover:text-[#E8EDF7] border-[#1D2940] hover:border-[#2B3C5E]'
            }`}
            title="Press [Space] to pause/resume feed"
          >
            {isPaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE [Space]'}</span>
          </button>
        </div>

        {/* Middle: Status Filter Pills */}
        <div className="flex items-center gap-1 bg-[#060911] p-1 rounded-xl border border-[#1D2940] font-mono text-[11px]">
          {[
            { id: 'ALL', label: 'ALL', key: 'A' },
            { id: 'BLOCKED', label: 'BLOCKED', key: 'B', color: 'text-[#FF4D6D] bg-[#FF4D6D]/15 border-[#FF4D6D]/40' },
            { id: 'CHALLENGED', label: 'CHALLENGED', key: 'C', color: 'text-[#F5B82E] bg-[#F5B82E]/15 border-[#F5B82E]/40' },
            { id: 'ALLOWED', label: 'ALLOWED', key: 'L', color: 'text-[#26D69A] bg-[#26D69A]/15 border-[#26D69A]/40' }
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-3 py-1 rounded-lg transition font-medium flex items-center space-x-1.5 ${
                  isSelected
                    ? tab.color ? `${tab.color} font-bold border shadow-xs` : 'bg-[#11192B] text-[#E8EDF7] font-bold border border-[#1D2940]'
                    : 'text-[#7F8AA0] hover:text-[#E8EDF7] hover:bg-[#11192B]'
                }`}
                title={`Shortcut: [${tab.key}]`}
              >
                <span>{tab.label}</span>
                <span className="text-[9px] text-[#7F8AA0] opacity-50">[{tab.key}]</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search Box */}
        <div className="relative flex-1 sm:w-64 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#7F8AA0] absolute left-3 top-2.5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search VPA, IP, User ID... [/]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#060911] border border-[#1D2940] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#E8EDF7] placeholder-[#7F8AA0] focus:outline-none focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF]/40 font-mono transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-[#7F8AA0] hover:text-[#E8EDF7] text-xs"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Bottom Row: Secondary Filters */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#7F8AA0] pt-1.5 border-t border-[#1D2940]/50">
        <span className="text-[10px] text-[#7F8AA0] uppercase font-bold flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#4C8DFF]" /> Filters:
        </span>

        {/* Risk Threshold Filter */}
        <div className="flex items-center space-x-1">
          <select
            value={riskFilter}
            onChange={(e) => onRiskFilterChange(e.target.value)}
            className="bg-[#060911] border border-[#1D2940] rounded-md px-2.5 py-0.5 text-[#E8EDF7] text-[11px] font-mono focus:outline-none focus:border-[#4C8DFF]"
          >
            <option value="ALL">Risk: All Scores</option>
            <option value="CRITICAL">Risk: Critical (&ge;80)</option>
            <option value="HIGH">Risk: High (&ge;60)</option>
            <option value="MEDIUM">Risk: Medium (30–59)</option>
            <option value="LOW">Risk: Low (&lt;30)</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex items-center space-x-1">
          <select
            value={locationFilter}
            onChange={(e) => onLocationFilterChange(e.target.value)}
            className="bg-[#060911] border border-[#1D2940] rounded-md px-2.5 py-0.5 text-[#E8EDF7] text-[11px] font-mono focus:outline-none focus:border-[#4C8DFF]"
          >
            <option value="ALL">Location: All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="London">London (Foreign Anomaly)</option>
          </select>
        </div>

        {/* Time Feed Metadata */}
        <div className="text-[#7F8AA0] text-[10px] ml-auto hidden sm:block">
          Feed: <span className="text-[#00C2D9] font-bold font-mono">Live SSE Broadcaster</span>
        </div>
      </div>

    </div>
  );
}
