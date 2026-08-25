import { getNodes } from "@/lib/headscale";
import DashboardClient from "@/app/DashboardClient";
import { getTagsForNodes } from "@/lib/tags";

export default async function DashboardPage() {
  const nodes = await getNodes();
  const tags = await getTagsForNodes(nodes.map((n: any) => n.id));
  return <DashboardClient nodes={nodes} initialTags={tags} />;
}
