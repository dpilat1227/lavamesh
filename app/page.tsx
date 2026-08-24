import { getNodes } from "@/lib/headscale";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const nodes = await getNodes();
  return <DashboardClient nodes={nodes} />;
}
