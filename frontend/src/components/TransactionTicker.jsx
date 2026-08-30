import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, ShieldX, Smartphone, CreditCard, 
  Clock, Zap, ArrowUpRight, Search, SlidersHorizontal, Filter 
} from 'lucide-react';

export default function TransactionTicker({ transactions, onSelectTransaction, selectedTxId }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(item => {
    const tx = item.tx || {};
    const evalData = item.evaluation || {};
    
    if (filter === 'BLOCKED' && evalData.decision !== 'HARD_BLOCK') return false;
    if (filter === 'CHALLENGED' && evalData.decision !== 'STEP_UP_AUTH') return false;
    if (filter === 'ALLOWED' && evalData.decision !== 'ALLOW') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = tx.id?.toLowerCase().includes(q);
      const matchVpa = tx.upi_vpa?.toLowerCase().includes(q);
      const matchUser = tx.user_id?.toLowerCase().includes(q);
      const matchIp = tx.ip_address?.toLowerCase().includes(q);
      return matchId || matchVpa || matchUser || matchIp;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0A0F1D]/80 border-r border-white/[0.08]">
      
      {/* Header & Filter Controls */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#0D1424]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
              Live Transactions Feed
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16203B] text-cyan-300 font-mono border border-cyan-500/20">
            {filtered.length} live
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 mb-2.5">
          {['ALL', 'BLOCKED', 'CHALLENGED', 'ALLOWED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded-lg font-mono transition duration-150 ${
                filter === tab
                  ? tab === 'BLOCKED'
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950'
                    : tab === 'CHALLENGED'
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950'
                    : 'bg-blue-600/25 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-950'
                  : 'bg-[#10172B] text-gray-400 hover:bg-[#16203B] hover:text-gray-200 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search VPA, IP, User ID, Card..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070B14] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 font-mono transition"
          />
        </div>
      </div>

      {/* Live Transaction Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No transactions match active filter
          </div>
        ) : (
          filtered.map((item, idx) => {
            const tx = item.tx || {};
            const evalData = item.evaluation || {};
            const isSelected = selectedTxId === tx.id;
            const isBlock = evalData.decision === 'HARD_BLOCK';
            const is3ds = evalData.decision === 'STEP_UP_AUTH';

            return (
              <div
                key={tx.id || idx}
                onClick={() => onSelectTransaction(item)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/30'
                    : isBlock
                    ? 'bg-rose-950/15 border-rose-900/30 hover:bg-rose-950/30 hover:border-rose-700/50'
                    : is3ds
                    ? 'bg-amber-950/15 border-amber-900/30 hover:bg-amber-950/30 hover:border-amber-700/50'
                    : 'bg-[#0D1424]/60 border-white/[0.04] hover:bg-[#121A30] hover:border-white/[0.1]'
                }`}
              >
                {/* Top Row: Amount + Decision Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      tx.payment_method === 'CARD' ? 'bg-purple-500/15 text-purple-400' : 'bg-cyan-500/15 text-cyan-400'
                    }`}>
                      {tx.payment_method === 'CARD' ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono tracking-tight">
                        ₹{(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Decision Badge */}
                  <div>
                    {isBlock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold font-mono shadow-sm">
                        <ShieldX className="w-3 h-3 text-rose-400" />
                        <span>BLOCK</span>
                      </span>
                    ) : is3ds ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono shadow-sm">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        <span>3DS OTP</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold font-mono shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>ALLOW</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Second Row: Identifier & Location */}
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-2">
                  <span className="truncate max-w-[190px] text-gray-300 font-medium">
                    {tx.upi_vpa || (tx.card_bin ? `BIN: ${tx.card_bin} (${tx.card_hash?.slice(-4) || '****'})` : tx.id)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {tx.location?.city || 'Mumbai'}
                  </span>
                </div>

                {/* Third Row: Risk Score & Latency */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.04] text-[10px] font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-gray-400">Score:</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        evalData.risk_score >= 70
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : evalData.risk_score >= 35
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {evalData.risk_score || 0}/100
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-400">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    <span>{evalData.latency_ms || 14.2}ms</span>
                  </div>
                </div>

                {/* Triggered Rule Pill */}
                {evalData.triggered_rules && evalData.triggered_rules.length > 0 && (
                  <div className="mt-1.5 text-[9px] font-mono text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/30 truncate">
                    {evalData.triggered_rules[0]}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
