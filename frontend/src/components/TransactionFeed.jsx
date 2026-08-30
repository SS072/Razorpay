import React from 'react';
import TransactionRow from './TransactionRow';
import { Layers, ShieldCheck, ShieldAlert, ArrowDownUp } from 'lucide-react';

export default function TransactionFeed({
  transactions = [],
  onSelectTransaction,
  selectedTxId
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-soc-bg">
      <table className="w-full text-left border-collapse">
        
        {/* Sticky Table Header */}
        <thead className="bg-soc-surface border-b border-soc-border sticky top-0 z-10 text-[10px] font-mono uppercase tracking-wider text-soc-muted select-none">
          <tr>
            <th className="py-2 px-3 font-semibold">STATUS</th>
            <th className="py-2 px-3 font-semibold">AMOUNT (INR)</th>
            <th className="py-2 px-3 font-semibold">USER / ENTITY</th>
            <th className="py-2 px-3 font-semibold">LOCATION</th>
            <th className="py-2 px-3 font-semibold">RISK SCORE</th>
            <th className="py-2 px-3 font-semibold">TRIGGERED RULE</th>
            <th className="py-2 px-3 font-semibold text-right">P99 LATENCY</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-soc-border/40">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center text-xs font-mono text-soc-muted">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-soc-muted opacity-40" />
                  <span>No transactions match active filter parameters</span>
                </div>
              </td>
            </tr>
          ) : (
            transactions.map((item, idx) => (
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
  );
}
