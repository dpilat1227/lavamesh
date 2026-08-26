import { getRoutes } from "@/lib/headscale";
import RoutesClient from "./RoutesClient";
import HeadscaleUnavailable from "@/components/HeadscaleUnavailable";

export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
  try {
    const routes = await getRoutes();
    return <RoutesClient routes={routes} />;
  } catch (e: any) {
    return <HeadscaleUnavailable message={e?.message} />;
  }
}
