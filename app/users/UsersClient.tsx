'use client';
import { useState, useTransition } from 'react';
import { createUserAction, deleteUserAction, renameUserAction } from '@/app/actions';
import { Badge, Button, Modal, ModalHeader, PageHeader, StatCard, SplitView, ContextSection, InsightCard } from '@/components/ui';

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
            <Button variant="primary" onClick={doRename} disabled={isPending} className="text-[12px] px-3 py-1.5">{isPending ? '…' : 'Save'}</Button>
            <Button variant="ghost" onClick={() => setMode('idle')} className="text-[12px] px-2.5 py-1.5">Cancel</Button>
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
            <Badge variant="ghost">{user.nodeCount} node{user.nodeCount !== 1 ? 's' : ''}</Badge>
          ) : (
            <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end relative">
          {mode === 'delete' ? (
            <>
              <Button variant="ghost" onClick={() => setMode('idle')} className="text-[11px] px-2.5 py-1.5">Cancel</Button>
              <Button variant="danger" onClick={doDelete} disabled={isPending} className="text-[11px] px-2.5 py-1.5">{isPending ? '…' : 'Confirm Delete'}</Button>
            </>
          ) : mode === 'idle' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                className="btn btn-ghost px-2 py-1.5"
                style={{ minWidth: 'unset' }}
                aria-label={`Actions for ${user.name}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
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

function AddUserModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (name: string) => void }) {
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
    <Modal open={open} onClose={onClose} maxWidth={384} labelledBy="add-user-title">
      <ModalHeader id="add-user-title" title="Add User" onClose={onClose} />
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
        <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
        <Button variant="primary" onClick={create} disabled={isPending || !name.trim()} className="flex-1 justify-center">
          {isPending ? 'Creating…' : 'Create User'}
        </Button>
      </div>
    </Modal>
  );
}

export default function UsersClient({ users, nodeCounts }: { users: User[]; nodeCounts: Record<string, number> }) {
  const [localUsers, setLocalUsers] = useState(users.map(u => ({ ...u, nodeCount: nodeCounts[u.name] ?? 0 })));
  const [showAdd, setShowAdd] = useState(false);

  const totalNodes = Object.values(nodeCounts).reduce((a, b) => a + b, 0);

  const table = (
    <div className="flex flex-col min-h-0 relative h-full">
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>User / Namespace</span>
        <div className="flex items-center flex-shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider w-[140px]" style={{ color: 'var(--text-3)' }}>Created</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider w-[100px]" style={{ color: 'var(--text-3)' }}>Nodes</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider w-[50px] text-right" style={{ color: 'var(--text-3)' }}>Action</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
        {localUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-4)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
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
  );

  const emptyNamespaces = localUsers.filter(u => (u.nodeCount ?? 0) === 0);

  const pane = (
    <>
      <InsightCard
        title="Needs Attention"
        accent="rgba(245,158,11,0.15)"
        emptyLabel="Every namespace has at least one node."
        items={emptyNamespaces.map(u => ({ label: u.name, value: '0 nodes', tone: 'amber' }))}
      />
      <ContextSection
        title="About Users &amp; Namespaces"
        accent="rgba(52,211,153,0.15)"
        collapsible
        items={[
          { title: 'Namespaces', desc: 'Each user is a namespace that owns nodes and keys. Use namespaces to organize devices by team, environment, or purpose.', icon: '📁', color: '#FF5A00' },
          { title: 'Access Control', desc: 'Nodes within the same namespace can communicate freely. Cross-namespace access is managed through ACL policies (Pro).', icon: '🔒', color: '#8B5CF6' },
          { title: 'Node Ownership', desc: 'When a node joins using a key tied to a specific user, it belongs to that namespace. Reassignment requires re-registration.', icon: '🖥️', color: '#34D399' },
        ]}
      />
    </>
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <AddUserModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={name => setLocalUsers(prev => [...prev, { name, nodeCount: 0 }])}
      />

      <PageHeader
        title="Users"
        actions={
          <Button variant="primary" onClick={() => setShowAdd(true)} icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          }>
            Add User
          </Button>
        }
        stats={
          <div className="grid grid-cols-2 gap-4">
            <StatCard index={1} label="NAMESPACES" value={localUsers.length} />
            <StatCard index={2} label="TOTAL NODES" value={totalNodes} color="var(--green)" />
          </div>
        }
      />

      <SplitView main={table} pane={pane} />
    </div>
  );
}
