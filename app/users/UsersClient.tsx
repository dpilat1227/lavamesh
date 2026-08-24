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
    <div className="animate-fade-in grid items-center px-5 py-4 table-row-hover"
      style={{ gridTemplateColumns: '1fr 120px 100px', borderBottom: '1px solid var(--border-1)' }}>

      {/* Name */}
      <div className="flex items-center gap-3 min-w-0">
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

      {/* Node count */}
      <div>
        {typeof user.nodeCount === 'number' ? (
          <span className="badge badge-ghost">{user.nodeCount} node{user.nodeCount !== 1 ? 's' : ''}</span>
        ) : (
          <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>—</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {mode === 'delete' ? (
          <>
            <button onClick={() => setMode('idle')} className="btn btn-ghost text-[11px] px-2.5 py-1.5">Cancel</button>
            <button onClick={doDelete} disabled={isPending} className="btn btn-danger text-[11px] px-2.5 py-1.5">{isPending ? '…' : 'Delete'}</button>
          </>
        ) : mode === 'idle' ? (
          <>
            <button onClick={() => setMode('rename')} className="btn btn-ghost text-[11px] px-2.5 py-1.5">Rename</button>
            <button onClick={() => setMode('delete')} className="btn btn-ghost text-[11px] px-2.5 py-1.5" style={{ color: 'var(--red)' }}>Delete</button>
          </>
        ) : null}
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

      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>Users</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>{localUsers.length} namespace{localUsers.length !== 1 ? 's' : ''} · {Object.values(nodeCounts).reduce((a, b) => a + b, 0)} total nodes</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </button>
      </header>

      <div className="flex-1 overflow-hidden px-8 py-6" style={{ minHeight: 0 }}>
        <div className="card h-full flex flex-col overflow-hidden">
          <div className="flex-shrink-0 grid px-5 py-3" style={{ gridTemplateColumns: '1fr 120px 100px', borderBottom: '1px solid var(--border-1)' }}>
            {['User / Namespace', 'Nodes', ''].map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{h}</span>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {localUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-4)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                </svg>
                <p className="text-[13px]">No users</p>
              </div>
            ) : (
              localUsers.map(u => (
                <UserRow
                  key={u.name}
                  user={u}
                  onDelete={() => setLocalUsers(prev => prev.filter(x => x.name !== u.name))}
                  onRename={newName => setLocalUsers(prev => prev.map(x => x.name === u.name ? { ...x, name: newName } : x))}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
