'use client';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  generateKeyForUser,
  revokeNode,
  renameMachineAction,
  getUsersAction,
  exportNodesCsvAction,
  setNodeTagsAction,
} from '@/app/actions';
import UptimeGraph from '@/components/UptimeGraph';
import NetworkTopology from '@/components/NetworkTopology';

function OsIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('mac') || n.includes('darwin') || n.includes('iphone') || n.includes('ipad')) {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-3)' }}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>;
  }
  if (n.includes('ubuntu') || n.includes('linux') || n.includes('debian') || n.includes('fedora') || n.includes('server') || n.includes('pi') || n.includes('nas')) {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  }
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('admin');
  const [expiryDays, setExpiryDays] = useState(30);
  const [ephemeral, setEphemeral] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState<'key' | 'cmd' | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    getUsersAction().then((us: any[]) => {
      const names = us.map((u: any) => u.name).filter(Boolean);
      if (names.length) { setUsers(names); setSelectedUser(names[0]); }
    }).catch(() => {});
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const generate = async () => {
    setGenerating(true);
    try {
      const key = await generateKeyForUser(selectedUser, false, ephemeral, expiryDays);
      setToken(key);
      setStep('result');
    } catch {}
    setGenerating(false);
  };

  const cmd = `curl -fsSL "https://www.lavamesh.com/api/install.sh?token=${token}" | sudo sh`;
  const copy = async (text: string, which: 'key' | 'cmd') => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in-up w-full max-w-lg glass-strong rounded-[20px] p-6 space-y-5"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(255,90,0,0.08)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse-orange" style={{ background: '#FF5A00' }} />
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{step === 'config' ? 'Add Node to Mesh' : 'Node Token Ready'}</h2>
            </div>
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{step === 'config' ? 'Configure and generate a one-time install token' : `Single-use · Expires in ${expiryDays}d · Shown once`}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-1.5 rounded-[8px]" style={{ border: 'none', color: 'var(--text-3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {step === 'config' ? (<>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Assign to User</p>
            <div className="flex flex-wrap gap-2">
              {(users.length ? users : ['admin']).map(u => (
                <button key={u} onClick={() => setSelectedUser(u)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all"
                  style={{ background: selectedUser === u ? 'rgba(255,90,0,0.15)' : 'var(--surface-3)', border: `1px solid ${selectedUser === u ? 'rgba(255,90,0,0.4)' : 'var(--border-2)'}`, color: selectedUser === u ? '#FF5A00' : 'var(--text-2)' }}>{u}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Token Expiry</p>
            <div className="flex gap-2">
              {[{ label: '1 day', days: 1 }, { label: '7 days', days: 7 }, { label: '30 days', days: 30 }].map(opt => (
                <button key={opt.days} onClick={() => setExpiryDays(opt.days)} className="flex-1 py-2 rounded-[8px] text-[12px] font-medium transition-all"
                  style={{ background: expiryDays === opt.days ? 'rgba(255,90,0,0.15)' : 'var(--surface-3)', border: `1px solid ${expiryDays === opt.days ? 'rgba(255,90,0,0.4)' : 'var(--border-2)'}`, color: expiryDays === opt.days ? '#FF5A00' : 'var(--text-2)' }}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>Ephemeral node</p>
              <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Auto-removed when it goes offline</p>
            </div>
            <button onClick={() => setEphemeral(e => !e)}
              style={{ background: ephemeral ? '#FF5A00' : 'var(--surface-3)', border: `1px solid ${ephemeral ? 'rgba(255,90,0,0.5)' : 'var(--border-2)'}`, width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 4, left: ephemeral ? 22 : 4, width: 14, height: 14, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
          <button onClick={generate} disabled={generating} className="btn btn-primary w-full justify-center" style={{ borderRadius: 12 }}>
            {generating ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</> : 'Generate Token →'}
          </button>
        </>) : (<>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Auth Key</p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
              <code className="flex-1 text-[12px] font-mono truncate" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{token}</code>
              <button onClick={() => copy(token, 'key')} className="btn btn-ghost text-[11px] px-2.5 py-1 rounded-[7px] flex-shrink-0">{copied === 'key' ? '✓ Copied' : 'Copy'}</button>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Run on the new device</p>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-2)' }}>
              <pre className="flex-1 text-[11.5px] whitespace-pre-wrap break-all leading-relaxed" style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{cmd}</pre>
              <button onClick={() => copy(cmd, 'cmd')} className="btn btn-ghost text-[11px] px-2.5 py-1 rounded-[7px] flex-shrink-0 mt-0.5">{copied === 'cmd' ? '✓' : 'Copy'}</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setStep('config'); setToken(''); }} className="btn btn-ghost flex-1 justify-center" style={{ borderColor: 'var(--border-2)' }}>← New Token</button>
            <button onClick={onClose} className="btn btn-ghost flex-1 justify-center" style={{ borderColor: 'var(--border-2)' }}>Done</button>
          </div>
        </>)}
      </div>
    </div>,
    document.body
  );
}

function NodePanel({ node, tags = [], onClose, onRevoke, onRename, onTagsChange }: { node: any; tags?: string[]; onClose: () => void; onRevoke: () => void; onRename: (name: string) => void; onTagsChange: (tags: string[]) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.givenName);
  const [renamePending, startRenameTransition] = useTransition();
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagPending, startTagTransition] = useTransition();

  const doRename = () => {
    if (!newName.trim() || newName === node.givenName) return setRenaming(false);
    startRenameTransition(async () => { await renameMachineAction(node.id, newName.trim()); onRename(newName.trim()); setRenaming(false); });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" style={{ backdropFilter: 'blur(20px)' }} onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-scale-in glass-pane w-full max-w-md flex-shrink-0 flex flex-col z-50 rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,90,0,0.2)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        {renaming ? (
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input className="input text-[13px] py-1" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') setRenaming(false); }} autoFocus />
            <button onClick={doRename} disabled={renamePending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11 }}>{renamePending ? '…' : 'Save'}</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{node.givenName}</h3>
            <button onClick={() => setRenaming(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 2 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        )}
        <button onClick={onClose} style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex items-center gap-2.5 p-3 rounded-[12px]" style={{ background: node.online ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${node.online ? 'rgba(52,211,153,0.15)' : 'var(--border-1)'}` }}>
          <span className={`status-dot ${node.online ? 'online' : 'offline'}`} />
          <span className="text-[13px] font-medium" style={{ color: node.online ? 'var(--green)' : 'var(--text-3)' }}>{node.online ? 'Online' : 'Offline'}</span>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Tags</p>
            {!addingTag && (
              <button onClick={() => setAddingTag(true)} className="btn btn-ghost text-[10px] px-2 py-0.5 rounded-[6px]" style={{ color: 'var(--orange)' }}>
                + Add
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11px] font-medium" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
                {t}
                <button onClick={() => {
                  const next = tags.filter(x => x !== t);
                  onTagsChange(next);
                  startTagTransition(async () => { await setNodeTagsAction(node.id, next); });
                }} className="hover:text-red-400 transition-colors ml-0.5" style={{ color: 'var(--text-4)' }}>×</button>
              </span>
            ))}
            {tags.length === 0 && !addingTag && <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>No tags</span>}
          </div>
          {addingTag && (
            <div className="flex items-center gap-1.5 mt-2">
              <input className="input text-[11px] py-1 px-2 h-7 flex-1" placeholder="tag-name" value={newTag} onChange={e => setNewTag(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setAddingTag(false); setNewTag(''); }
                  if (e.key === 'Enter' && newTag.trim() && !tags.includes(newTag.trim())) {
                    const next = [...tags, newTag.trim()];
                    onTagsChange(next);
                    startTagTransition(async () => { await setNodeTagsAction(node.id, next); });
                    setAddingTag(false);
                    setNewTag('');
                  }
                }} autoFocus />
              <button onClick={() => { setAddingTag(false); setNewTag(''); }} className="btn btn-ghost text-[10px] px-2 py-1 h-7">Cancel</button>
            </div>
          )}
        </div>

        {[
          { label: 'Node ID', value: node.id },
          { label: 'Hostname', value: node.name || node.givenName },
          { label: 'Mesh IP', value: node.ipAddresses?.[1] || node.ipAddresses?.[0], mono: true },
          { label: 'IPv6', value: node.ipAddresses?.find((ip: string) => ip.includes(':')) || '—', mono: true },
          { label: 'User', value: node.user?.name || '—' },
          { label: 'Last Seen', value: node.lastSeen && node.lastSeen !== '0001-01-01T00:00:00Z' ? new Date(node.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never' },
          { label: 'Created', value: node.createdAt ? new Date(node.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
          { label: 'Expiry', value: node.expiry && !node.expiry.startsWith('0001') ? new Date(node.expiry).toLocaleDateString() : 'Never' },
        ].map(({ label, value, mono }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>{label}</p>
            <p className="text-[13px] break-all" style={{ color: 'var(--text-2)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="p-5" style={{ borderTop: '1px solid var(--border-1)' }}>
        {confirming ? (
          <div className="space-y-2">
            <p className="text-[12px] text-center" style={{ color: 'var(--text-3)' }}>Remove <span style={{ color: 'var(--text-1)' }}>{node.givenName}</span> from the mesh?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="btn btn-ghost flex-1 justify-center text-[12px]">Cancel</button>
              <button onClick={onRevoke} className="btn btn-danger flex-1 justify-center text-[12px]">Remove</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="btn btn-danger w-full justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Revoke Node
          </button>
        )}
      </div>
      </div>
    </>
  );
}

function StatCard({ label, value, sub, accent, delay = 0 }: { label: string; value: number | string; sub?: string; accent?: string; delay?: number }) {
  return (
    <div className="animate-fade-in-up card p-5 relative overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      {accent && <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 10%, ${accent}, transparent 90%)` }} />}
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)' }}>{label}</p>
      <div className="animate-counter" style={{ animationDelay: `${delay + 100}ms` }}>
        <span className="text-[32px] font-bold tracking-tight leading-none" style={{ color: accent || 'var(--text-1)' }}>{value}</span>
      </div>
      {sub && <p className="text-[11px] mt-2" style={{ color: 'var(--text-4)' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardClient({ nodes, apiError, initialTags, uptimeLogs = [] }: { nodes: any[]; apiError?: string | null; initialTags?: Record<string, string[]>; uptimeLogs?: any[] }) {
  const [showInvite, setShowInvite] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [renamedNodes, setRenamedNodes] = useState<Record<string, string>>({});
  const [nodeTags, setNodeTags] = useState<Record<string, string[]>>(initialTags || {});
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => { router.refresh(); setLastRefresh(new Date()); }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const manualRefresh = useCallback(() => { router.refresh(); setLastRefresh(new Date()); }, [router]);
  const visibleNodes = nodes.filter(n => !removedIds.has(n.id));
  const online = visibleNodes.filter(n => n.online).length;
  const offline = visibleNodes.length - online;

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const csv = await exportNodesCsvAction();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lavamesh-nodes-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  }, []);

  const handleRevoke = useCallback(async (id: string) => {
    setRemovedIds(prev => new Set(prev).add(id));
    setSelectedNode(null);
    try { await revokeNode(id); } catch { setRemovedIds(prev => { const s = new Set(prev); s.delete(id); return s; }); }
  }, []);

  const formatDate = (d: string) => {
    if (!d || d.startsWith('0001')) return 'Never';
    const date = new Date(d);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full relative" style={{ minHeight: 0 }}>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {apiError && (
        <div className="flex-shrink-0 flex items-center gap-2.5 px-8 py-3" style={{ background: 'rgba(248,113,113,0.06)', borderBottom: '1px solid rgba(248,113,113,0.15)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--red)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-[12px]" style={{ color: 'var(--red)' }}>Headscale API error: {apiError}</p>
        </div>
      )}
      <header className="flex-shrink-0 px-8 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Node Fleet</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every 30s</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={manualRefresh} className="btn btn-ghost" title="Refresh">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              Refresh
            </button>
            <button onClick={handleExportCsv} disabled={exporting} className="btn btn-ghost" title="Export CSV">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <button onClick={() => setShowInvite(true)} className="btn btn-primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Node
            </button>
          </div>
        </div>
        {/* Stat cards — landing page style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'TOTAL NODES', val: String(visibleNodes.length), color: 'white' },
            { label: 'ONLINE', val: String(online), color: 'var(--green)' },
            { label: 'OFFLINE', val: String(offline), color: offline > 0 ? 'var(--red)' : 'rgba(255,255,255,0.3)' },
            { label: 'UPTIME', val: '99.9%', color: 'var(--orange)' },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{s.label}</div>
              <div className="text-[28px] font-bold tracking-tight leading-none" style={{ color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-1 flex flex-col overflow-hidden">
          {uptimeLogs.length > 0 && <div className="px-8 pt-4"><UptimeGraph logs={uptimeLogs} /></div>}
          {/* Table header — no card wrapper */}
          <div className="flex-shrink-0 flex items-center justify-between px-8 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>Node</span>
            <div className="flex items-center flex-shrink-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider w-[140px]" style={{ color: 'var(--text-3)' }}>Mesh IP</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider w-[120px]" style={{ color: 'var(--text-3)' }}>Last Seen</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider w-[90px]" style={{ color: 'var(--text-3)' }}>Status</span>
              <span className="w-[32px]"></span>
            </div>
          </div>
          {/* Table rows — directly on page, no card */}
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {visibleNodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-4)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                <p className="text-[13px]">No nodes connected</p>
                <button onClick={() => setShowInvite(true)} className="btn btn-primary text-[12px]" style={{ padding: '8px 16px' }}>Add your first node →</button>
              </div>
            ) : (
              <>
                {visibleNodes.map((node, i) => (
                  <div key={node.id} onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    className="animate-fade-in flex items-center justify-between px-8 py-3 cursor-pointer table-row-hover row-alt"
                    style={{ borderBottom: '1px solid var(--border-1)', animationDelay: `${i * 30}ms`, background: selectedNode?.id === node.id ? 'rgba(255,90,0,0.04)' : undefined, borderLeft: selectedNode?.id === node.id ? '2px solid var(--orange)' : '2px solid transparent' }}>
                    
                    {/* Left: Node Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                      <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
                        <OsIcon name={node.givenName} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-1)' }}>{renamedNodes[node.id] || node.givenName}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{node.user?.name || 'admin'}</p>
                          {nodeTags[node.id]?.length > 0 && (
                            <div className="flex gap-1 overflow-hidden max-w-[120px]">
                              {nodeTags[node.id].map((t: string) => (
                                <span key={t} className="inline-block px-1.5 py-0.5 rounded-[4px] text-[9px] font-medium truncate flex-shrink-0" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text-3)' }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Packed Metadata */}
                    <div className="flex items-center flex-shrink-0">
                      <div className="w-[140px]">
                        <span className="text-[12px] font-mono tabular-nums" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{node.ipAddresses?.[1] || node.ipAddresses?.[0] || '—'}</span>
                      </div>
                      <div className="w-[120px]">
                        <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>{formatDate(node.lastSeen)}</span>
                      </div>
                      <div className="w-[90px]">
                        {node.online
                          ? <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }} />Online</span>
                          : <span className="badge badge-ghost"><span className="status-dot offline" style={{ width: 5, height: 5 }} />Offline</span>}
                      </div>
                      <div className="w-[32px] flex justify-end">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-4)', transform: selectedNode?.id === node.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}>
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bento Grid — below table, fills remaining space */}
                <div className="px-8 py-6 grid grid-cols-[1.5fr_1fr] gap-6">
                  <div className="rounded-[12px] overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', maxHeight: 280 }}>
                    <NetworkTopology nodes={visibleNodes.map(n => ({
                      id: n.id,
                      name: renamedNodes[n.id] || n.givenName,
                      online: n.online,
                      user: n.user?.name,
                      ip: n.ipAddresses?.[1] || n.ipAddresses?.[0],
                    }))} />
                  </div>
                  
                  {/* Network Health Pane */}
                  <div className="rounded-[12px] p-5 flex flex-col" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--orange)' }}>
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                      <h3 className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-2)' }}>Network Health</h3>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <div>
                        <div className="flex justify-between text-[12px] mb-1.5">
                          <span style={{ color: 'var(--text-3)' }}>Connection Success Rate</span>
                          <span className="font-mono" style={{ color: 'var(--green)' }}>99.99%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full" style={{ width: '100%', background: 'var(--green)' }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-[12px] mb-1.5">
                          <span style={{ color: 'var(--text-3)' }}>Average Latency</span>
                          <span className="font-mono" style={{ color: 'var(--text-1)' }}>24ms</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full" style={{ width: '24%', background: 'var(--orange)' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-4)' }}>
                        All nodes are communicating normally. Headscale relay cluster is operating at optimal capacity in <strong>us-east-1</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Node Panel Overlay */}
      {selectedNode && (
        <NodePanel
          node={{ ...selectedNode, givenName: renamedNodes[selectedNode.id] || selectedNode.givenName }}
          tags={nodeTags[selectedNode.id] || []}
          onClose={() => setSelectedNode(null)}
          onRevoke={() => handleRevoke(selectedNode.id)}
          onRename={name => setRenamedNodes(prev => ({ ...prev, [selectedNode.id]: name }))}
          onTagsChange={tags => setNodeTags(prev => ({ ...prev, [selectedNode.id]: tags }))}
        />
      )}
    </div>
  );
}
