import React, { useState } from 'react';
import { 
  X, ShieldAlert, ShieldCheck, Eye, RotateCcw, 
  Plus, Trash2, Check, Lock, Zap 
} from 'lucide-react';
import { toggleRuleStatus } from '../services/api';

export default function FirewallDrawer({ isOpen, onClose, rules = [], onRulesUpdated }) {
  const [loadingRuleId, setLoadingRuleId] = useState(null);

  if (!isOpen) return null;

  const handleToggleStatus = async (ruleId, newStatus) => {
    setLoadingRuleId(ruleId);
    try {
      await toggleRuleStatus(ruleId, newStatus);
      if (onRulesUpdated) onRulesUpdated();
    } catch (err) {
      console.error('Failed to toggle rule status:', err);
    } finally {
      setLoadingRuleId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0A0F1D] border-l border-white/[0.08] h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4.5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D1424]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Tier-1 Dynamic Firewall Rules</h2>
              <p className="text-xs text-gray-400">Sub-millisecond real-time risk gating filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {rules.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-xs">
              No firewall rules currently active.
            </div>
          ) : (
            rules.map((rule) => {
              const isActive = rule.status === 'ACTIVE';
              const isShadow = rule.status === 'SHADOW';
              const isRolledBack = rule.status === 'ROLLED_BACK';

              return (
                <div
                  key={rule.rule_id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0D1424] border-rose-500/40 shadow-lg shadow-rose-950/20'
                      : isShadow
                      ? 'bg-[#0D1424] border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : 'bg-[#0A0E18] border-white/[0.04] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[240px]">
                      {rule.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isShadow
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-2.5 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="bg-[#070B14] p-2.5 rounded-xl border border-white/[0.06] font-mono text-[11px] text-rose-300 mb-3 overflow-x-auto break-all">
                    {rule.condition_dsl}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2.5 border-t border-white/[0.06]">
                    <div className="flex items-center space-x-3">
                      <span>Blocked: <strong className="text-rose-400">{rule.blocked_count || 0}</strong></span>
                      <span>Shadow: <strong className="text-amber-400">{rule.shadow_matched_count || 0}</strong></span>
                    </div>

                    {/* Mode Toggle Controls */}
                    <div className="flex items-center space-x-1.5">
                      {isActive ? (
                        <>
                          <button
                            onClick={() => handleToggleStatus(rule.rule_id, 'SHADOW')}
                            className="px-2.5 py-1 text-[10px] bg-[#121A30] hover:bg-[#182442] text-amber-300 rounded-lg border border-amber-500/30 flex items-center space-x-1 transition"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Shadow</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(rule.rule_id, 'ROLLED_BACK')}
                            className="px-2.5 py-1 text-[10px] bg-[#121A30] hover:bg-[#182442] text-gray-400 hover:text-white rounded-lg border border-white/[0.08] flex items-center space-x-1 transition"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Rollback</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(rule.rule_id, 'ACTIVE')}
                          className="px-3 py-1 text-[10px] bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 font-semibold rounded-lg border border-rose-500/40 flex items-center space-x-1 transition shadow-sm"
                        >
                          <ShieldCheck className="w-3 h-3 text-rose-300" />
                          <span>Re-Activate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0D1424] text-center">
          <span className="text-xs text-gray-400 font-mono">
            Autonomous Dynamic Firewall synced with Tier-1 Fast-Path Engine
          </span>
        </div>

      </div>
    </div>
  );
}
