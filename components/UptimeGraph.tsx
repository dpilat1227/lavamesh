'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Log {
  createdAt: Date;
  isOnline: boolean;
}

export default function UptimeGraph({ logs }: { logs: Log[] }) {
  // Aggregate data by hour to create a clean trend line
  const aggregatedData = logs.reduce((acc: any, log: Log) => {
    const hour = new Date(log.createdAt).setMinutes(0, 0, 0); // round to hour
    if (!acc[hour]) {
      acc[hour] = { time: hour, total: 0, online: 0 };
    }
    acc[hour].total += 1;
    if (log.isOnline) acc[hour].online += 1;
    return acc;
  }, {});

  const data = Object.values(aggregatedData)
    .sort((a: any, b: any) => a.time - b.time)
    .map((d: any) => ({
      time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uptime: (d.online / d.total) * 100
    }));

  // If we don't have enough data yet, show a placeholder or flat line
  if (data.length < 2) {
    return (
      <div className="w-full h-[140px] flex items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] mb-6">
        <p className="text-[12px] text-[var(--text-4)]">Waiting for uptime data...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[140px] mb-6 p-4 rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] relative overflow-hidden group">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-[13px] font-medium text-[var(--text-2)] mb-1">Network Uptime</h3>
        <p className="text-[11px] text-[var(--text-4)]">Last 24 hours</p>
      </div>
      
      <div className="absolute inset-0 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#34d399' }}
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Uptime']}
            />
            <Area 
              type="monotone" 
              dataKey="uptime" 
              stroke="#34d399" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorUptime)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
