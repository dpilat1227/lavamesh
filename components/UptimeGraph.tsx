'use client';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

interface Log {
  createdAt: Date;
  isOnline: boolean;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      <span className="chart-tooltip-row">
        <span className="chart-tooltip-swatch" style={{ background: 'var(--chart-1)' }} />
        {Number(payload[0].value).toFixed(1)}% uptime
      </span>
    </div>
  );
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
      uptime: (d.online / d.total) * 100,
    }));

  // Trend: second half of the window vs. first half, so the headline number
  // isn't just "current" but reflects direction — Copilot Money's cash-flow-delta pattern.
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid) as { uptime: number }[];
  const secondHalf = data.slice(mid) as { uptime: number }[];
  const avg = (arr: { uptime: number }[]) => (arr.length ? arr.reduce((s, d) => s + d.uptime, 0) / arr.length : 0);
  const trendDelta = data.length >= 4 ? avg(secondHalf) - avg(firstHalf) : null;
  const currentUptime = data.length ? data[data.length - 1].uptime : null;

  if (data.length < 2) {
    return (
      <div
        className="w-full h-[160px] flex items-center justify-center mb-6 lift-on-hover"
        style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>Waiting for uptime data…</p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-[160px] mb-6 p-5 relative overflow-hidden lift-on-hover"
      style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Network Uptime</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>Last 24 hours</p>
        </div>
        {/* Live headline callout — surfaced outside the chart body, not just on hover */}
        {currentUptime !== null && (
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[24px] font-bold tracking-tight leading-none tabular-nums" style={{ color: 'var(--text-1)' }}>
                {currentUptime.toFixed(1)}%
              </span>
              {trendDelta !== null && Math.abs(trendDelta) >= 0.1 && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    color: trendDelta >= 0 ? 'var(--green)' : 'var(--red)',
                    background: trendDelta >= 0 ? 'var(--green-soft)' : 'var(--red-soft)',
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: trendDelta >= 0 ? 'none' : 'rotate(180deg)' }}>
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  {Math.abs(trendDelta).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>now</p>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pt-16 pb-2 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="65%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <filter id="uptime-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-2)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="uptime"
              stroke="var(--chart-1)"
              strokeWidth={2}
              filter="url(#uptime-line-glow)"
              fillOpacity={1}
              fill="url(#colorUptime)"
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
