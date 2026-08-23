'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Dashboard() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [authKey, setAuthKey] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());

    const fetchNodes = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const res = await fetch('/api/nodes');
            const data = await res.json();
            if (data.nodes) setNodes(data.nodes);
        } catch (err) {
            console.error(err);
        } finally {
            if (showSpinner) setRefreshing(false);
        }
    }, []);

    const generateKey = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/nodes', { method: 'POST' });
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
        // Optimistically remove from UI
        setNodes((prev) => prev.filter((n) => String(n.id) !== String(nodeId)));
        setRevokingIds((prev) => new Set(prev).add(nodeId));
        try {
            const res = await fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' });
            if (!res.ok) {
                // Revert optimistic removal on failure
                fetchNodes();
                console.error('Failed to revoke node', nodeId);
            }
        } catch (err) {
            // Revert optimistic removal on error
            fetchNodes();
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
        fetchNodes();
        const interval = setInterval(() => fetchNodes(), 10000);
        return () => clearInterval(interval);
    }, [fetchNodes]);

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans p-8">
            <div className="max-w-5xl mx-auto space-y-8">
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

                {authKey && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 space-y-2">
                        <p className="text-xs uppercase font-mono tracking-wider text-orange-400">Node Onboarding Command</p>
                        <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
                            curl -fsSL https://www.lavamesh.com/api/install.sh?token={authKey} | sudo sh
                        </pre>
                    </div>
                )}

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            Active Fleet Nodes ({nodes.length})
                        </h2>
                        <button
                            onClick={() => fetchNodes(true)}
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
                                        <td colSpan={5} className="py-6 text-center text-slate-500">No nodes connected yet.</td>
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