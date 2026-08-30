import React from 'react';
import { 
  ShieldCheck, ShieldAlert, ShieldX, Smartphone, 
  CreditCard, ArrowRight, Zap 
} from 'lucide-react';

export default function TransactionRow({ 
  item, 
  onSelect, 
  isSelected = false 
}) {
  const tx = item.tx || {};
  const evalData = item.evaluation || {};

  const isBlocked = evalData.decision === 'HARD_BLOCK';
  const isChallenged = evalData.decision === 'STEP_UP_AUTH';
  const isAllowed = evalData.decision === 'ALLOW';

  const riskScore = evalData.risk_score || 0;

  // Risk Score Color Coding (0–29 = LOW, 30–59 = MEDIUM, 60–79 = HIGH, 80–100 = CRITICAL)
  let riskColor = 'text-[#26D69A]';
  let riskBg = 'bg-[#26D69A]';
  let riskLabel = 'LOW';
  if (riskScore >= 80) {
    riskColor = 'text-[#FF4D6D]';
    riskBg = 'bg-[#FF4D6D]';
    riskLabel = 'CRIT';
  } else if (riskScore >= 60) {
    riskColor = 'text-orange-400';
    riskBg = 'bg-orange-400';
    riskLabel = 'HIGH';
  } else if (riskScore >= 30) {
    riskColor = 'text-[#F5B82E]';
    riskBg = 'bg-[#F5B82E]';
    riskLabel = 'MED';
  }

  const entityDisplay = tx.upi_vpa || (tx.card_bin ? `${tx.card_bin} (**** ${tx.card_hash?.slice(-4) || '8812'})` : tx.user_id);
  const locationCity = tx.location?.city || 'Mumbai';

  const ruleDisplay = evalData.triggered_rules && evalData.triggered_rules.length > 0 
    ? evalData.triggered_rules[0] 
    : isAllowed ? 'RULE-BASELINE-001' : 'RULE-STANDARD-EVAL';

  const latency = evalData.latency_ms ? `${evalData.latency_ms.toFixed(2)}ms` : '0.24ms';

  return (
    <tr
      onClick={() => onSelect(item)}
      className={`border-b border-[#1D2940]/50 cursor-pointer transition-all duration-150 text-xs font-mono select-none ${
        isSelected
          ? 'bg-[#4C8DFF]/15 border-l-2 border-l-[#4C8DFF]'
          : isBlocked
          ? 'hover:bg-[#FF4D6D]/10'
          : isChallenged
          ? 'hover:bg-[#F5B82E]/10'
          : 'hover:bg-[#11192B]/80'
      }`}
    >
      
      {/* 1. STATUS BADGE */}
      <td className="py-2.5 px-3.5 whitespace-nowrap">
        {isBlocked ? (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#FF4D6D]/15 text-[#FF4D6D] border border-[#FF4D6D]/30 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] shadow-sm shadow-[#FF4D6D]"></span>
            <span>BLOCKED</span>
          </span>
        ) : isChallenged ? (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#F5B82E]/15 text-[#F5B82E] border border-[#F5B82E]/30 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B82E] shadow-sm shadow-[#F5B82E]"></span>
            <span>CHALLENGE</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#26D69A]/15 text-[#26D69A] border border-[#26D69A]/30 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26D69A] shadow-sm shadow-[#26D69A]"></span>
            <span>ALLOWED</span>
          </span>
        )}
      </td>

      {/* 2. AMOUNT (INR) */}
      <td className="py-2.5 px-3.5 font-bold text-[#E8EDF7] whitespace-nowrap">
        ₹{(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>

      {/* 3. USER / ENTITY IDENTIFIER */}
      <td className="py-2.5 px-3.5 text-[#E8EDF7] font-medium truncate max-w-[190px] lg:max-w-[240px]" title={entityDisplay}>
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
            tx.payment_method === 'CARD' ? 'bg-[#A970FF]/15 text-[#A970FF]' : 'bg-[#00C2D9]/15 text-[#00C2D9]'
          }`}>
            {tx.payment_method === 'CARD' ? (
              <CreditCard className="w-3 h-3" />
            ) : (
              <Smartphone className="w-3 h-3" />
            )}
          </div>
          <span className="truncate">{entityDisplay}</span>
        </div>
      </td>

      {/* 4. LOCATION */}
      <td className="py-2.5 px-3.5 text-[#7F8AA0] whitespace-nowrap text-[11px]">
        {locationCity}
      </td>

      {/* 5. RISK SCORE + PROGRESS BAR */}
      <td className="py-2.5 px-3.5 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-1.5 bg-[#060911] rounded-full overflow-hidden border border-[#1D2940]">
            <div 
              className={`h-full ${riskBg}`} 
              style={{ width: `${Math.min(riskScore, 100)}%` }}
            ></div>
          </div>
          <span className={`font-bold ${riskColor} text-[11px]`}>
            {riskScore}
          </span>
        </div>
      </td>

      {/* 6. PRIMARY TRIGGERED RULE */}
      <td className="py-2.5 px-3.5 text-[#7F8AA0] whitespace-nowrap text-[11px] truncate max-w-[160px]">
        <span className={isBlocked ? 'text-[#FF4D6D] font-bold' : isChallenged ? 'text-[#F5B82E] font-medium' : ''}>
          {ruleDisplay}
        </span>
      </td>

      {/* 7. LATENCY */}
      <td className="py-2.5 px-3.5 text-right font-mono text-[11px]">
        <span className="text-[#00C2D9] font-bold">{latency}</span>
      </td>

    </tr>
  );
}
