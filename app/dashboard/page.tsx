import { getNodes } from "@/lib/headscale";
import DashboardClient from "@/app/DashboardClient";

export default async function DashboardPage() {
  const nodes = await getNodes();
  return <DashboardClient nodes={nodes} />;
}
