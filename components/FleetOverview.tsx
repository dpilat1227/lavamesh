'use client';
import { StatsHero, type HeroTrend } from '@/components/ui/StatsHero';
import { UptimeSparkline } from '@/components/UptimeGraph';

/** Dashboard's main stat panel — thin wrapper around the shared StatsHero
 *  (see Routes for the same pattern) so the "main stat card" look is
 *  identical across fleet pages, not reinvented per page. The uptime trend
 *  now renders as a sparkline filling the panel's trailing space instead of
 *  a second stacked chart panel below it — fixes the dead space and drops a
 *  whole box from the page's vertical rhythm in one move. */
export default function FleetOverview({
  total,
  online,
  offline,
  uptimePct,
  uptimeTrend,
  uptimeLogs,
}: {
  total: number;
  online: number;
  offline: number;
  uptimePct: number | null;
  uptimeTrend?: HeroTrend;
  uptimeLogs?: { createdAt: Date; isOnline: boolean }[];
}) {
  return (
    <StatsHero
      ring={{ value: online, total, label: 'online' }}
      metrics={[
        // Neutral numbers stay the same white as every other stat on the
        // dashboard (Settings' header tiles, etc.) — only color a value when
        // it's actually communicating a state (red offline, green healthy).
        { label: 'Total nodes', value: total },
        { label: 'Offline', value: offline, valueColor: offline > 0 ? 'var(--red)' : undefined },
        {
          label: 'Uptime',
          value: uptimePct !== null ? `${uptimePct.toFixed(1)}%` : '—',
          valueColor: uptimePct !== null ? 'var(--green)' : undefined,
          trend: uptimeTrend,
        },
      ]}
      chart={uptimeLogs && uptimeLogs.length > 0 ? <UptimeSparkline logs={uptimeLogs} /> : undefined}
    />
  );
}
