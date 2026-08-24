'use client';
import { useTransition, useOptimistic } from "react";
import { enableRoute, disableRoute } from "@/app/actions";

interface Route {
  id: string;
  prefix: string;
  advertised: boolean;
  enabled: boolean;
  isPrimary: boolean;
  machine?: { id: string; givenName: string; ipAddresses: string[] };
  node?: { id: string; givenName: string; ipAddresses: string[] };
}

function RouteRow({ route }: { route: Route }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(route.enabled);

  const machineName =
    route.machine?.givenName || route.node?.givenName || `ID: ${route.machine?.id || route.node?.id || "Unknown"}`;

  const isExitNode = route.prefix === "0.0.0.0/0" || route.prefix === "::/0";

  const toggle = () => {
    startTransition(async () => {
      setOptimisticEnabled(!optimisticEnabled);
      if (optimisticEnabled) {
        await disableRoute(route.id);
      } else {
        await enableRoute(route.id);
      }
    });
  };

  return (
    <tr className="hover:bg-white/[0.03] transition-colors duration-200 group">
      <td className="py-4 px-6">
        <div className="flex items-center gap-2.5">
          <code className="font-mono text-[13px] text-white bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]">
            {route.prefix}
          </code>
          {isExitNode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20 text-[10px] font-semibold tracking-wide uppercase">
              Exit Node
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-6 text-neutral-300 text-[13px]">{machineName}</td>
      <td className="py-4 px-6">
        {optimisticEnabled ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pending Review
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        <button
          onClick={toggle}
          disabled={isPending}
          className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            optimisticEnabled
              ? "text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20"
              : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20"
          }`}
        >
          {isPending ? "…" : optimisticEnabled ? "Disable" : "Approve"}
        </button>
      </td>
    </tr>
  );
}

export default function RoutesClient({ routes }: { routes: Route[] }) {
  const exitNodes = routes.filter(r => r.prefix === "0.0.0.0/0" || r.prefix === "::/0");
  const subnetRoutes = routes.filter(r => r.prefix !== "0.0.0.0/0" && r.prefix !== "::/0");
  const pendingCount = routes.filter(r => !r.enabled && r.advertised).length;

  return (
    <div className="relative h-full flex flex-col px-10">
      <header className="h-20 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white/90">Subnet Routing</h1>
          {pendingCount > 0 && (
            <p className="text-[12px] text-amber-400 mt-0.5">
              {pendingCount} route{pendingCount > 1 ? "s" : ""} awaiting approval
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-[12px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Exit Nodes: {exitNodes.filter(r => r.enabled).length}/{exitNodes.length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Subnet Routes: {subnetRoutes.filter(r => r.enabled).length}/{subnetRoutes.length}
          </span>
        </div>
      </header>

      <div className="pb-10 flex-1">
        <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl ring-1 ring-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="py-4 px-6 font-medium text-neutral-400 text-[13px]">Route Prefix</th>
                <th className="py-4 px-6 font-medium text-neutral-400 text-[13px]">Advertised By</th>
                <th className="py-4 px-6 font-medium text-neutral-400 text-[13px]">Status</th>
                <th className="py-4 px-6 font-medium text-neutral-400 text-[13px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {routes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span>No routes advertised on the network.</span>
                      <span className="text-[12px] text-neutral-600">Connect a node with <code className="font-mono">--advertise-routes</code> or <code className="font-mono">--advertise-exit-node</code></span>
                    </div>
                  </td>
                </tr>
              ) : (
                routes.map((route) => <RouteRow key={route.id} route={route} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
