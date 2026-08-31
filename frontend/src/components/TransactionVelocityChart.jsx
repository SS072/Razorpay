import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { Activity, Radio, Zap } from 'lucide-react';

function getInitialVelocityData() {
  const data = [];
  const now = new Date();
  const basePoints = [
    { normal: 180, attack: 4, challenge: 12 },
    { normal: 195, attack: 6, challenge: 14 },
    { normal: 210, attack: 5, challenge: 11 },
    { normal: 205, attack: 9, challenge: 18 },
    { normal: 220, attack: 42, challenge: 34 },
    { normal: 215, attack: 88, challenge: 29 },
    { normal: 190, attack: 64, challenge: 25 },
    { normal: 230, attack: 28, challenge: 16 },
    { normal: 245, attack: 12, challenge: 15 },
    { normal: 240, attack: 8, challenge: 14 },
    { normal: 260, attack: 14, challenge: 19 },
    { normal: 275, attack: 38, challenge: 24 }
  ];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 5 * 60 * 1000);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const idx = 11 - i;
    data.push({
      time: timeStr,
      ...basePoints[idx]
    });
  }
  return data;
}

export default function TransactionVelocityChart({ liveActivityTrigger }) {
  const [data, setData] = useState(() => getInitialVelocityData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const newAttack = Math.max(4, Math.floor(last.attack + (Math.random() * 12 - 6)));
        const newNormal = Math.max(150, Math.floor(last.normal + (Math.random() * 20 - 10)));
        const newChallenge = Math.max(8, Math.floor(last.challenge + (Math.random() * 8 - 4)));
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const updated = [...prev.slice(1), {
          time: timeStr,
          normal: newNormal,
          attack: newAttack,
          challenge: newChallenge
        }];
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [liveActivityTrigger]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D1424] border border-[#1D2940] p-2.5 rounded-lg shadow-xl text-[11px] font-mono select-none">
          <div className="text-[#7F8AA0] font-bold mb-1.5 border-b border-[#1D2940] pb-1">{label} IST</div>
          <div className="flex items-center space-x-2 text-[#00C2D9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C2D9]"></span>
            <span>Normal Flow:</span>
            <span className="font-bold">{payload[0]?.value} tx/m</span>
          </div>
          <div className="flex items-center space-x-2 text-[#FF4D6D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D]"></span>
            <span>Threats Gated:</span>
            <span className="font-bold">{payload[1]?.value} tx/m</span>
          </div>
          <div className="flex items-center space-x-2 text-[#F5B82E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B82E]"></span>
            <span>3DS Challenges:</span>
            <span className="font-bold">{payload[2]?.value} tx/m</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="soc-card rounded-xl p-3.5 mx-4 mt-3 shadow-md select-none">
      
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-[#00C2D9]" />
          <span className="text-[11px] font-mono uppercase font-bold text-[#E8EDF7] tracking-wider">
            Transaction Velocity Telemetry (1h Timeline)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C2D9] shadow-sm shadow-[#00C2D9]"></span>
            <span className="text-[#7F8AA0]">Normal Flow</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF4D6D] shadow-sm shadow-[#FF4D6D]"></span>
            <span className="text-[#FF4D6D] font-bold">Attack Spikes</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F5B82E] shadow-sm shadow-[#F5B82E]"></span>
            <span className="text-[#F5B82E] font-semibold">3DS Step-Up</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C2D9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00C2D9" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorAttack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D6D" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#FF4D6D" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#1D2940" vertical={false} opacity={0.7} />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#7F8AA0', fontSize: 9, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1D2940' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#7F8AA0', fontSize: 9, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1D2940' }}
              tickLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="normal" 
              stroke="#00C2D9" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorNormal)" 
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="attack" 
              stroke="#FF4D6D" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAttack)" 
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="challenge" 
              stroke="#F5B82E" 
              strokeWidth={1.5}
              fillOpacity={0} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
