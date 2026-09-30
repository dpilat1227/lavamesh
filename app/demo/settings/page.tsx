import { Badge, Card, PageHeader } from '@/components/ui';

const rows = [
  ['MagicDNS', 'On', 'home.demo'],
  ['Exit node', 'london-exit-node', 'Active'],
  ['ACL policy', 'Default', 'Allow all'],
  ['Team', 'admin, home', '2 people'],
];

export default function DemoSettingsPage() {
  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <PageHeader title="Settings" subtitle="Sample configuration. Nothing here can be changed." />
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-6" style={{ minHeight: 0 }}>
        <Card padded={false} className="max-w-[640px]">
          <div className="p-6">
            {rows.map(([label, value, note]) => (
              <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
                <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>{label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[13px]" style={{ color: 'var(--text-2)' }}>{value}</span>
                  <Badge>{note}</Badge>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
