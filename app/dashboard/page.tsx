'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [authKey, setAuthKey] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const fetchNodes = async () => {
        try {
            const res = await fetch('/api/nodes');
            const data = await res.json();
            if (data.nodes) setNodes(data.nodes);
        } catch (err) {
            console.error(err);
        }
    };

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

    useEffect(() => {
        fetchNodes();
        const interval = setInterval(fetchNodes, 10000);
        return () => clearInterval(interval);
    }, []);

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
                    <h2 className="text-lg font-semibold text-white mb-4">Active Fleet Nodes ({nodes.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-800 text-slate-400 font-mono text-xs">
                                <tr>
                                    <th className="pb-3">Hostname</th>
                                    <th className="pb-3">Mesh IPv4</th>
                                    <th className="pb-3">Last Seen</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                                {nodes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-slate-500">No nodes connected yet.</td>
                                    </tr>
                                ) : (
                                    nodes.map((node) => (
                                        <tr key={node.id}>
                                            <td className="py-3 text-white font-medium">{node.givenName || node.name}</td>
                                            <td className="py-3 text-orange-400">{node.ipAddresses?.[0] || 'N/A'}</td>
                                            <td className="py-3 text-slate-400">{new Date(node.lastSeen).toLocaleTimeString()}</td>
                                            <td className="py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}