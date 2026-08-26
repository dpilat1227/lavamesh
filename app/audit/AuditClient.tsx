'use client';
import { useMemo, useState } from 'react';
import { Button, Card, SegmentedControl } from '@/components/ui';
import {
  ACTION_COLORS,
  ACTION_LABELS,
  formatMeta,
  matchesAuditFilter,
  timeAgo,
  type AuditEventView,
  type AuditFilter,
} from '@/lib/auditLabels';

export default function AuditClient({ events }: { events: AuditEventView[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AuditFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(e => {
      if (!matchesAuditFilter(e.action, filter)) return false;
      if (!q) return true;
      const hay = [
        e.action,
        ACTION_LABELS[e.action] ?? '',
        formatMeta(e.meta),
        e.ts,
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [events, query, filter]);

  const exportCsv = () => {
    const rows = [
      ['Time', 'Action', 'Details'],
      ...filtered.map(e => [
        new Date(e.ts).toISOString(),
        ACTION_LABELS[e.action] ?? e.action,
        formatMeta(e.meta),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lavamesh-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3 pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search actions, nodes, keys…"
          className="input text-[13px] py-2 flex-1 min-w-[180px]"
        />
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'nodes', label: 'Nodes' },
            { value: 'keys', label: 'Keys' },
            { value: 'users', label: 'Users' },
            { value: 'policy', label: 'Policy' },
          ]}
        />
        <Button variant="ghost" onClick={exportCsv} disabled={filtered.length === 0} className="text-[12px] px-3 py-2">
          Export CSV
        </Button>
      </div>

      <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>
        {filtered.length} of {events.length} events
      </p>

      <Card key="events-table" padded={false}>
        <div className="grid px-5 py-3" style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: '1px solid var(--border-1)' }}>
          {['Time', 'Action', 'Details'].map(h => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-[13px]" style={{ color: 'var(--text-4)' }}>No events match this search.</p>
        ) : (
          filtered.map((event, i) => (
            <div key={event.id}
              className="grid items-center px-5 py-3 row-alt table-row-hover"
              style={{ gridTemplateColumns: '160px 180px 1fr', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-1)' : 'none' }}
            >
              <div>
                <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{timeAgo(event.ts)}</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-4)' }}>
                  {new Date(event.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACTION_COLORS[event.action] ?? 'var(--text-4)' }} />
                <span className="text-[12px] font-medium" style={{ color: ACTION_COLORS[event.action] ?? 'var(--text-2)' }}>
                  {ACTION_LABELS[event.action] ?? event.action}
                </span>
              </div>
              <p className="text-[12px] font-mono truncate" style={{ color: 'var(--text-4)' }}>
                {formatMeta(event.meta) || '—'}
              </p>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
