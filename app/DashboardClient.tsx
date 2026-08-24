'use client';
import { useState } from "react";
import { generatePreAuthKey, revokeNode } from "./actions";

export default function DashboardClient({ nodes }: { nodes: any[] }) {
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const key = await generatePreAuthKey();
      setNewKey(key);
    } catch (err) {}
    setIsGenerating(false);
  };

  const handleRevoke = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Revoke this node?")) {
      await revokeNode(id);
      if (selectedNode?.id === id) setSelectedNode(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "Never";
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const onlineNodes = nodes.filter((n: any) => n.online).length;

  return (
    <div className="relative h-full flex flex-col font-sans">
      <header className="h-24 flex shrink-0 items-center justify-between px-12">
        <h1 className="text-[24px] font-semibold tracking-tight text-white/95">Network Dashboard</h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#222] hover:bg-[#333] text-white text-[13px] font-medium px-5 py-2.5 rounded-full transition-colors border border-white/10 shadow-sm"
          >
            {isGenerating ? "Generating..." : "Generate Auth Key"}
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-0.5">Network Health</span>
            <span className="text-[13px] font-medium text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse"></span>
              All Systems Normal
            </span>
          </div>
        </div>
      </header>

      <div className="px-12 pb-12 flex-1 flex gap-8">
        <div className="flex-1 flex flex-col">
          {newKey && (
            <div className="mb-8 p-5 bg-[#ff5a00]/10 border border-[#ff5a00]/20 rounded-[16px] flex justify-between items-center backdrop-blur-md">
              <div>
                <span className="block text-[13px] font-medium text-[#ff5a00] mb-1.5">New Pre-Auth Key (Single Use, 30 Days)</span>
                <code className="text-white font-mono text-[13px] bg-black/60 px-3 py-1.5 rounded-md border border-white/10">{newKey}</code>
              </div>
              <button onClick={() => setNewKey(null)} className="text-[#ff5a00]/60 hover:text-[#ff5a00] bg-[#ff5a00]/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-5 mb-8 shrink-0">
            {[
              { label: "Total Nodes", value: nodes.length },
              { label: "Active Connections", value: onlineNodes, color: "text-emerald-400" },
              { label: "Subnet Routers", value: 1 }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-6 backdrop-blur-xl shadow-lg">
                <span className="text-[13px] font-medium text-neutral-400">{stat.label}</span>
                <div className="mt-3">
                  <span className={`text-[32px] font-semibold tracking-tight ${stat.color || "text-white"}`}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl ring-1 ring-white/[0.05] rounded-[20px] overflow-hidden shadow-2xl shrink-0">
            <table className="w-full text-left text-[14px] whitespace-nowrap">
              <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                <tr>
                  <th className="py-4 px-6 font-medium text-neutral-400 text-[13px]">Node Name</th>
                  <th className="py-4 px-6 font-medium text-neutral-400 text-[13px]">IP Address</th>
                  <th className="py-4 px-6 font-medium text-neutral-400 text-[13px]">Last Seen</th>
                  <th className="py-4 px-6 font-medium text-neutral-400 text-[13px] text-right">Status</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {nodes.map((node: any) => (
                  <tr key={node.id} onClick={() => setSelectedNode(node)} className="hover:bg-white/[0.03] transition-colors duration-200 group cursor-pointer">
                    <td className="py-4 px-6 font-medium text-white/90 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-white/[0.04] flex items-center justify-center ring-1 ring-white/[0.05] group-hover:bg-white/[0.08] transition-all duration-300">
                        {node.givenName.includes('mac') ? (
                          <svg className="w-4 h-4 text-neutral-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        ) : (
                          <svg className="w-4 h-4 text-neutral-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        )}
                      </div>
                      <span className="tracking-tight">{node.givenName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[12px] text-neutral-400 bg-[#111] px-2 py-1 rounded-md border border-white/[0.05]">
                        {node.ipAddresses[1] || node.ipAddresses[0]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-400 text-[13px]">{formatDate(node.lastSeen)}</td>
                    <td className="py-4 px-6 text-right">
                      {node.online ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20 text-[11px] font-medium tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20 text-[11px] font-medium tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> OFFLINE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={(e) => handleRevoke(node.id, e)} className="text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
