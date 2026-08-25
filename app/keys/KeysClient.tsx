'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { expireKeyAction, generateKeyForUser } from '@/app/actions';

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
  };  return (
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
          <span className="badge badge-ghost">Expired</span>
        ) : k.used ? (
          <span className="badge badge-ghost">Used</span>
        ) : (
          <span className="badge badge-green"><span className="status-dot online" style={{ width: 5, height: 5 }}></span>Active</span>
        )}
      </div>
      <div>
        <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{formatDate(k.expiration)}</span>
      </div>
      <div className="flex justify-end">
        {isValid ? (
          confirmed ? (
            <div className="flex gap-1.5">
              <button onClick={() => setConfirmed(false)} className="btn btn-ghost text-[11px] px-2 py-1 rounded-[7px]">Cancel</button>
              <button onClick={expire} disabled={isPending} className="btn btn-danger text-[11px] px-2 py-1 rounded-[7px]">{isPending ? '…' : 'Expire'}</button>
            </div>
          ) : (
            <button onClick={() => setConfirmed(true)} className="btn btn-ghost text-[11px] px-3 py-1.5 rounded-[8px]" style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.15)' }}>Revoke</button>
          )
        ) : (
          <button disabled className="btn btn-ghost text-[11px] px-3 py-1.5 rounded-[8px]" style={{ opacity: 0.3, cursor: 'not-allowed' }}>Revoke</button>
        )}
      </div>
    </div>
  );
}

function GenerateModal({ users, onClose, onGenerated }: { users: string[]; onClose: () => void; onGenerated: (key: string) => void }) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-scale-in w-full max-w-md glass-strong rounded-[20px] p-6 space-y-5"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)' }}>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{newKey ? 'Key Generated' : 'Generate Pre-Auth Key'}</h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{newKey ? 'Copy this key — it will not be shown again in full.' : 'Configure a new provisioning key'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {newKey ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-3 rounded-[10px]" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <code className="flex-1 text-[12px] break-all" style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{newKey}</code>
            </div>
            <div className="flex gap-2">
              <button onClick={copy} className="btn btn-ghost flex-1 justify-center text-[13px]">{copied ? '✓ Copied' : 'Copy Key'}</button>
              <button onClick={() => { onGenerated(newKey); onClose(); }} className="btn btn-primary flex-1 justify-center text-[13px]">Done</button>
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

            <button onClick={generate} disabled={isPending} className="btn btn-primary w-full justify-center">
              {isPending ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75"/></svg> Generating…</> : 'Generate Key'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KeysClient({ keys, users }: { keys: PreAuthKey[]; users: string[] }) {
  const [showModal, setShowModal] = useState(false);
  const [localKeys, setLocalKeys] = useState(keys);

  const active = localKeys.filter(k => !k.used && new Date(k.expiration) > new Date()).length;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {showModal && (
        <GenerateModal
          users={users}
          onClose={() => setShowModal(false)}
          onGenerated={() => { /* revalidation handles refresh */ }}
        />
      )}

      <header className="flex-shrink-0 flex items-center justify-between px-8 pt-5 pb-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Pre-Auth Keys</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>
            {active} active · {localKeys.length} total
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Generate Key
        </button>
      </header>

      <div className="flex-1 overflow-hidden px-8 grid grid-cols-[1fr_300px] gap-8" style={{ minHeight: 0 }}>
        {/* Left Column: Data Table */}
        <div className="flex flex-col min-h-0 relative">
          <div className="flex-shrink-0 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr_1fr] gap-4 items-center px-8 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Key</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>User</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Reusable</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Ephemeral</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Status</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Expires</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-3)' }}>Action</span>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {localKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-4)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                <p className="text-[13px]">No keys yet</p>
                <p className="text-[12px]">Generate a key to provision nodes onto the mesh</p>
              </div>
            ) : (
              <>
                {[...localKeys].sort((a, b) => {
                  // Active keys first, then used, then expired
                  const getStatus = (k: typeof a) => {
                    const expired = k.expiration && new Date(k.expiration) < new Date();
                    if (!expired && !k.used) return 0; // active
                    if (k.used) return 1;
                    return 2; // expired
                  };
                  return getStatus(a) - getStatus(b);
                }).map((k, i) => (
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
                ))}

              </>
            )}
          </div>
        </div>
        
        {/* Right Column: Context Pane */}
        <div className="flex flex-col gap-4 overflow-y-auto pt-3 pb-8 pr-2 custom-scrollbar">
          <div className="rounded-[12px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,90,0,0.15), transparent)' }} />
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>About Pre-Auth Keys</p>
              <div className="flex flex-col gap-6">
                {[
                  { title: 'What are they?', desc: 'Pre-auth keys let new devices join your mesh network without manual approval. Share a key, run the install command, and the node connects instantly.', icon: '🔑', color: '#FF5A00' },
                  { title: 'Reusable vs One-Time', desc: 'Reusable keys can provision multiple nodes. One-time keys expire after a single use — ideal for secure provisioning.', icon: '♻️', color: '#8B5CF6' },
                  { title: 'Ephemeral Nodes', desc: 'Keys marked ephemeral create nodes that auto-deregister when they go offline. Perfect for CI/CD runners or temp environments.', icon: '⏱️', color: '#34D399' },
                ].map(item => (
                  <div key={item.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px]" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>{item.icon}</div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>{item.title}</p>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="rounded-[12px] overflow-hidden p-5 flex flex-col gap-3 relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
               </svg>
             </div>
             <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--orange)', letterSpacing: '0.08em' }}>Pro Feature</p>
             <h3 className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>Advanced ACLs</h3>
             <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>Lock down your mesh network with tag-based access control policies. Coming soon to LavaMesh Pro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
