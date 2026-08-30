import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, ArrowUpDown, ShieldCheck, 
  ShieldAlert, ShieldX, Smartphone, CreditCard, RefreshCw, FileText 
} from 'lucide-react';
import TransactionRow from '../components/TransactionRow';

export default function TransactionsPage({ 
  transactions = [], 
  onSelectTransaction,
  selectedTxId,
  onOpenDossier
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('timestamp'); // timestamp, amount, risk, latency
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  const filteredData = useMemo(() => {
    let list = transactions.filter(item => {
      const tx = item.tx || {};
      const evalData = item.evaluation || {};

      if (statusFilter === 'BLOCKED' && evalData.decision !== 'HARD_BLOCK') return false;
      if (statusFilter === 'CHALLENGED' && evalData.decision !== 'STEP_UP_AUTH') return false;
      if (statusFilter === 'ALLOWED' && evalData.decision !== 'ALLOW') return false;

      if (methodFilter !== 'ALL' && tx.payment_method !== methodFilter) return false;

      const score = evalData.risk_score || 0;
      if (riskFilter === 'CRITICAL' && score < 80) return false;
      if (riskFilter === 'HIGH' && score < 60) return false;
      if (riskFilter === 'MEDIUM' && (score < 30 || score >= 60)) return false;
      if (riskFilter === 'LOW' && score >= 30) return false;

      if (search) {
        const q = search.toLowerCase();
        const mId = tx.id?.toLowerCase().includes(q);
        const mVpa = tx.upi_vpa?.toLowerCase().includes(q);
        const mUser = tx.user_id?.toLowerCase().includes(q);
        const mIp = tx.ip_address?.toLowerCase().includes(q);
        const mBin = tx.card_bin?.toLowerCase().includes(q);
        return mId || mVpa || mUser || mIp || mBin;
      }
      return true;
    });

    list.sort((a, b) => {
      const aTx = a.tx || {};
      const bTx = b.tx || {};
      const aEval = a.evaluation || {};
      const bEval = b.evaluation || {};

      let valA = 0;
      let valB = 0;

      if (sortBy === 'amount') {
        valA = aTx.amount || 0;
        valB = bTx.amount || 0;
      } else if (sortBy === 'risk') {
        valA = aEval.risk_score || 0;
        valB = bEval.risk_score || 0;
      } else if (sortBy === 'latency') {
        valA = aEval.latency_ms || 0;
        valB = bEval.latency_ms || 0;
      } else {
        valA = aTx.timestamp || 0;
        valB = bTx.timestamp || 0;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return list;
  }, [transactions, search, statusFilter, methodFilter, riskFilter, sortBy, sortOrder]);

  const totalVolumeInr = filteredData.reduce((acc, curr) => acc + (curr.tx?.amount || 0), 0);
  const avgRisk = filteredData.length ? Math.round(filteredData.reduce((acc, curr) => acc + (curr.evaluation?.risk_score || 0), 0) / filteredData.length) : 0;
  const blockCount = filteredData.filter(i => i.evaluation?.decision === 'HARD_BLOCK').length;
  const blockRate = filteredData.length ? ((blockCount / filteredData.length) * 100).toFixed(1) : '0.0';

  const exportCSV = () => {
    const headers = ["TransactionID", "AmountINR", "Method", "Identifier", "City", "Decision", "RiskScore", "Rule", "LatencyMs"];
    const rows = filteredData.map(item => [
      item.tx?.id,
      item.tx?.amount,
      item.tx?.payment_method,
      item.tx?.upi_vpa || item.tx?.card_bin || item.tx?.user_id,
      item.tx?.location?.city,
      item.evaluation?.decision,
      item.evaluation?.risk_score,
      item.evaluation?.triggered_rules?.[0] || 'NONE',
      item.evaluation?.latency_ms
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `razorshield_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1920px] mx-auto space-y-4 font-mono select-none">
      
      {/* Title & Ledger Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1D2940] pb-4">
        <div>
          <h1 className="text-base font-extrabold text-[#E8EDF7] tracking-tight font-sans flex items-center gap-2">
            <span>Forensic Transaction Operations Ledger</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11192B] text-[#00C2D9] border border-[#1D2940] font-mono">
              {filteredData.length} records indexed
            </span>
          </h1>
          <p className="text-xs text-[#7F8AA0] mt-0.5 font-sans">
            Full granular transaction stream with deterministic rule attributions & model confidence
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#11192B] hover:bg-[#162038] border border-[#1D2940] hover:border-[#00C2D9]/40 text-[#E8EDF7] text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-[#00C2D9]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0D1322] border border-[#1D2940] p-3 rounded-xl">
          <div className="text-[10px] text-[#7F8AA0] uppercase">Filtered Volume</div>
          <div className="text-lg font-bold text-[#E8EDF7] mt-0.5">
            ₹{totalVolumeInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-[#0D1322] border border-[#1D2940] p-3 rounded-xl">
          <div className="text-[10px] text-[#7F8AA0] uppercase">Average Risk Score</div>
          <div className={`text-lg font-bold mt-0.5 ${avgRisk >= 60 ? 'text-[#FF4D6D]' : avgRisk >= 30 ? 'text-[#F5B82E]' : 'text-[#26D69A]'}`}>
            {avgRisk} / 100
          </div>
        </div>
        <div className="bg-[#0D1322] border border-[#1D2940] p-3 rounded-xl">
          <div className="text-[10px] text-[#7F8AA0] uppercase">Blocked Count</div>
          <div className="text-lg font-bold text-[#FF4D6D] mt-0.5">
            {blockCount} txns ({blockRate}%)
          </div>
        </div>
        <div className="bg-[#0D1322] border border-[#1D2940] p-3 rounded-xl">
          <div className="text-[10px] text-[#7F8AA0] uppercase">Fast-Path SLA</div>
          <div className="text-lg font-bold text-[#26D69A] mt-0.5">
            &lt; 1.0 ms avg
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="soc-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-3.5 h-3.5 text-[#7F8AA0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by VPA, Card BIN, User ID, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060911] border border-[#1D2940] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E8EDF7] placeholder-[#7F8AA0] focus:outline-none focus:border-[#4C8DFF]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#060911] border border-[#1D2940] rounded-lg px-2.5 py-1 text-xs text-[#E8EDF7]"
          >
            <option value="ALL">Status: All</option>
            <option value="BLOCKED">Status: Blocked</option>
            <option value="CHALLENGED">Status: Challenged (3DS)</option>
            <option value="ALLOWED">Status: Allowed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#060911] border border-[#1D2940] rounded-lg px-2.5 py-1 text-xs text-[#E8EDF7]"
          >
            <option value="ALL">Method: All</option>
            <option value="UPI">Method: UPI</option>
            <option value="CARD">Method: Card</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#060911] border border-[#1D2940] rounded-lg px-2.5 py-1 text-xs text-[#E8EDF7]"
          >
            <option value="ALL">Risk: All</option>
            <option value="CRITICAL">Risk: Critical (&ge;80)</option>
            <option value="HIGH">Risk: High (&ge;60)</option>
            <option value="MEDIUM">Risk: Medium (30–59)</option>
            <option value="LOW">Risk: Low (&lt;30)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#060911] border border-[#1D2940] rounded-lg px-2.5 py-1 text-xs text-[#E8EDF7]"
          >
            <option value="timestamp">Sort: Timestamp</option>
            <option value="amount">Sort: Amount (₹)</option>
            <option value="risk">Sort: Risk Score</option>
            <option value="latency">Sort: Latency (ms)</option>
          </select>

          <button
            onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            className="px-2.5 py-1 rounded-lg bg-[#060911] border border-[#1D2940] text-[#7F8AA0] hover:text-[#E8EDF7]"
            title="Toggle sort order"
          >
            {sortOrder === 'desc' ? '▼ DESC' : '▲ ASC'}
          </button>
        </div>

      </div>

      {/* Data Table */}
      <div className="soc-card rounded-xl overflow-hidden shadow-md">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#11192B] border-b border-[#1D2940] sticky top-0 z-10 text-[10px] uppercase text-[#7F8AA0]">
              <tr>
                <th className="py-2.5 px-3.5">STATUS</th>
                <th className="py-2.5 px-3.5">AMOUNT (INR)</th>
                <th className="py-2.5 px-3.5">ENTITY IDENTIFIER</th>
                <th className="py-2.5 px-3.5">LOCATION</th>
                <th className="py-2.5 px-3.5">RISK SCORE</th>
                <th className="py-2.5 px-3.5">TRIGGERED RULE</th>
                <th className="py-2.5 px-3.5 text-right">P99 LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2940]/50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-xs text-[#7F8AA0]">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <TransactionRow
                    key={item.tx?.id || idx}
                    item={item}
                    onSelect={onSelectTransaction}
                    isSelected={selectedTxId === item.tx?.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
