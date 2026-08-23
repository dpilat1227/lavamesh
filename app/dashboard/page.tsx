'use client';

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_TENANT = 'admin';

interface Route {
    prefix: string;
    advertised: boolean;
    enabled: boolean;
    isPrimary: boolean;
}

interface NodeRouteState {
    routes: Route[];
    loading: boolean;
    approving: boolean;
}

export default function Dashboard() {
    const [tenant, setTenant] = useState<string>(DEFAULT_TENANT);
    const [tenantInput, setTenantInput] = useState<string>(DEFAULT_TENANT);
    const [nodes, setNodes] = useState<any[]>([]);
    const [authKey, setAuthKey] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());
    // Per-node route state: { [nodeId]: NodeRouteState }
    const [nodeRoutes, setNodeRoutes] = useState<Record<string, NodeRouteState>>({});

    // ── Route helpers ──────────────────────────────────────────────────

    const fetchRoutesForNode = useCallback(async (nodeId: string) => {
        setNodeRoutes((prev) => ({
            ...prev,
            [nodeId]: { routes: prev[nodeId]?.routes ?? [], loading: true, approving: false },
        }));
        try {
            const res = await fetch(`/api/nodes/${nodeId}/routes`);
            if (!res.ok) throw new Error('Failed to fetch routes');
            const data = await res.json();
            // Headscale returns { routes: Route[] }
            setNodeRoutes((prev) => ({
                ...prev,
                [nodeId]: { routes: data.routes ?? [], loading: false, approving: false },
            }));
        } catch {
            setNodeRoutes((prev) => ({
                ...prev,
                [nodeId]: { routes: [], loading: false, approving: false },
            }));
        }
    }, []);

    const approveRoutes = useCallback(async (nodeId: string, routes: string[]) => {
        setNodeRoutes((prev) => ({
            ...prev,
            [nodeId]: { ...prev[nodeId], approving: true },
        }));
        try {
            await fetch(`/api/nodes/${nodeId}/routes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ routes }),
            });
            // Refresh routes after approval
            await fetchRoutesForNode(nodeId);
        } catch (err) {
            console.error('Failed to approve routes', err);
            setNodeRoutes((prev) => ({
                ...prev,
                [nodeId]: { ...prev[nodeId], approving: false },
            }));
        }
    }, [fetchRoutesForNode]);

    // ── Node helpers ───────────────────────────────────────────────────

    const fetchNodes = useCallback(async (forTenant: string, showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const res = await fetch(`/api/nodes?user=${encodeURIComponent(forTenant)}`);
            const data = await res.json();
            if (data.nodes) {
                setNodes(data.nodes);
                // Fetch routes for each node
                data.nodes.forEach((n: any) => fetchRoutesForNode(String(n.id)));
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (showSpinner) setRefreshing(false);
        }
    }, [fetchRoutesForNode]);

    const applyTenant = (name: string) => {
        const trimmed = name.trim() || DEFAULT_TENANT;
        setTenant(trimmed);
        setTenantInput(trimmed);
        setNodes([]);
        setAuthKey('');
        setNodeRoutes({});
        fetchNodes(trimmed);
    };

    const generateKey = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/nodes', {
                method: 'POST',
                headers: { 'x-lavamesh-user': tenant },
            });
            const data = await res.json();
            if (data.preAuthKey?.key) {
                setAuthKey(data.preAuthKey.key);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const revokeNode = async (nodeId: string) => {
        setNodes((prev) => prev.filter((n) => String(n.id) !== String(nodeId)));
        setRevokingIds((prev) => new Set(prev).add(nodeId));
        try {
            const res = await fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' });
            if (!res.ok) {
                fetchNodes(tenant);
                console.error('Failed to revoke node', nodeId);
            }
        } catch (err) {
            fetchNodes(tenant);
            console.error(err);
        } finally {
            setRevokingIds((prev) => {
                const next = new Set(prev);
                next.delete(nodeId);
                return next;
            });
        }
    };

    useEffect(() => {
        fetchNodes(tenant);
        const interval = setInterval(() => fetchNodes(tenant), 10000);
        return () => clearInterval(interval);
    }, [fetchNodes, tenant]);

    // ── Render ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <h1 className="text-2xl font-bold tracking-tight text-white">LavaMesh Console</h1>
                    <button
                        onClick={generateKey}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition"
                    >
                        {loading ? 'Generating...' : 'Generate New Provision Token'}
                    </button>
                </div>

                {/* Tenant selector */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3">
                        Active Namespace
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 bg-black/40 border border-slate-700 rounded-lg px-3 py-2">
                            <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="text"
                                value={tenantInput}
                                onChange={(e) => setTenantInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyTenant(tenantInput)}
                                placeholder="Tenant name (e.g. admin, acme-corp)"
                                className="flex-1 bg-transparent text-sm font-mono text-white placeholder-slate-600 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => applyTenant(tenantInput)}
                            disabled={tenantInput.trim() === tenant}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Switch
                        </button>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
                            {tenant}
                        </span>
                    </div>
                </div>

                {/* Provision key */}
                {authKey && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 space-y-2">
                        <p className="text-xs uppercase font-mono tracking-wider text-orange-400">
                            Node Onboarding Command — namespace: <span className="text-white">{tenant}</span>
                        </p>
                        <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
                            curl -fsSL https://www.lavamesh.com/api/install.sh?token={authKey} | sudo sh
                        </pre>
                    </div>
                )}

                {/* Fleet table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            Active Fleet Nodes
                            <span className="ml-2 text-slate-400 text-base font-normal">({nodes.length})</span>
                            <span className="ml-3 text-xs font-mono text-slate-500">/ {tenant}</span>
                        </h2>
                        <button
                            onClick={() => fetchNodes(tenant, true)}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-lg text-xs transition disabled:opacity-50"
                        >
                            <svg
                                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-800 text-slate-400 font-mono text-xs">
                                <tr>
                                    <th className="pb-3 pr-4">Hostname</th>
                                    <th className="pb-3 pr-4">Mesh IPv4</th>
                                    <th className="pb-3 pr-4">Subnet Routes</th>
                                    <th className="pb-3 pr-4">Last Seen</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                                {nodes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-6 text-center text-slate-500">
                                            No nodes connected in namespace <span className="text-slate-400">{tenant}</span>.
                                        </td>
                                    </tr>
                                ) : (
                                    nodes.map((node) => {
                                        const nodeId = String(node.id);
                                        const isRevoking = revokingIds.has(nodeId);
                                        const routeState = nodeRoutes[nodeId];
                                        const routes = routeState?.routes ?? [];

                                        // Unapproved = advertised but not yet enabled
                                        const unapprovedRoutes = routes.filter(
                                            (r) => r.advertised && !r.enabled
                                        );
                                        const approvedRoutes = routes.filter(
                                            (r) => r.advertised && r.enabled
                                        );
                                        const hasUnapproved = unapprovedRoutes.length > 0;

                                        return (
                                            <tr key={node.id} className="opacity-100 transition-opacity align-top">
                                                <td className="py-3 pr-4 text-white font-medium">{node.givenName || node.name}</td>
                                                <td className="py-3 pr-4 text-orange-400">{node.ipAddresses?.[0] || 'N/A'}</td>

                                                {/* Subnet Routes column */}
                                                <td className="py-3 pr-4">
                                                    {routeState?.loading ? (
                                                        <span className="text-slate-600">loading…</span>
                                                    ) : routes.length === 0 ? (
                                                        <span className="text-slate-700">—</span>
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            {/* Approved routes */}
                                                            {approvedRoutes.map((r) => (
                                                                <span
                                                                    key={r.prefix}
                                                                    className="inline-flex items-center gap-1 mr-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                >
                                                                    <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block shrink-0"></span>
                                                                    {r.prefix}
                                                                </span>
                                                            ))}
                                                            {/* Unapproved routes */}
                                                            {unapprovedRoutes.map((r) => (
                                                                <span
                                                                    key={r.prefix}
                                                                    className="inline-flex items-center gap-1 mr-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                                >
                                                                    <span className="w-1 h-1 rounded-full bg-amber-400 inline-block shrink-0"></span>
                                                                    {r.prefix}
                                                                </span>
                                                            ))}
                                                            {/* Approve button if any unapproved */}
                                                            {hasUnapproved && (
                                                                <div className="mt-1">
                                                                    <button
                                                                        onClick={() =>
                                                                            approveRoutes(
                                                                                nodeId,
                                                                                unapprovedRoutes.map((r) => r.prefix)
                                                                            )
                                                                        }
                                                                        disabled={routeState?.approving}
                                                                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {routeState?.approving ? 'Approving…' : `Approve ${unapprovedRoutes.length} route${unapprovedRoutes.length > 1 ? 's' : ''}`}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3 pr-4 text-slate-400">{new Date(node.lastSeen).toLocaleTimeString()}</td>
                                                <td className="py-3 pr-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <button
                                                        onClick={() => revokeNode(nodeId)}
                                                        disabled={isRevoking}
                                                        className="px-2.5 py-1 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isRevoking ? 'Revoking…' : 'Revoke'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}