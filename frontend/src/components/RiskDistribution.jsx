import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, ShieldAlert } from 'lucide-react';

const DATA = [
  { name: 'Blocked', value: 42, color: '#FF4D6D' },
  { name: 'Challenged', value: 18, color: '#F5B82E' },
  { name: 'Allowed', value: 40, color: '#26D69A' }
];

export default function RiskDistribution({ stats = {} }) {
  return (
    <div className="soc-card rounded-xl p-4 shadow-md select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase font-bold text-[#E8EDF7] tracking-wider flex items-center gap-1.5">
          <PieIcon className="w-3.5 h-3.5 text-[#4C8DFF]" />
          Risk Distribution Breakdown
        </span>
        <span className="text-[10px] font-mono text-[#7F8AA0] px-1.5 py-0.2 rounded bg-[#060911] border border-[#1D2940]">24h Volume</span>
      </div>

      {/* Donut Chart and Legend */}
      <div className="flex items-center justify-between">
        
        {/* Compact Donut */}
        <div className="w-24 h-24 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                innerRadius={26}
                outerRadius={38}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={false}
              >
                {DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0D1322" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-mono font-bold text-[#E8EDF7]">100%</span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="flex-1 pl-4 space-y-2 font-mono text-xs">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#FF4D6D] shadow-sm shadow-[#FF4D6D]"></span>
              <span className="text-[#7F8AA0]">Blocked:</span>
            </div>
            <span className="text-[#FF4D6D] font-bold">42%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#F5B82E] shadow-sm shadow-[#F5B82E]"></span>
              <span className="text-[#7F8AA0]">Challenged:</span>
            </div>
            <span className="text-[#F5B82E] font-bold">18%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#26D69A] shadow-sm shadow-[#26D69A]"></span>
              <span className="text-[#7F8AA0]">Allowed:</span>
            </div>
            <span className="text-[#26D69A] font-bold">40%</span>
          </div>

        </div>

      </div>

    </div>
  );
}
