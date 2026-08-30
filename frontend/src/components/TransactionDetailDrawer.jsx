import React, { useEffect } from 'react';
import { 
  X, ShieldAlert, ShieldCheck, ShieldX, Smartphone, 
  CreditCard, MapPin, Zap, Lock, FileText, CheckCircle2, 
  AlertOctagon, Radio, Terminal, Copy, ArrowRight, BarChart2, Cpu 
} from 'lucide-react';

export default function TransactionDetailDrawer({
  isOpen,
  onClose,
  transactionRecord,
  onOpenDossier,
  onAddToFirewall
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transactionRecord) return null;

  const tx = transactionRecord.tx || {};
  const evalData = transactionRecord.evaluation || {};

  const isBlocked = evalData.decision === 'HARD_BLOCK';
  const isChallenged = evalData.decision === 'STEP_UP_AUTH';
  const isAllowed = evalData.decision === 'ALLOW';

  const riskScore = evalData.risk_score || 0;
  let riskTier = 'LOW RISK';
  let riskColor = 'text-[#26D69A]';
  let riskBg = 'bg-[#26D69A]';

  if (riskScore >= 80) {
    riskTier = 'CRITICAL THREAT';
    riskColor = 'text-[#FF4D6D]';
    riskBg = 'bg-[#FF4D6D]';
  } else if (riskScore >= 60) {
    riskTier = 'HIGH RISK';
    riskColor = 'text-orange-400';
    riskBg = 'bg-orange-400';
  } else if (riskScore >= 30) {
    riskTier = 'MEDIUM RISK';
    riskColor = 'text-[#F5B82E]';
    riskBg = 'bg-[#F5B82E]';
  }

  // Model Explainability feature attribution weights
  const explainabilityWeights = isBlocked ? [
    { feature: 'Transaction burst velocity', weight: 24, max: 30, color: 'bg-[#FF4D6D]' },
    { feature: 'Mule-network cluster proximity', weight: 21, max: 30, color: 'bg-[#A970FF]' },
    { feature: 'Device novelty / farm fingerprint', weight: 18, max: 30, color: 'bg-orange-400' },
    { feature: 'Geo-velocity hop anomaly', weight: 12, max: 30, color: 'bg-[#F5B82E]' },
    { feature: 'Amount deviation vs user baseline', weight: 9, max: 30, color: 'bg-[#4C8DFF]' },
    { feature: 'Account age & identity tenure', weight: 7, max: 30, color: 'bg-[#00C2D9]' }
  ] : isChallenged ? [
    { feature: 'Velocity spike on IP subnet', weight: 19, max: 30, color: 'bg-[#F5B82E]' },
    { feature: 'New device session detected', weight: 16, max: 30, color: 'bg-orange-400' },
    { feature: 'Inter-city travel distance', weight: 11, max: 30, color: 'bg-[#4C8DFF]' },
    { feature: 'Card issuer risk tier (Elevated)', weight: 8, max: 30, color: 'bg-[#00C2D9]' }
  ] : [
    { feature: 'Baseline behavioral match', weight: 3, max: 30, color: 'bg-[#26D69A]' },
    { feature: 'Device canvas reputation (Verified)', weight: 2, max: 30, color: 'bg-[#26D69A]' },
    { feature: 'IP subnet trust baseline', weight: 1, max: 30, color: 'bg-[#26D69A]' }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-xs flex justify-end animate-in fade-in select-none">
      
      {/* Drawer Body */}
      <div className="w-full max-w-lg bg-[#0D1322] border-l border-[#1D2940] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1D2940] flex items-center justify-between bg-[#11192B]">
          <div className="flex items-center space-x-3">
            {isBlocked ? (
              <div className="w-7 h-7 rounded-lg bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 flex items-center justify-center text-[#FF4D6D]">
                <ShieldX className="w-4 h-4" />
              </div>
            ) : isChallenged ? (
              <div className="w-7 h-7 rounded-lg bg-[#F5B82E]/15 border border-[#F5B82E]/30 flex items-center justify-center text-[#F5B82E]">
                <ShieldAlert className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#26D69A]/15 border border-[#26D69A]/30 flex items-center justify-center text-[#26D69A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold text-[#E8EDF7] font-mono">
                  {tx.id || 'pay_unknown'}
                </h2>
                <button
                  onClick={() => copyToClipboard(tx.id)}
                  className="text-[#7F8AA0] hover:text-[#E8EDF7] text-[10px]"
                  title="Copy Transaction ID"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
              </div>
              <p className="text-[10px] text-[#7F8AA0] font-mono uppercase tracking-wider">
                Forensic Explainability & Decision Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-mono text-[#7F8AA0] border border-[#1D2940] px-1.5 py-0.5 rounded bg-[#070B14]">
              Esc
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#7F8AA0] hover:text-[#E8EDF7] hover:bg-[#11192B] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          
          {/* Top Amount & Decision Banner */}
          <div className="bg-[#070B14] p-3.5 rounded-xl border border-[#1D2940] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#7F8AA0] uppercase tracking-wider">Transaction Amount</div>
              <div className="text-2xl font-extrabold text-[#E8EDF7] mt-0.5 font-mono">
                ₹{(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-[#7F8AA0] mt-0.5">
                Method: <strong className="text-[#00C2D9]">{tx.payment_method || 'UPI'}</strong> · {tx.currency || 'INR'}
              </div>
            </div>

            <div className="text-right">
              {isBlocked ? (
                <span className="inline-block px-3 py-1 rounded-md bg-[#FF4D6D]/15 text-[#FF4D6D] border border-[#FF4D6D]/40 font-bold text-xs">
                  HARD BLOCK
                </span>
              ) : isChallenged ? (
                <span className="inline-block px-3 py-1 rounded-md bg-[#F5B82E]/15 text-[#F5B82E] border border-[#F5B82E]/40 font-bold text-xs">
                  STEP-UP AUTH (3DS)
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-md bg-[#26D69A]/15 text-[#26D69A] border border-[#26D69A]/40 font-bold text-xs">
                  FRICTIONLESS ALLOW
                </span>
              )}
              <div className="text-[10px] text-[#7F8AA0] mt-1 font-mono">
                P99 Latency: <span className="text-[#00C2D9] font-bold">{evalData.latency_ms?.toFixed(2) || '0.28'}ms</span>
              </div>
            </div>
          </div>

          {/* Model Decision Overview */}
          <div className="bg-[#070B14] p-3.5 rounded-xl border border-[#1D2940] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#7F8AA0] flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-[#4C8DFF]" />
                Dual-Tier Risk Decision
              </span>
              <span className={`font-bold ${riskColor} text-xs`}>
                Score: {riskScore} / 100 ({riskTier})
              </span>
            </div>

            <div className="w-full h-2 bg-[#0D1322] rounded-full overflow-hidden border border-[#1D2940]">
              <div className={`h-full ${riskBg}`} style={{ width: `${Math.min(riskScore, 100)}%` }}></div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono text-[#7F8AA0]">
              <div className="bg-[#0D1322] p-2 rounded border border-[#1D2940]/60">
                <div>Confidence</div>
                <div className="text-[#00C2D9] font-bold text-xs">91.4%</div>
              </div>
              <div className="bg-[#0D1322] p-2 rounded border border-[#1D2940]/60">
                <div>Threshold</div>
                <div className="text-[#E8EDF7] font-bold text-xs">&ge; 70 Block</div>
              </div>
              <div className="bg-[#0D1322] p-2 rounded border border-[#1D2940]/60">
                <div>Model Engine</div>
                <div className="text-[#A970FF] font-bold text-xs">RiskNet v2.1</div>
              </div>
            </div>
          </div>

          {/* PHASE 10 & 15: WHY WAS THIS BLOCKED / CHALLENGED? Feature Contributions */}
          <div className="bg-[#070B14] p-3.5 rounded-xl border border-[#1D2940] space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-[#7F8AA0] tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3 h-3 text-[#FF4D6D]" />
              Explainability: Contributing Risk Signals
            </span>

            <div className="space-y-2 pt-1">
              {explainabilityWeights.map((sig) => (
                <div key={sig.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A5AEC0] font-sans">{sig.feature}</span>
                    <span className="font-bold text-[#E8EDF7]">+{sig.weight}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1322] rounded-full overflow-hidden border border-[#1D2940]/60">
                    <div 
                      className={`h-full ${sig.color} rounded-full`}
                      style={{ width: `${(sig.weight / sig.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Network Metadata */}
          <div className="bg-[#070B14] p-3.5 rounded-xl border border-[#1D2940] space-y-2 text-[11px]">
            <span className="text-[10px] uppercase font-bold text-[#7F8AA0] tracking-wider">
              Enforcement & Metadata
            </span>

            <div className="space-y-1.5 divide-y divide-[#1D2940]/50 pt-1">
              <div className="flex justify-between py-1">
                <span className="text-[#7F8AA0]">Triggered Rule:</span>
                <span className="text-[#FF4D6D] font-bold">{evalData.triggered_rules?.[0] || 'RULE-BASELINE-001'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7F8AA0]">Entity Identifier:</span>
                <span className="text-[#00C2D9] truncate max-w-[220px]">{tx.upi_vpa || tx.card_hash || tx.user_id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7F8AA0]">Client IP Subnet:</span>
                <span className="text-[#E8EDF7]">{tx.ip_address || '103.21.244.15'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7F8AA0]">Geo Location:</span>
                <span className="text-[#E8EDF7]">{tx.location?.city || 'Mumbai'}, {tx.location?.country || 'IN'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7F8AA0]">Device Fingerprint:</span>
                <span className="text-[#7F8AA0] truncate max-w-[210px]">{tx.device_fingerprint || 'dev_fp_chrome_canvas'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#1D2940] bg-[#11192B] flex items-center space-x-2">
          {isBlocked ? (
            <button
              onClick={() => onAddToFirewall && onAddToFirewall(tx)}
              className="flex-1 py-2 px-3 rounded-lg bg-[#FF4D6D] hover:bg-rose-600 text-white font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-[#FF4D6D]/20 active:scale-98"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>BLOCK ENTITY</span>
            </button>
          ) : (
            <button
              onClick={() => onAddToFirewall && onAddToFirewall(tx)}
              className="flex-1 py-2 px-3 rounded-lg bg-[#070B14] hover:bg-[#1D2940] border border-[#1D2940] text-[#E8EDF7] font-mono text-xs font-semibold transition flex items-center justify-center space-x-1.5 active:scale-98"
            >
              <Lock className="w-3.5 h-3.5 text-[#F5B82E]" />
              <span>QUARANTINE</span>
            </button>
          )}

          <button
            onClick={onOpenDossier}
            className="flex-1 py-2 px-3 rounded-lg bg-[#4C8DFF] hover:bg-blue-600 text-white font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-[#4C8DFF]/20 active:scale-98"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>VIEW DOSSIER</span>
          </button>
        </div>

      </div>

    </div>
  );
}
