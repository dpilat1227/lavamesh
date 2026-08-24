'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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

// ── Copy-to-clipboard helper ──────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* fallback: select text */
        }
    };
    return (
        <button
            onClick={copy}
            title="Copy to clipboard"
            className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
        >
            {copied ? '✓ Copied' : 'Copy'}
        </button>
    );
}

// ── Token Modal ────────────────────────────────────────────────────────────────
function TokenModal({
    token,
    tenant,
    onClose,
}: {
    token: string;
    tenant: string;
    onClose: () => void;
}) {
    const curlCommand = `curl -fsSL "https://www.lavamesh.com/api/install.sh?token=${token}" | sudo sh`;
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const modal = (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Panel */}
            <div className="relative w-full max-w-xl bg-[#0e1117] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition text-lg leading-none"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Title */}
                <div>
                    <h2 className="text-base font-semibold text-white">Provision Token Generated</h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                        Namespace: <span className="text-orange-400">{tenant}</span>
                    </p>
                </div>

                {/* Raw token */}
                <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-mono text-slate-400">Auth Key</p>
                    <div className="flex items-center gap-2 bg-black/50 border border-slate-800 rounded-lg px-3 py-2">
                        <input
                            readOnly
                            value={token}
                            className="flex-1 bg-transparent text-xs font-mono text-emerald-400 outline-none select-all"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <CopyButton text={token} />
                    </div>
                </div>

                {/* Curl command */}
                <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-mono text-slate-400">Node Onboarding Command</p>
                    <div className="flex items-start gap-2 bg-black/50 border border-slate-800 rounded-lg px-3 py-2">
                        <pre className="flex-1 text-[11px] font-mono text-slate-200 whitespace-pre-wrap break-all leading-relaxed">
                            {curlCommand}
                        </pre>
                        <CopyButton text={curlCommand} />
                    </div>
                </div>

                {/* Warning */}
                <p className="text-[10px] font-mono text-slate-600">
                    ⚠ This token is shown only once. Copy it before closing.
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                >
                    Done
                </button>
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(modal, document.body);
}

// ── Error Toast ────────────────────────────────────────────────────────────────
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 6000);
        return () => clearTimeout(t);
    }, [onDismiss]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-red-950 border border-red-700 rounded-xl shadow-xl text-sm text-red-300 font-mono max-w-md">
            <span className="text-red-400">⚠</span>
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="text-red-500 hover:text-red-300 transition text-base leading-none">✕</button>
        </div>
    );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [tenant, setTenant] = useState<string>(DEFAULT_TENANT);
    const [tenantInput, setTenantInput] = useState<string>(DEFAULT_TENANT);
    const [nodes, setNodes] = useState<any[]>([]);
    const [authKey, setAuthKey] = useState<string>('');   // triggers modal when non-empty
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());
    const [nodeRoutes, setNodeRoutes] = useState<Record<string, NodeRouteState>>({});
    const [errorMsg, setErrorMsg] = useState<string>('');

    // ── Route helpers ──────────────────────────────────────────────────────────

    const fetchRoutesForNode = useCallback(async (nodeId: string) => {
        setNodeRoutes((prev) => ({
            ...prev,
            [nodeId]: { routes: prev[nodeId]?.routes ?? [], loading: true, approving: false },
        }));
        try {
            const res = await fetch(`/api/nodes/${nodeId}/routes`);
            if (!res.ok) throw new Error('Failed to fetch routes');
            const data = await res.json();
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
            await fetchRoutesForNode(nodeId);
        } catch (err) {
            console.error('Failed to approve routes', err);
            setNodeRoutes((prev) => ({
                ...prev,
                [nodeId]: { ...prev[nodeId], approving: false },
            }));
        }
    }, [fetchRoutesForNode]);

    // ── Node helpers ───────────────────────────────────────────────────────────

    const fetchNodes = useCallback(async (forTenant: string, showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const res = await fetch(`/api/nodes?user=${encodeURIComponent(forTenant)}`);
            const data = await res.json();
            if (data.nodes) {
                setNodes(data.nodes);
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
        setErrorMsg('');
        try {
            const res = await fetch('/api/nodes', {
                method: 'POST',
                headers: { 'x-lavamesh-user': tenant },
            });

            // Always try to parse JSON; capture raw text if it fails
            let data: any;
            const raw = await res.text();
            try {
                data = JSON.parse(raw);
            } catch {
                setErrorMsg(`Unexpected response (${res.status}): ${raw.slice(0, 200)}`);
                return;
            }

            console.log('[LavaMesh] /api/nodes POST response:', data);

            if (!res.ok) {
                setErrorMsg(`API error ${res.status}: ${data?.error ?? raw.slice(0, 200)}`);
                return;
            }

            // Headscale wraps the key under preAuthKey.key; some builds spread it to root
            const key: string | undefined =
                data?.preAuthKey?.key   // { preAuthKey: { key: "..." } }
                ?? data?.key            // some versions hoist to root
                ?? data?.token;         // fallback alias

            if (key) {
                setAuthKey(key);        // non-empty → modal opens immediately
            } else {
                setErrorMsg('Token created but no key found in response. Check console for details.');
                console.warn('[LavaMesh] Full response (no key found):', JSON.stringify(data, null, 2));
            }
        } catch (err: any) {
            setErrorMsg(`Network error: ${err?.message ?? 'Unknown error'}`);
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
                setErrorMsg(`Failed to revoke node ${nodeId}.`);
            }
        } catch (err: any) {
            fetchNodes(tenant);
            setErrorMsg(`Network error revoking node: ${err?.message ?? ''}`);
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

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Token modal — rendered outside page flow so nothing can obscure it */}
            {authKey && (
                <TokenModal
                    token={authKey}
                    tenant={tenant}
                    onClose={() => setAuthKey('')}
                />
            )}

            {/* Error toast */}
            {errorMsg && (
                <ErrorToast message={errorMsg} onDismiss={() => setErrorMsg('')} />
            )}

            <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                        <h1 className="text-2xl font-bold tracking-tight text-white">LavaMesh Console</h1>
                        <button
                            id="generate-token-btn"
                            onClick={generateKey}
                            disabled={loading}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Generating…
                                </span>
                            ) : (
                                'Generate New Provision Token'
                            )}
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
                                            const unapprovedRoutes = routes.filter((r) => r.advertised && !r.enabled);
                                            const approvedRoutes = routes.filter((r) => r.advertised && r.enabled);
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
                                                                {approvedRoutes.map((r) => (
                                                                    <span key={r.prefix} className="inline-flex items-center gap-1 mr-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                        <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block shrink-0"></span>
                                                                        {r.prefix}
                                                                    </span>
                                                                ))}
                                                                {unapprovedRoutes.map((r) => (
                                                                    <span key={r.prefix} className="inline-flex items-center gap-1 mr-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                        <span className="w-1 h-1 rounded-full bg-amber-400 inline-block shrink-0"></span>
                                                                        {r.prefix}
                                                                    </span>
                                                                ))}
                                                                {hasUnapproved && (
                                                                    <div className="mt-1">
                                                                        <button
                                                                            onClick={() => approveRoutes(nodeId, unapprovedRoutes.map((r) => r.prefix))}
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
        </>
    );
}