import RoutesClient from '@/app/routes/RoutesClient';
import { demoRoutes } from '@/lib/demoData';

export default function DemoRoutesPage() {
  return <RoutesClient routes={demoRoutes} readOnly />;
}
