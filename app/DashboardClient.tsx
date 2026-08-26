'use client';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  generateKeyForUser,
  revokeNode,
  expireNodeAction,
  renameMachineAction,
  getUsersAction,
  exportNodesCsvAction,
  setNodeTagsAction,
  createUserAction,
} from '@/app/actions';
import NetworkTopology from '@/components/NetworkTopology';
import FleetOverview from '@/components/FleetOverview';
import { Badge, Button, ConfirmDialog, IconChip, Modal, PageHeader, SplitView, InsightCard } from '@/components/ui';

/** Per-OS accent so the device chips carry Copilot-style category color variety
 *  instead of everything reading green-when-online (which made the fleet look
 *  monochrome). Color = device kind, status stays in the badge/dot. */
function osKind(name: string): 'apple' | 'linux' | 'other' {
  const n = name.toLowerCase();
  if (n.includes('mac') || n.includes('darwin') || n.includes('iphone') || n.includes('ipad')) return 'apple';
  if (n.includes('ubuntu') || n.includes('linux') || n.includes('debian') || n.includes('fedora') || n.includes('server') || n.includes('pi') || n.includes('nas')) return 'linux';
  return 'other';
}
const OS_ACCENT: Record<ReturnType<typeof osKind>, string> = {
  apple: 'var(--blue)',
  linux: 'var(--amber)',
  other: 'var(--purple)',
};

function OsIcon({ name }: { name: string }) {
  const kind = osKind(name);
  if (kind === 'apple') {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>;
  }
  if (kind === 'linux') {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  }
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
}

function InviteModal({ open, onClose, onTokenIssued }: { open: boolean; onClose: () => void; onTokenIssued: () => void }) {
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('admin');
  const [expiryDays, setExpiryDays] = useState(30);
  const [ephemeral, setEphemeral] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState<'key' | 'cmd' | null>(null);
  const [error, setError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPending, startNewUserTransition] = useTransition();
  const [newUserError, setNewUserError] = useState('');

  useEffect(() => {
    if (!open) return;
    getUsersAction().then((us: any[]) => {
      const names = us.map((u: any) => u.name).filter(Boolean);
      if (names.length) { setUsers(names); setSelectedUser(names[0]); }
    }).catch(() => {});
  }, [open]);

  const submitNewUser = () => {
    const trimmed = newUserName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!trimmed) return setNewUserError('Name is required');
    startNewUserTransition(async () => {
      try {
        await createUserAction(trimmed);
        setUsers(prev => prev.includes(trimmed) ? prev : [trimmed, ...prev]);
        setSelectedUser(trimmed);
        setCreatingUser(false);
        setNewUserName('');
        setNewUserError('');
      } catch (e: any) {
        setNewUserError(e?.message || 'Failed to create user');
      }
    });
  };

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const key = await generateKeyForUser(selectedUser, false, ephemeral, expiryDays);
      if (!key) throw new Error('Headscale did not return a key');
      setToken(key);
      setStep('result');
      onTokenIssued();
    } catch (e: any) {
      setError(e?.message || 'Failed to generate token');
    }
    setGenerating(false);
  };

  const cmd = `curl -fsSL "${typeof window !== 'undefined' ? window.location.origin : ''}/api/install.sh?token=${token}${ephemeral ? '&ephemeral=true' : ''}" | sudo sh`;
  const copy = async (text: string, which: 'key' | 'cmd') => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setCreatingUser(false);
    setNewUserName('');
    setNewUserError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} align="sheet" maxWidth={512} labelledBy="invite-node-title">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-orange" style={{ background: '#ff7300' }} />
            <h2 id="invite-node-title" className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{step === 'config' ? 'Add Node to Mesh' : 'Node Token Ready'}</h2>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{step === 'config' ? 'Configure and generate a one-time install token' : `Single-use · Expires in ${expiryDays}d · Shown once`}</p>
        </div>
        <button onClick={handleClose} className="btn btn-ghost p-1.5 rounded-[8px]" style={{ border: 'none', color: 'var(--text-3)' }} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {step === 'config' ? (<>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Assign to User</p>
          <div className="flex flex-wrap gap-2">
            {(users.length ? users : ['admin']).map(u => (
              <button key={u} onClick={() => setSelectedUser(u)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all"
                style={{ background: selectedUser === u ? 'rgba(255,115,0,0.15)' : 'var(--surface-3)', border: `1px solid ${selectedUser === u ? 'rgba(255,115,0,0.4)' : 'var(--border-2)'}`, color: selectedUser === u ? '#ff7300' : 'var(--text-2)' }}>{u}</button>
            ))}
            {!creatingUser && (
              <button onClick={() => setCreatingUser(true)} className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all flex items-center gap-1"
                style={{ background: 'transparent', border: '1px dashed var(--border-3)', color: 'var(--text-4)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New user
              </button>
            )}
          </div>
          {/* Lets someone provisioning their very first node create the user right
              here, instead of forcing a detour to the Users tab and back. */}
          {creatingUser && (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                className="input text-[12px] py-1.5 px-2.5 flex-1"
                placeholder="e.g. home, workstation"
                value={newUserName}
                onChange={e => { setNewUserName(e.target.value); setNewUserError(''); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitNewUser();
                  if (e.key === 'Escape') { setCreatingUser(false); setNewUserName(''); setNewUserError(''); }
                }}
                autoFocus
              />
              <Button variant="primary" onClick={submitNewUser} disabled={newUserPending} className="text-[11px] px-3 py-1.5">{newUserPending ? '…' : 'Create'}</Button>
              <Button variant="ghost" onClick={() => { setCreatingUser(false); setNewUserName(''); setNewUserError(''); }} className="text-[11px] px-2.5 py-1.5">Cancel</Button>
            </div>
          )}
          {newUserError && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{newUserError}</p>}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Token Expiry</p>
          <div className="flex gap-2">
            {[{ label: '1 day', days: 1 }, { label: '7 days', days: 7 }, { label: '30 days', days: 30 }].map(opt => (
              <button key={opt.days} onClick={() => setExpiryDays(opt.days)} className="flex-1 py-2 rounded-[8px] text-[12px] font-medium transition-all"
                style={{ background: expiryDays === opt.days ? 'rgba(255,115,0,0.15)' : 'var(--surface-3)', border: `1px solid ${expiryDays === opt.days ? 'rgba(255,115,0,0.4)' : 'var(--border-2)'}`, color: expiryDays === opt.days ? '#ff7300' : 'var(--text-2)' }}>{opt.label}</button>
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
            style={{ background: ephemeral ? '#ff7300' : 'var(--surface-3)', border: `1px solid ${ephemeral ? 'rgba(255,115,0,0.5)' : 'var(--border-2)'}`, width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 4, left: ephemeral ? 22 : 4, width: 14, height: 14, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </button>
        </div>
        {error && (
          <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>
        )}
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
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-4)' }}>
            <span className="status-dot online" style={{ width: 5, height: 5 }} />
            Once it connects, the node appears on this page automatically — usually within a few seconds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => { setStep('config'); setToken(''); }} className="flex-1 justify-center" style={{ borderColor: 'var(--border-2)' }}>← New Token</Button>
          <Button variant="ghost" onClick={handleClose} className="flex-1 justify-center" style={{ borderColor: 'var(--border-2)' }}>Done</Button>
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
function FleetSnapshot({ nodes, onSelect }: { nodes: any[]; onSelect: (node: any) => void }) {
  const offline = [...nodes]
    .filter(n => !n.online)
    .sort((a, b) => new Date(a.lastSeen || 0).getTime() - new Date(b.lastSeen || 0).getTime());

  return (
    <InsightCard
      title="Needs Attention"
      accent="rgba(245,158,11,0.15)"
      emptyLabel="All nodes are online and reachable."
      items={offline.map(n => ({ label: n.givenName, value: relativeTime(n.lastSeen), tone: 'red', onClick: () => onSelect(n) }))}
    />
  );
}

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>{label}</p>
      <button onClick={copy} className="flex items-center gap-1.5 group min-w-0 max-w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
        <p className="text-[13px] truncate" style={{ color: 'var(--text-2)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</p>
        <span className="text-[10px] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-4)' }}>{copied ? '✓' : 'copy'}</span>
      </button>
    </div>
  );
}

/** Pane selected state: the node inspector — same content the old centered modal showed, now inline. */
function NodeInspector({ node, tags = [], onClose, onRevoke, onExpire, onRename, onTagsChange }: { node: any; tags?: string[]; onClose: () => void; onRevoke: () => void; onExpire: () => void; onRename: (name: string) => void; onTagsChange: (tags: string[]) => void }) {
  const [confirming, setConfirming] = useState<'revoke' | 'expire' | null>(null);
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
    <div className="rounded-[12px] overflow-hidden flex flex-col" style={{ background: 'var(--surface-card)', border: '1px solid rgba(255,115,0,0.15)' }}>
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
        <div className="flex items-center gap-2.5 p-3 rounded-[12px]" style={{ background: node.online ? 'rgba(61,220,132,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${node.online ? 'rgba(61,220,132,0.15)' : 'var(--border-1)'}` }}>
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

        {/* 2-col grid for short/scannable fields; full-width only for the
            longer identifiers. IPv6 is dropped entirely when absent instead
            of showing a dead "—" row. */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <CopyField label="Mesh IP" value={node.ipAddresses?.[1] || node.ipAddresses?.[0] || '—'} />
          {node.ipAddresses?.find((ip: string) => ip.includes(':')) && (
            <CopyField label="IPv6" value={node.ipAddresses.find((ip: string) => ip.includes(':'))} />
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>User</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{node.user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Last Seen</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{node.lastSeen && node.lastSeen !== '0001-01-01T00:00:00Z' ? new Date(node.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Created</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{node.createdAt ? new Date(node.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Expiry</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{node.expiry && !node.expiry.startsWith('0001') ? new Date(node.expiry).toLocaleDateString() : 'Never'}</p>
          </div>
        </div>
        <CopyField label="Node ID" value={node.id} />

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setConfirming('expire')} className="flex-1 justify-center text-[12px]">
            Expire
          </Button>
          <Button variant="danger" onClick={() => setConfirming('revoke')} className="flex-1 justify-center text-[12px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Revoke
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming === 'revoke'}
        title="Remove node from mesh"
        description={<>Remove <strong style={{ color: 'var(--text-1)' }}>{node.givenName}</strong> from the mesh? It will need a new install token to rejoin.</>}
        confirmLabel="Remove"
        tone="danger"
        onConfirm={onRevoke}
        onClose={() => setConfirming(null)}
      />
      <ConfirmDialog
        open={confirming === 'expire'}
        title="Expire node"
        description={<>Expire <strong style={{ color: 'var(--text-1)' }}>{node.givenName}</strong>? It stays registered but must reauthenticate to reconnect.</>}
        confirmLabel="Expire"
        tone="primary"
        onConfirm={onExpire}
        onClose={() => setConfirming(null)}
      />
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
  // Bumped to 5s for ~2 minutes right after a token is issued, so a node that
  // joins while the "run this on the device" modal is still open shows up
  // almost immediately instead of waiting out the idle 30s cadence.
  const [fastPollUntil, setFastPollUntil] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => { router.refresh(); setLastRefresh(new Date()); };
    const interval = setInterval(tick, fastPollUntil && Date.now() < fastPollUntil ? 5000 : 30000);
    return () => clearInterval(interval);
  }, [router, fastPollUntil]);

  const manualRefresh = useCallback(() => { router.refresh(); setLastRefresh(new Date()); }, [router]);
  const handleTokenIssued = useCallback(() => {
    const until = Date.now() + 2 * 60 * 1000;
    setFastPollUntil(until);
    router.refresh();
    // fastPollUntil is a fixed timestamp, so the interval effect above won't
    // re-run on its own once the window lapses — this nudges it to revert to
    // the idle 30s cadence instead of polling every 5s indefinitely.
    setTimeout(() => setFastPollUntil(v => (v === until ? null : v)), 2 * 60 * 1000 + 500);
  }, [router]);
  const visibleNodes = nodes.filter(n => !removedIds.has(n.id));
  const online = visibleNodes.filter(n => n.online).length;
  const offline = visibleNodes.length - online;
  // Derived from real uptime log samples, not a hardcoded number.
  const uptimePct = uptimeLogs.length > 0 ? (uptimeLogs.filter((l: any) => l.isOnline).length / uptimeLogs.length) * 100 : null;
  // Trend: second half of the logged window vs. the first half — same "direction, not
  // just a snapshot" idea as the uptime chart's headline callout.
  const uptimeTrend = (() => {
    if (uptimeLogs.length < 8) return undefined;
    const mid = Math.floor(uptimeLogs.length / 2);
    const pct = (arr: any[]) => (arr.filter(l => l.isOnline).length / arr.length) * 100;
    const delta = pct(uptimeLogs.slice(mid)) - pct(uptimeLogs.slice(0, mid));
    return Math.abs(delta) >= 0.1 ? { value: delta, label: 'vs. earlier today' } : undefined;
  })();

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

  const handleExpire = useCallback(async (id: string) => {
    try { await expireNodeAction(id); router.refresh(); } catch {}
  }, [router]);

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
    <div className="flex flex-col h-full relative overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onTokenIssued={handleTokenIssued} />
      {apiError && (
        <div className="flex-shrink-0 flex items-center gap-2.5 px-8 py-3" style={{ background: 'rgba(248,113,113,0.06)', borderBottom: '1px solid rgba(248,113,113,0.15)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--red)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-[12px]" style={{ color: 'var(--red)' }}>Headscale API error: {apiError}</p>
        </div>
      )}
      <PageHeader
        title="Node Fleet"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <span className="status-dot online" style={{ width: 6, height: 6 }} />
            Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · auto-refreshes every 30s
          </span>
        }
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
      />

      <div className="px-8 pt-1 pb-4 flex-shrink-0">
        <FleetOverview
          total={visibleNodes.length}
          online={online}
          offline={offline}
          uptimePct={uptimePct}
          uptimeTrend={uptimeTrend}
          uptimeLogs={uptimeLogs}
        />
      </div>

      <SplitView
        columns={4}
        scroll="page"
        autoOpenSignal={selectedNode?.id ?? null}
        main={
          <>
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
            <div className="pt-1">
              {visibleNodes.length === 0 ? (
                <div
                  className="animate-fade-in-up flex flex-col items-center justify-center text-center py-20 px-8 gap-4 my-4"
                  style={{ borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-2)', background: 'rgba(255,255,255,0.015)' }}
                >
                  <div
                    className="w-14 h-14 rounded-[16px] flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(255,115,0,0.14), rgba(255,115,0,0.02))', border: '1px solid rgba(255,115,0,0.18)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>Your mesh is empty</p>
                    <p className="text-[12.5px] mt-1 max-w-[280px]" style={{ color: 'var(--text-4)' }}>Add your first node to start building your network — it takes under a minute.</p>
                  </div>
                  <Button variant="primary" onClick={() => setShowInvite(true)} className="text-[12px]" style={{ padding: '9px 18px' }}>Add your first node →</Button>
                </div>
              ) : (
                <>
                  {visibleNodes.map((node, i) => (
                    <div key={node.id}
                      onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedNode(selectedNode?.id === node.id ? null : node); } }}
                      role="button"
                      tabIndex={0}
                      className="animate-fade-in flex items-center justify-between py-3 px-2 -mx-2 cursor-pointer table-row-hover row-alt focus-ring lift-row-hover"
                      style={{ borderBottom: '1px solid var(--border-1)', animationDelay: `${i * 30}ms`, background: selectedNode?.id === node.id ? 'rgba(255,115,0,0.04)' : undefined, borderLeft: selectedNode?.id === node.id ? '2px solid var(--orange)' : '2px solid transparent' }}>

                      {/* Left: Node Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                        <IconChip
                          size={32}
                          radius={9}
                          glow={false}
                          style={{
                            color: OS_ACCENT[osKind(node.givenName)],
                            background: `color-mix(in srgb, ${OS_ACCENT[osKind(node.givenName)]} 12%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${OS_ACCENT[osKind(node.givenName)]} 26%, transparent)`,
                            opacity: node.online ? 1 : 0.55,
                          }}
                        >
                          <OsIcon name={node.givenName} />
                        </IconChip>
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
                          <span className="text-[12px] font-mono" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{node.ipAddresses?.[1] || node.ipAddresses?.[0] || '—'}</span>
                        </div>
                        <div className="w-[120px]">
                          <span className="text-[12px]" style={{ color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>{formatDate(node.lastSeen)}</span>
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
                  <div className="pt-8 mt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)', letterSpacing: '0.09em' }}>Network Topology</p>
                      <div className="flex-1 h-px" style={{ background: 'var(--border-1)' }} />
                    </div>
                    <NetworkTopology nodes={visibleNodes.map(n => ({
                      id: n.id,
                      name: renamedNodes[n.id] || n.givenName,
                      online: n.online,
                      user: n.user?.name,
                      ip: n.ipAddresses?.[1] || n.ipAddresses?.[0],
                    }))} />
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
              onExpire={() => handleExpire(selectedNode.id)}
              onRename={name => setRenamedNodes(prev => ({ ...prev, [selectedNode.id]: name }))}
              onTagsChange={tags => setNodeTags(prev => ({ ...prev, [selectedNode.id]: tags }))}
            />
          ) : (
            <FleetSnapshot nodes={visibleNodes} onSelect={setSelectedNode} />
          )
        }
      />
    </div>
  );
}
