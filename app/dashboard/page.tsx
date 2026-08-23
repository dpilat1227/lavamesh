'use client';

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_TENANT = 'admin';

export default function Dashboard() {
    const [tenant, setTenant] = useState<string>(DEFAULT_TENANT);
    const [tenantInput, setTenantInput] = useState<string>(DEFAULT_TENANT);
    const [nodes, setNodes] = useState<any[]>([]);
    const [authKey, setAuthKey] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());

    const fetchNodes = useCallback(async (forTenant: string, showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const res = await fetch(`/api/nodes?user=${encodeURIComponent(forTenant)}`);
            const data = await res.json();
            if (data.nodes) setNodes(data.nodes);
        } catch (err) {
            console.error(err);
        } finally {
            if (showSpinner) setRefreshing(false);
        }
    }, []);

    const applyTenant = (name: string) => {
        const trimmed = name.trim() || DEFAULT_TENANT;
        setTenant(trimmed);
        setTenantInput(trimmed);
        setNodes([]);
        setAuthKey('');
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

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-8">
            <div className="max-w-5xl mx-auto space-y-8">

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
                            {/* namespace icon */}
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
                                    <th className="pb-3">Hostname</th>
                                    <th className="pb-3">Mesh IPv4</th>
                                    <th className="pb-3">Last Seen</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                                {nodes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-slate-500">
                                            No nodes connected in namespace <span className="text-slate-400">{tenant}</span>.
                                        </td>
                                    </tr>
                                ) : (
                                    nodes.map((node) => {
                                        const nodeId = String(node.id);
                                        const isRevoking = revokingIds.has(nodeId);
                                        return (
                                            <tr key={node.id} className="opacity-100 transition-opacity">
                                                <td className="py-3 text-white font-medium">{node.givenName || node.name}</td>
                                                <td className="py-3 text-orange-400">{node.ipAddresses?.[0] || 'N/A'}</td>
                                                <td className="py-3 text-slate-400">{new Date(node.lastSeen).toLocaleTimeString()}</td>
                                                <td className="py-3">
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