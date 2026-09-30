import DashboardClient from '@/app/DashboardClient';
import { demoNodes, demoTags, demoUptimeLogs } from '@/lib/demoData';

export default function DemoDashboardPage() {
  return (
    <DashboardClient
      nodes={demoNodes}
      initialTags={demoTags}
      uptimeLogs={demoUptimeLogs}
      loginServer="https://demo.lavamesh.local"
      readOnly
    />
  );
}
