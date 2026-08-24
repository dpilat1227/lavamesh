'use server'
import { fetchHeadscale } from "@/lib/headscale";
import { revalidatePath } from "next/cache";

export async function generatePreAuthKey() {
  const exp = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  const res = await fetchHeadscale("preauthkey", {
    method: "POST",
    body: JSON.stringify({ user: "admin", reusable: false, ephemeral: false, expiration: exp }),
  });
  revalidatePath("/");
  return res.preAuthKey.key;
}

export async function revokeNode(nodeId: string) {
  await fetchHeadscale(`machine/${nodeId}`, { method: "DELETE" });
  revalidatePath("/");
}

export async function enableRoute(routeId: string) {
  await fetchHeadscale(`routes/${routeId}/enable`, { method: "POST" });
  revalidatePath("/routes");
}

export async function disableRoute(routeId: string) {
  await fetchHeadscale(`routes/${routeId}/enable`, { method: "DELETE" });
  revalidatePath("/routes");
}
