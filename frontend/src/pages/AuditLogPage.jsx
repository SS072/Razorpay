import React, { useState, useMemo } from 'react';
import { FileText, Filter, Search, Download, Shield, Cpu, Clock, User, AlertTriangle } from 'lucide-react';

// Deterministic seed-based pseudo-random for consistent demo audit records
function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateAuditLog() {
  const rand = seedRand(42);
  const decisions = ['HARD_BLOCK', 'STEP_UP_AUTH', 'ALLOW', 'HARD_BLOCK', 'ALLOW'];
  const rules = ['RULE-FW-MULE-002', 'RULE-VELOCITY-007', 'RULE-GEO-014', 'RULE-DEVICE-021', 'RULE-BASELINE-001'];
  const models = ['RiskNet v2.1 (Tier-1)', 'RiskNet v2.1 (Tier-2)', 'RiskNet v2.1 (Tier-1)', 'RiskNet v2.1 (Tier-1)', 'RiskNet v2.1 (Tier-1)'];
  const entities = [
    'mule_aggregate@okhdfcbank', 'dev_sweep_bot@okicici', 'user_legit@paytm',
    'card_4111xxxx@oksbi', 'batch_payout@ybl', 'test_vpa@apl', 'legit_user@gpay'
  ];
  const reasons = [
    'Mule network cluster match via bipartite graph', 'Card velocity sweep — 34 tx/min on BIN 411111',
    'Frictionless baseline match', 'Geo-velocity violation: Mumbai→London in 4min',
    'Device fingerprint farm match — 8 accounts on 1 canvas', 'Behavioral baseline verified — normal checkout',
    'Step-up 3DS: new device detected on high-value order'
  ];
  const cities = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'London', 'Chennai', 'Pune'];

  const records = [];
  const now = Date.now();

  for (let i = 0; i < 80; i++) {
    const decisionIdx = Math.floor(rand() * decisions.length);
    const decision = decisions[decisionIdx];
    const entityIdx = Math.floor(rand() * entities.length);
    const riskScore = decision === 'HARD_BLOCK' ? Math.floor(rand() * 25 + 70)
      : decision === 'STEP_UP_AUTH' ? Math.floor(rand() * 30 + 40)
      : Math.floor(rand() * 35 + 5);

    records.push({
      id: `AUD-${10000 + i}`,
      txId: `pay_${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date(now - (i * 45000 + Math.floor(rand() * 30000))).toISOString(),
      decision,
      riskScore,
      model: models[decisionIdx],
      rule: rules[decisionIdx],
      entity: entities[entityIdx],
      location: cities[Math.floor(rand() * cities.length)],
      operator: decision === 'ALLOW' ? 'SYSTEM:AUTO' : decision === 'HARD_BLOCK' ? 'ENGINE:TIER1' : 'ENGINE:3DS',
      reason: reasons[Math.floor(rand() * reasons.length)],
      latency: `${(rand() * 1.2 + 0.12).toFixed(2)}ms`
    });
  }
  return records;
}

const ALL_RECORDS = generateAuditLog();

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return ALL_RECORDS.filter(r => {
      if (actionFilter !== 'ALL' && r.decision !== actionFilter) return false;
      if (riskFilter === 'HIGH' && r.riskScore < 60) return false;
      if (riskFilter === 'CRITICAL' && r.riskScore < 80) return false;
      if (riskFilter === 'LOW' && r.riskScore >= 30) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.txId.toLowerCase().includes(q) || r.entity.toLowerCase().includes(q) || r.rule.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, actionFilter, riskFilter]);

  const exportCSV = () => {
    const headers = ['AuditID', 'TxID', 'Timestamp', 'Decision', 'RiskScore', 'Model', 'Rule', 'Entity', 'Location', 'Operator', 'Reason', 'Latency'];
    const rows = filtered.map(r => [r.id, r.txId, r.timestamp, r.decision, r.riskScore, r.model, r.rule, r.entity, r.location, r.operator, `"${r.reason}"`, r.latency]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `razorshield_audit_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const decisionStyle = (d) => {
    if (d === 'HARD_BLOCK') return 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/30';
    if (d === 'STEP_UP_AUTH') return 'bg-[#F5B82E]/15 text-[#F5B82E] border-[#F5B82E]/30';
    return 'bg-[#26D69A]/15 text-[#26D69A] border-[#26D69A]/30';
  };

  const riskStyle = (score) => {
    if (score >= 80) return 'text-[#FF4D6D]';
    if (score >= 60) return 'text-orange-400';
    if (score >= 30) return 'text-[#F5B82E]';
    return 'text-[#26D69A]';
  };

  const fmtTime = (iso) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-4 font-mono select-none">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1D2940] pb-4">
        <div>
          <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
            <span>Immutable Decision Audit Log</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11192B] text-[#7F8AA0] border border-[#1D2940] font-mono">
              DEMO DATA · {filtered.length} records
            </span>
          </h1>
          <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
            Complete decision provenance trail — timestamp, model version, rule trigger, operator, and reason for every evaluated transaction.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#11192B] hover:bg-[#162038] border border-[#1D2940] text-[#E8EDF7] text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5 text-[#00C2D9]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="soc-card rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#7F8AA0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by TxID, Entity, Rule..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#060911] border border-[#1D2940] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E8EDF7] placeholder-[#7F8AA0] focus:outline-none focus:border-[#4C8DFF]"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="bg-[#060911] border border-[#1D2940] rounded-lg px-2.5 py-1 text-xs text-[#E8EDF7] focus:outline-none focus:border-[#4C8DFF]"
        >
          <option value="ALL">Action: All</option>
          <option value="HARD_BLOCK">Action: Hard Block</option>
          <option value="STEP_UP_AUTH">Action: Step-Up 3DS</option>
          <option value="ALLOW">Action: Allow</option>
        </select>

        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="bg-[#060911] border border-[#1D2940] rounded-lg px-2.5 py-1 text-xs text-[#E8EDF7] focus:outline-none focus:border-[#4C8DFF]"
        >
          <option value="ALL">Risk: All</option>
          <option value="CRITICAL">Risk: Critical (≥80)</option>
          <option value="HIGH">Risk: High (≥60)</option>
          <option value="LOW">Risk: Low (&lt;30)</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="soc-card rounded-xl overflow-hidden shadow-md">
        <div className="max-h-[640px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-[#11192B] border-b border-[#1D2940] sticky top-0 z-10 text-[10px] text-[#7F8AA0] uppercase">
              <tr>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">TRANSACTION</th>
                <th className="py-2.5 px-3">DECISION</th>
                <th className="py-2.5 px-3">RISK</th>
                <th className="py-2.5 px-3 hidden md:table-cell">MODEL ENGINE</th>
                <th className="py-2.5 px-3 hidden lg:table-cell">RULE TRIGGERED</th>
                <th className="py-2.5 px-3 hidden xl:table-cell">OPERATOR</th>
                <th className="py-2.5 px-3 hidden xl:table-cell">REASON</th>
                <th className="py-2.5 px-3 text-right">LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2940]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#7F8AA0] text-xs font-sans">
                    No audit records match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.id} className="hover:bg-[#11192B]/60 transition-colors duration-100">
                    <td className="py-2.5 px-3 text-[#7F8AA0] whitespace-nowrap">
                      {fmtTime(record.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 text-[#00C2D9] whitespace-nowrap">
                      {record.txId}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${decisionStyle(record.decision)}`}>
                        {record.decision === 'HARD_BLOCK' ? 'BLOCK' : record.decision === 'STEP_UP_AUTH' ? '3DS' : 'ALLOW'}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 font-bold whitespace-nowrap ${riskStyle(record.riskScore)}`}>
                      {record.riskScore}
                    </td>
                    <td className="py-2.5 px-3 text-[#7F8AA0] whitespace-nowrap hidden md:table-cell">
                      {record.model}
                    </td>
                    <td className="py-2.5 px-3 text-[#A5AEC0] whitespace-nowrap hidden lg:table-cell">
                      {record.rule}
                    </td>
                    <td className="py-2.5 px-3 text-[#7F8AA0] whitespace-nowrap hidden xl:table-cell">
                      {record.operator}
                    </td>
                    <td className="py-2.5 px-3 hidden xl:table-cell">
                      <span className="text-[#A5AEC0] font-sans text-[10px] truncate max-w-[180px] block" title={record.reason}>
                        {record.reason}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#00C2D9] font-bold whitespace-nowrap">
                      {record.latency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
