import AuditClient from '@/app/audit/AuditClient';
import { PageHeader } from '@/components/ui';
import { demoAuditEvents } from '@/lib/demoData';

export default function DemoAuditPage() {
  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <PageHeader title="Audit Log" subtitle="Sample events from the demo network" />
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-4" style={{ minHeight: 0 }}>
        <AuditClient events={demoAuditEvents} />
      </div>
    </div>
  );
}
