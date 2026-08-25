'use client';
import { useState, useTransition } from 'react';
import { createUserAction, deleteUserAction, renameUserAction } from '@/app/actions';

interface User {
  name: string;
  createdAt?: string;
  nodeCount?: number;
}

function UserRow({ user, onDelete, onRename }: { user: User; onDelete: () => void; onRename: (newName: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'idle' | 'rename' | 'delete'>('idle');
  const [newName, setNewName] = useState(user.name);
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDate = (d?: string) => {
    if (!d || d.startsWith('0001')) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const doRename = () => {
    if (!newName.trim() || newName === user.name) return setMode('idle');
    startTransition(async () => {
      await renameUserAction(user.name, newName.trim());
      onRename(newName.trim());
      setMode('idle');
    });
  };

  const doDelete = () => {
    startTransition(async () => {
      await deleteUserAction(user.name);
      onDelete();
    });
  };

  return (
    <div className="animate-fade-in flex items-center justify-between px-8 py-4 table-row-hover row-alt"
      style={{ borderBottom: '1px solid var(--border-1)', position: 'relative', zIndex: menuOpen ? 20 : 1 }}>

      {/* Left: Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 font-semibold text-[13px]"
          style={{ background: 'rgba(255,90,0,0.08)', border: '1px solid rgba(255,90,0,0.15)', color: 'var(--orange)' }}>
          {user.name[0]?.toUpperCase()}
        </div>
        {mode === 'rename' ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              className="input text-[13px] py-1.5"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') setMode('idle'); }}
              autoFocus
            />
            <button onClick={doRename} disabled={isPending} className="btn btn-primary text-[12px] px-3 py-1.5">{isPending ? '…' : 'Save'}</button>
            <button onClick={() => setMode('idle')} className="btn btn-ghost text-[12px] px-2.5 py-1.5">Cancel</button>
          </div>
        ) : (
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{user.name}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Created {formatDate(user.createdAt)}</p>
          </div>
        )}
      </div>

      {/* Right: Packed Metadata */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-[140px]">
          <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{formatDate(user.createdAt)}</span>
        </div>
        <div className="w-[100px]">
          {typeof user.nodeCount === 'number' ? (
            <span className="badge badge-ghost">{user.nodeCount} node{user.nodeCount !== 1 ? 's' : ''}</span>
          ) : (
            <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end relative">
          {mode === 'delete' ? (
            <>
              <button onClick={() => setMode('idle')} className="btn btn-ghost text-[11px] px-2.5 py-1.5">Cancel</button>
              <button onClick={doDelete} disabled={isPending} className="btn btn-danger text-[11px] px-2.5 py-1.5">{isPending ? '…' : 'Confirm Delete'}</button>
            </>
          ) : mode === 'idle' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                className="btn btn-ghost px-2 py-1.5"
                style={{ minWidth: 'unset' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div className="animate-scale-in glass-menu" style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50,
                    padding: '4px 0', minWidth: 140,
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setMode('rename'); }}
                      className="w-full text-left px-3 py-2 text-[12px] font-medium"
                      style={{ color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      Rename
                    </button>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setMode('delete'); }}
                      className="w-full text-left px-3 py-2 text-[12px] font-medium"
                      style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      Delete User
                    </button>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onAdded }: { onClose: () => void; onAdded: (name: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const create = () => {
    const trimmed = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!trimmed) return setError('Name is required');
    startTransition(async () => {
      try {
        await createUserAction(trimmed);
        onAdded(trimmed);
        onClose();
      } catch (e: any) {
        setError(e?.message || 'Failed to create user');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-scale-in w-full max-w-sm glass-strong rounded-[20px] p-6 space-y-4"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>Add User</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Namespace / Username</label>
          <input
            className="input text-[13px]"
            placeholder="e.g. home, workstation, mobile"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') onClose(); }}
            autoFocus
          />
          {error && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</p>}
          <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Lowercase letters, numbers, hyphens only.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={create} disabled={isPending || !name.trim()} className="btn btn-primary flex-1 justify-center">
            {isPending ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersClient({ users, nodeCounts }: { users: User[]; nodeCounts: Record<string, number> }) {
  const [localUsers, setLocalUsers] = useState(users.map(u => ({ ...u, nodeCount: nodeCounts[u.name] ?? 0 })));
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onAdded={name => setLocalUsers(prev => [...prev, { name, nodeCount: 0 }])}
        />
      )}

      <header className="flex-shrink-0 px-8 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Users</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add User
          </button>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>NAMESPACES </span>
            <span className="text-[16px] font-bold tracking-tight" style={{ color: 'white' }}>{localUsers.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>TOTAL NODES </span>
            <span className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--green)' }}>{Object.values(nodeCounts).reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-8 grid grid-cols-[1fr_300px] gap-8" style={{ minHeight: 0 }}>
        {/* Left Column: Data Table */}
        <div className="flex flex-col min-h-0 relative">
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>User / Namespace</span>
            <div className="flex items-center flex-shrink-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider w-[140px]" style={{ color: 'var(--text-3)' }}>Created</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider w-[100px]" style={{ color: 'var(--text-3)' }}>Nodes</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider w-[50px] text-right" style={{ color: 'var(--text-3)' }}>Action</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {localUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-4)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                </svg>
                <p className="text-[13px]">No users</p>
              </div>
            ) : (
              <>
                {localUsers.map(u => (
                  <UserRow
                    key={u.name}
                    user={u}
                    onDelete={() => setLocalUsers(prev => prev.filter(x => x.name !== u.name))}
                    onRename={newName => setLocalUsers(prev => prev.map(x => x.name === u.name ? { ...x, name: newName } : x))}
                  />
                ))}

              </>
            )}
          </div>
        </div>
        
        {/* Right Column: Context Pane */}
        <div className="flex flex-col gap-4 overflow-y-auto pt-3 pb-8 pr-2 custom-scrollbar">
          <div className="rounded-[12px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.15), transparent)' }} />
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-4)', letterSpacing: '0.08em' }}>About Users &amp; Namespaces</p>
              <div className="flex flex-col gap-6">
                {[
                  { title: 'Namespaces', desc: 'Each user is a namespace that owns nodes and keys. Use namespaces to organize devices by team, environment, or purpose.', icon: '📁', color: '#FF5A00' },
                  { title: 'Access Control', desc: 'Nodes within the same namespace can communicate freely. Cross-namespace access is managed through ACL policies (Pro).', icon: '🔒', color: '#8B5CF6' },
                  { title: 'Node Ownership', desc: 'When a node joins using a key tied to a specific user, it belongs to that namespace. Reassignment requires re-registration.', icon: '🖥️', color: '#34D399' },
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
        </div>
      </div>
    </div>
  );
}
