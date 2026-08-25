'use client';
import { useState, useEffect, useCallback, useTransition } from 'react';
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
import { Badge, Button, Modal, PageHeader, StatCard, SplitView, InsightCard } from '@/components/ui';

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

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('admin');
  const [expiryDays, setExpiryDays] = useState(30);
  const [ephemeral, setEphemeral] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState<'key' | 'cmd' | null>(null);

  useEffect(() => {
    if (!open) return;
    getUsersAction().then((us: any[]) => {
      const names = us.map((u: any) => u.name).filter(Boolean);
      if (names.length) { setUsers(names); setSelectedUser(names[0]); }
    }).catch(() => {});
  }, [open]);

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

  return (
    <Modal open={open} onClose={onClose} align="sheet" maxWidth={512} labelledBy="invite-node-title">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-orange" style={{ background: '#FF5A00' }} />
            <h2 id="invite-node-title" className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{step === 'config' ? 'Add Node to Mesh' : 'Node Token Ready'}</h2>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{step === 'config' ? 'Configure and generate a one-time install token' : `Single-use · Expires in ${expiryDays}d · Shown once`}</p>
        </div>
        <button onClick={onClose} className="btn btn-ghost p-1.5 rounded-[8px]" style={{ border: 'none', color: 'var(--text-3)' }} aria-label="Close">
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
          <button
            role="switch"
            aria-checked={ephemeral}
            onClick={() => setEphemeral(e => !e)}
            style={{ background: ephemeral ? '#FF5A00' : 'var(--surface-3)', border: `1px solid ${ephemeral ? 'rgba(255,90,0,0.5)' : 'var(--border-2)'}`, width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 4, left: ephemeral ? 22 : 4, width: 14, height: 14, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </button>
        </div>
        <Button variant="primary" onClick={generate} disabled={generating} className="w-full justify-center" style={{ borderRadius: 12 }}>
          {generating ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</> : 'Generate Token →'}
        </Button>
      </>) : (<>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Auth Key</p>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
            <code className="flex-1 text-[12px] font-mono truncate" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{token}</code>
            <Button variant="ghost" onClick={() => copy(token, 'key')} className="text-[11px] px-2.5 py-1 rounded-[7px] flex-shrink-0">{copied === 'key' ? '✓ Copied' : 'Copy'}</Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Run on the new device</p>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[10px]" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-2)' }}>
            <pre className="flex-1 text-[11.5px] whitespace-pre-wrap break-all leading-relaxed" style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{cmd}</pre>
            <Button variant="ghost" onClick={() => copy(cmd, 'cmd')} className="text-[11px] px-2.5 py-1 rounded-[7px] flex-shrink-0 mt-0.5">{copied === 'cmd' ? '✓' : 'Copy'}</Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => { setStep('config'); setToken(''); }} className="flex-1 justify-center" style={{ borderColor: 'var(--border-2)' }}>← New Token</Button>
          <Button variant="ghost" onClick={onClose} className="flex-1 justify-center" style={{ borderColor: 'var(--border-2)' }}>Done</Button>
        </div>
      </>)}
    </Modal>
  );
}

function relativeTime(d: string) {
  if (!d || d.startsWith('0001')) return 'Never';
  const date = new Date(d);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Pane default state: a live, computed fleet snapshot — never evergreen copy or fake numbers. */
/**
 * Pane default state, consistent with Routes/Keys/Users: surface only what needs a decision,
 * not a second copy of the table. Nothing to flag → nothing shown, instead of restating status
 * that's already visible in the table, the topology badge, and the header stats.
 */
function FleetSnapshot({ nodes }: { nodes: any[] }) {
  const offline = [...nodes]
    .filter(n => !n.online)
    .sort((a, b) => new Date(a.lastSeen || 0).getTime() - new Date(b.lastSeen || 0).getTime());

  return (
    <InsightCard
      title="Needs Attention"
      accent="rgba(248,113,113,0.15)"
      emptyLabel="All nodes are online and reachable."
      items={offline.map(n => ({ label: n.givenName, value: relativeTime(n.lastSeen), tone: 'red' }))}
    />
  );
}

/** Pane selected state: the node inspector — same content the old centered modal showed, now inline. */
function NodeInspector({ node, tags = [], onClose, onRevoke, onRename, onTagsChange }: { node: any; tags?: string[]; onClose: () => void; onRevoke: () => void; onRename: (name: string) => void; onTagsChange: (tags: string[]) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.givenName);
  const [renamePending, startRenameTransition] = useTransition();
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [, startTagTransition] = useTransition();

  const doRename = () => {
    if (!newName.trim() || newName === node.givenName) return setRenaming(false);
    startRenameTransition(async () => { await renameMachineAction(node.id, newName.trim()); onRename(newName.trim()); setRenaming(false); });
  };

  return (
    <div className="rounded-[12px] overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,90,0,0.15)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
        {renaming ? (
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input className="input text-[13px] py-1" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') setRenaming(false); }} autoFocus />
            <button onClick={doRename} disabled={renamePending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11 }}>{renamePending ? '…' : 'Save'}</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-1)' }}>{node.givenName}</h3>
            <button onClick={() => setRenaming(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 2, flexShrink: 0 }} aria-label="Rename node">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        )}
        <button onClick={onClose} style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }} aria-label="Deselect node" title="Deselect">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="p-4 space-y-5">
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
                }} className="hover:text-red-400 transition-colors ml-0.5" style={{ color: 'var(--text-4)' }} aria-label={`Remove tag ${t}`}>×</button>
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
              <Button variant="ghost" onClick={() => { setAddingTag(false); setNewTag(''); }} className="text-[10px] px-2 py-1 h-7">Cancel</Button>
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

        {confirming ? (
          <div className="space-y-2">
            <p className="text-[12px] text-center" style={{ color: 'var(--text-3)' }}>Remove <span style={{ color: 'var(--text-1)' }}>{node.givenName}</span> from the mesh?</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirming(false)} className="flex-1 justify-center text-[12px]">Cancel</Button>
              <Button variant="danger" onClick={onRevoke} className="flex-1 justify-center text-[12px]">Remove</Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirming(true)} className="w-full justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Revoke Node
          </Button>
        )}
      </div>
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
  // Derived from real uptime log samples, not a hardcoded number.
  const uptimePct = uptimeLogs.length > 0 ? (uptimeLogs.filter((l: any) => l.isOnline).length / uptimeLogs.length) * 100 : null;

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
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />
      {apiError && (
        <div className="flex-shrink-0 flex items-center gap-2.5 px-8 py-3" style={{ background: 'rgba(248,113,113,0.06)', borderBottom: '1px solid rgba(248,113,113,0.15)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--red)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-[12px]" style={{ color: 'var(--red)' }}>Headscale API error: {apiError}</p>
        </div>
      )}
      <PageHeader
        title="Node Fleet"
        subtitle={`Updated ${lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every 30s`}
        actions={
          <>
            <Button variant="ghost" onClick={manualRefresh} title="Refresh" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            }>
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleExportCsv} disabled={exporting} title="Export CSV" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            }>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
            <Button variant="primary" onClick={() => setShowInvite(true)} icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }>
              Add Node
            </Button>
          </>
        }
        stats={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
            <StatCard index={1} label="TOTAL NODES" value={visibleNodes.length} />
            <StatCard index={2} label="ONLINE" value={online} color="var(--green)" />
            <StatCard index={3} label="OFFLINE" value={offline} color={offline > 0 ? 'var(--red)' : 'rgba(255,255,255,0.3)'} />
            <StatCard index={4} label="UPTIME" value={uptimePct !== null ? `${uptimePct.toFixed(1)}%` : '—'} color="var(--orange)" />
          </div>
        }
      />

      <SplitView
        paneWidth={300}
        autoOpenSignal={selectedNode?.id ?? null}
        main={
          <>
            {uptimeLogs.length > 0 && <div className="pt-4"><UptimeGraph logs={uptimeLogs} /></div>}
            {/* Table header — no card wrapper */}
            <div className="flex-shrink-0 flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
              <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>Node</span>
              <div className="flex items-center flex-shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider w-[140px]" style={{ color: 'var(--text-3)' }}>Mesh IP</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider w-[120px]" style={{ color: 'var(--text-3)' }}>Last Seen</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider w-[90px]" style={{ color: 'var(--text-3)' }}>Status</span>
                <span className="w-[32px]"></span>
              </div>
            </div>
            {/* Table rows — directly on page, no card */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
              {visibleNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-4)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                  <p className="text-[13px]">No nodes connected</p>
                  <Button variant="primary" onClick={() => setShowInvite(true)} className="text-[12px]" style={{ padding: '8px 16px' }}>Add your first node →</Button>
                </div>
              ) : (
                <>
                  {visibleNodes.map((node, i) => (
                    <div key={node.id}
                      onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedNode(selectedNode?.id === node.id ? null : node); } }}
                      role="button"
                      tabIndex={0}
                      className="animate-fade-in flex items-center justify-between py-3 cursor-pointer table-row-hover row-alt focus-ring"
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
                            ? <Badge variant="green" dot pulse>Online</Badge>
                            : <Badge variant="ghost" dot>Offline</Badge>}
                        </div>
                        <div className="w-[32px] flex justify-end">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-4)', transform: selectedNode?.id === node.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Topology — the one place network shape/status is shown visually;
                      no longer paired with a "Network Health" tile that just restated the
                      header stats and the uptime chart in a different shape. */}
                  <div className="py-6">
                    <div className="rounded-[12px] overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', maxHeight: 280 }}>
                      <NetworkTopology nodes={visibleNodes.map(n => ({
                        id: n.id,
                        name: renamedNodes[n.id] || n.givenName,
                        online: n.online,
                        user: n.user?.name,
                        ip: n.ipAddresses?.[1] || n.ipAddresses?.[0],
                      }))} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        }
        pane={
          selectedNode ? (
            <NodeInspector
              key={selectedNode.id}
              node={{ ...selectedNode, givenName: renamedNodes[selectedNode.id] || selectedNode.givenName }}
              tags={nodeTags[selectedNode.id] || []}
              onClose={() => setSelectedNode(null)}
              onRevoke={() => handleRevoke(selectedNode.id)}
              onRename={name => setRenamedNodes(prev => ({ ...prev, [selectedNode.id]: name }))}
              onTagsChange={tags => setNodeTags(prev => ({ ...prev, [selectedNode.id]: tags }))}
            />
          ) : (
            <FleetSnapshot nodes={visibleNodes} />
          )
        }
      />
    </div>
  );
}
