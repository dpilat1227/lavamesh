'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { expireKeyAction, generateKeyForUser } from '@/app/actions';
import { Badge, Button, Modal, ModalHeader, PageHeader, StatCard, SplitView, ContextSection, UpsellCard, InsightCard } from '@/components/ui';

interface PreAuthKey {
  id?: string;
  key: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  expiration: string;
  createdAt: string;
  user?: { name: string };
}

function KeyRow({ k, onExpire }: { k: PreAuthKey; onExpire: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const expired = k.expiration ? new Date(k.expiration) < new Date() : false;
  const isValid = !expired && !k.used;
  const userName = k.user?.name || 'admin';

  const copy = async () => {
    await navigator.clipboard.writeText(k.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expire = () => {
    startTransition(async () => {
      await expireKeyAction(userName, k.key);
      onExpire();
      router.refresh();
    });
  };

  const formatDate = (d: string) => {
    if (!d || d.startsWith('0001')) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  return (
    <div className="animate-fade-in grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr_1fr] gap-4 items-center px-8 py-4 table-row-hover row-alt"
      style={{ borderBottom: '1px solid var(--border-1)' }}>

      <div className="flex items-center gap-2.5 min-w-0 pr-4">
        <button onClick={copy} className="flex items-center gap-2 min-w-0 group" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
          <code className="text-[11.5px] truncate max-w-[220px]" style={{ color: isValid ? 'var(--green)' : 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{k.key.slice(0, 28)}…</code>
          <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-4)' }}>{copied ? '✓' : 'copy'}</span>
        </button>
      </div>

      <div>
        <span className="text-[12px] truncate block" style={{ color: 'var(--text-3)' }}>{userName}</span>
      </div>
      <div>
        <span className="text-[12px]" style={{ color: k.reusable ? 'var(--text-2)' : 'var(--text-4)' }}>{k.reusable ? 'Yes' : '—'}</span>
      </div>
      <div>
        <span className="text-[12px]" style={{ color: k.ephemeral ? 'var(--amber)' : 'var(--text-4)' }}>{k.ephemeral ? 'Yes' : '—'}</span>
      </div>
      <div>
        {expired ? (
          <Badge variant="ghost">Expired</Badge>
        ) : k.used ? (
          <Badge variant="ghost">Used</Badge>
        ) : (
          <Badge variant="green" dot pulse>Active</Badge>
        )}
      </div>
      <div>
        <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{formatDate(k.expiration)}</span>
      </div>
      <div className="flex justify-end">
        {isValid ? (
          confirmed ? (
            <div className="flex gap-1.5">
              <Button variant="ghost" onClick={() => setConfirmed(false)} className="text-[11px] px-2 py-1 rounded-[7px]">Cancel</Button>
              <Button variant="danger" onClick={expire} disabled={isPending} className="text-[11px] px-2 py-1 rounded-[7px]">{isPending ? '…' : 'Expire'}</Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmed(true)} className="text-[11px] px-3 py-1.5 rounded-[8px]" style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.15)' }}>Revoke</Button>
          )
        ) : (
          <Button variant="ghost" disabled className="text-[11px] px-3 py-1.5 rounded-[8px]" style={{ opacity: 0.3, cursor: 'not-allowed' }}>Revoke</Button>
        )}
      </div>
    </div>
  );
}

function GenerateModal({ open, users, onClose, onGenerated }: { open: boolean; users: string[]; onClose: () => void; onGenerated: (key: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState(users[0] || 'admin');
  const [reusable, setReusable] = useState(false);
  const [ephemeral, setEphemeral] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    startTransition(async () => {
      const key = await generateKeyForUser(user, reusable, ephemeral, expiryDays);
      setNewKey(key);
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth={448} labelledBy="generate-key-title">
      <ModalHeader
        id="generate-key-title"
        title={newKey ? 'Key Generated' : 'Generate Pre-Auth Key'}
        subtitle={newKey ? 'Copy this key — it will not be shown again in full.' : 'Configure a new provisioning key'}
        onClose={onClose}
      />

      {newKey ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-3 rounded-[10px]" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <code className="flex-1 text-[12px] break-all" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{newKey}</code>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={copy} className="flex-1 justify-center text-[13px]">{copied ? '✓ Copied' : 'Copy Key'}</Button>
            <Button variant="primary" onClick={() => { onGenerated(newKey); onClose(); }} className="flex-1 justify-center text-[13px]">Done</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>User / Namespace</label>
            <select value={user} onChange={e => setUser(e.target.value)}
              className="input text-[13px]" style={{ background: 'rgba(0,0,0,0.4)' }}>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Reusable', desc: 'Key can be used multiple times', val: reusable, set: setReusable },
              { label: 'Ephemeral', desc: 'Node removed when disconnected', val: ephemeral, set: setEphemeral },
            ].map(({ label, desc, val, set }) => (
              <button key={label} onClick={() => set(!val)}
                className="text-left p-3 rounded-[12px] transition-all"
                style={{ background: val ? 'rgba(255,90,0,0.08)' : 'var(--surface-3)', border: `1px solid ${val ? 'rgba(255,90,0,0.2)' : 'var(--border-2)'}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-1)' }}>{label}</span>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: val ? 'var(--orange)' : 'var(--border-3)', background: val ? 'var(--orange)' : 'transparent' }}>
                    {val && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-4)' }}>{desc}</p>
              </button>
            ))}
          </div>

          {/* Expiry */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Expires in</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 7, 30, 90].map(d => (
                <button key={d} onClick={() => setExpiryDays(d)}
                  className="py-2 rounded-[8px] text-[12px] font-medium transition-all"
                  style={{ background: expiryDays === d ? 'rgba(255,90,0,0.12)' : 'var(--surface-3)', border: `1px solid ${expiryDays === d ? 'rgba(255,90,0,0.25)' : 'var(--border-2)'}`, color: expiryDays === d ? 'var(--orange)' : 'var(--text-3)' }}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" onClick={generate} disabled={isPending} className="w-full justify-center">
            {isPending ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</> : 'Generate Key'}
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default function KeysClient({ keys, users, isPro }: { keys: PreAuthKey[]; users: string[]; isPro: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [localKeys, setLocalKeys] = useState(keys);

  const active = localKeys.filter(k => !k.used && new Date(k.expiration) > new Date()).length;
  const now = Date.now();
  const expiringSoon = localKeys.filter(k => {
    if (k.used || !k.expiration) return false;
    const msLeft = new Date(k.expiration).getTime() - now;
    return msLeft > 0 && msLeft < 7 * 24 * 60 * 60 * 1000;
  }).sort((a, b) => new Date(a.expiration).getTime() - new Date(b.expiration).getTime());

  const table = (
    <div className="flex flex-col min-h-0 relative h-full">
      <div className="flex-shrink-0 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr_1fr] gap-4 items-center px-8 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Key</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>User</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Reusable</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Ephemeral</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Status</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Expires</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-3)' }}>Action</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
        {localKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-4)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            <p className="text-[13px]">No keys yet</p>
            <p className="text-[12px]">Generate a key to provision nodes onto the mesh</p>
          </div>
        ) : (
          [...localKeys].sort((a, b) => {
            const getStatus = (k: typeof a) => {
              const expired = k.expiration && new Date(k.expiration) < new Date();
              if (!expired && !k.used) return 0;
              if (k.used) return 1;
              return 2;
            };
            return getStatus(a) - getStatus(b);
          }).map((k) => (
            <KeyRow
              key={k.key}
              k={k}
              onExpire={() =>
                setLocalKeys(prev =>
                  prev.map(x =>
                    x.key === k.key
                      ? { ...x, expiration: new Date(Date.now() - 1000).toISOString() }
                      : x
                  )
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );

  const pane = (
    <>
      <InsightCard
        title="Expiring Soon"
        accent="rgba(245,158,11,0.15)"
        emptyLabel="No active keys expire in the next 7 days."
        items={expiringSoon.map(k => ({
          label: `${k.key.slice(0, 12)}… · ${k.user?.name || 'admin'}`,
          value: new Date(k.expiration).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tone: 'amber',
        }))}
      />
      <ContextSection
        title="About Pre-Auth Keys"
        accent="rgba(255,90,0,0.15)"
        collapsible
        items={[
          { title: 'What are they?', desc: 'Pre-auth keys let new devices join your mesh network without manual approval. Share a key, run the install command, and the node connects instantly.', icon: '🔑', color: '#FF5A00' },
          { title: 'Reusable vs One-Time', desc: 'Reusable keys can provision multiple nodes. One-time keys expire after a single use — ideal for secure provisioning.', icon: '♻️', color: '#8B5CF6' },
          { title: 'Ephemeral Nodes', desc: 'Keys marked ephemeral create nodes that auto-deregister when they go offline. Perfect for CI/CD runners or temp environments.', icon: '⏱️', color: '#34D399' },
        ]}
      />
      {isPro ? (
        <UpsellCard
          eyebrow="Pro Feature"
          eyebrowColor="var(--green)"
          title="Advanced ACLs"
          description="Build tag-based access rules visually, no HuJSON required — head to Settings → Access Control Policy."
          href="/settings"
          ctaLabel="Open ACL builder"
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          }
        />
      ) : (
        <UpsellCard
          eyebrow="Pro Feature"
          eyebrowColor="var(--orange)"
          title="Advanced ACLs"
          description="Lock down your mesh network with tag-based access control policies — build rules visually in Settings on LavaMesh Pro."
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          }
        />
      )}
    </>
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <GenerateModal
        open={showModal}
        users={users}
        onClose={() => setShowModal(false)}
        onGenerated={() => { /* revalidation handles refresh */ }}
      />

      <PageHeader
        title="Pre-Auth Keys"
        subtitle={`${active} active · ${localKeys.length} total`}
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)} icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          }>
            Generate Key
          </Button>
        }
        stats={
          <div className="grid grid-cols-2 gap-4">
            <StatCard index={1} label="ACTIVE KEYS" value={active} color="var(--green)" />
            <StatCard index={2} label="TOTAL KEYS" value={localKeys.length} />
          </div>
        }
      />

      <SplitView main={table} pane={pane} />
    </div>
  );
}
