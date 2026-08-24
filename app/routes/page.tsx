import { getRoutes } from "@/lib/headscale";
import RoutesClient from "./RoutesClient";

export default async function RoutesPage() {
  const routes = await getRoutes();
  return <RoutesClient routes={routes} />;
}
