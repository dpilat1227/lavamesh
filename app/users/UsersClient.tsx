'use client';
import { useEffect, useState, useTransition } from 'react';
import { createUserAction, deleteUserAction, renameUserAction } from '@/app/actions';
import { Badge, Button, ConfirmDialog, Modal, ModalHeader, PageHeader, SplitView, ContextSection, InsightCard, HealthMeter } from '@/components/ui';

interface NodeSummary {
  id: string;
  givenName: string;
  online: boolean;
  lastSeen: string;
}

interface User {
  name: string;
  createdAt?: string;
  nodeCount?: number;
}

function formatDate(d?: string) {
  if (!d || d.startsWith('0001')) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function UserRow({ user, selected, highlighted, onSelect }: { user: User; selected: boolean; highlighted?: boolean; onSelect: () => void }) {
  const nodeBadge = typeof user.nodeCount === 'number' ? (
    user.nodeCount > 0 ? (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold tabular-nums"
        style={{ color: 'var(--text-accent)', background: 'color-mix(in srgb, var(--text-accent) 16%, transparent)', border: '1px solid color-mix(in srgb, var(--text-accent) 28%, transparent)' }}
      >
        {user.nodeCount} node{user.nodeCount !== 1 ? 's' : ''}
      </span>
    ) : (
      <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>0 nodes</span>
    )
  ) : (
    <span className="text-[12px]" style={{ color: 'var(--text-4)' }}>—</span>
  );
  const chevron = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-4)', transform: selected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  return (
    <div
      id={`user-row-${user.name}`}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      role="button"
      tabIndex={0}
      className="animate-fade-in cursor-pointer table-row-hover row-alt focus-ring lift-row-hover"
      style={{
        borderBottom: '1px solid var(--border-1)',
        borderLeft: selected ? '2px solid var(--orange)' : '2px solid transparent',
        background: highlighted ? 'rgba(255,115,0,0.08)' : selected ? 'rgba(255,115,0,0.04)' : undefined,
        transition: 'background 0.8s ease',
      }}
    >
      {/* Desktop / tablet */}
      <div className="user-row-desktop flex items-center justify-between px-8 py-4">
        {/* Left: Name */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 font-semibold text-[13px]"
            style={{ background: 'rgba(255,115,0,0.08)', border: '1px solid rgba(255,115,0,0.15)', color: 'var(--orange)' }}>
            {user.name[0]?.toUpperCase()}
          </div>
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-1)' }}>{user.name}</p>
        </div>

        {/* Right: Packed Metadata */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-[140px]">
            <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{formatDate(user.createdAt)}</span>
          </div>
          <div className="w-[100px]">{nodeBadge}</div>
          <div className="w-[24px] flex justify-end">{chevron}</div>
        </div>
      </div>

      {/* Mobile: stacked card */}
      <div className="user-row-mobile" style={{ display: 'none', padding: '14px 16px' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 font-semibold text-[13px]"
            style={{ background: 'rgba(255,115,0,0.08)', border: '1px solid rgba(255,115,0,0.15)', color: 'var(--orange)' }}>
            {user.name[0]?.toUpperCase()}
          </div>
          <p className="text-[13px] font-medium truncate flex-1 min-w-0" style={{ color: 'var(--text-1)' }}>{user.name}</p>
          {chevron}
        </div>
        <div className="flex items-center justify-between pl-[44px]">
          <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{formatDate(user.createdAt)}</span>
          {nodeBadge}
        </div>
      </div>
    </div>
  );
}

/** Pane selected state, mirroring the Nodes tab's inspector pattern: name +
 *  rename affordance up top, key facts, this namespace's nodes, then the one
 *  destructive action — all in one place instead of splitting Rename into a
 *  row-level menu and Delete into another. */
function UserInspector({ user, nodes, onClose, onRename, onDelete }: { user: User; nodes: NodeSummary[]; onClose: () => void; onRename: (name: string) => void; onDelete: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [renamePending, startRenameTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [renameError, setRenameError] = useState('');

  const doRename = () => {
    const trimmed = newName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!trimmed || trimmed === user.name) return setRenaming(false);
    setRenameError('');
    startRenameTransition(async () => {
      try {
        await renameUserAction(user.name, trimmed);
        onRename(trimmed);
        setRenaming(false);
      } catch (e: any) {
        setRenameError(e?.message || 'Failed to rename');
      }
    });
  };

  const doDelete = async () => {
    await deleteUserAction(user.name);
    onDelete();
  };

  const onlineCount = nodes.filter(n => n.online).length;

  return (
    <div className="rounded-[12px] overflow-hidden flex flex-col" style={{ background: 'var(--surface-card)', border: '1px solid rgba(255,115,0,0.15)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
        {renaming ? (
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input className="input text-[13px] py-1" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') setRenaming(false); }} autoFocus />
            <button onClick={doRename} disabled={renamePending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11, flexShrink: 0 }}>{renamePending ? '…' : 'Save'}</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-1)' }}>{user.name}</h3>
            <button onClick={() => { setNewName(user.name); setRenaming(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 2, flexShrink: 0 }} aria-label="Rename user">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
          </div>
        )}
        <button onClick={onClose} style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }} aria-label="Deselect user" title="Deselect">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {renameError && <p className="text-[11px]" style={{ color: 'var(--red)' }}>{renameError}</p>}

        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Created</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-4)' }}>Nodes</p>
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{nodes.length === 0 ? 'None yet' : `${onlineCount}/${nodes.length} online`}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-4)' }}>Devices in this namespace</p>
          {nodes.length === 0 ? (
            <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>No nodes yet — generate a key for this user on the Keys tab.</p>
          ) : (
            <div className="space-y-1.5">
              {nodes.map(n => (
                <div key={n.id} className="flex items-center gap-2 px-2.5 py-2 rounded-[8px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
                  <span className={`status-dot ${n.online ? 'online' : 'offline'}`} />
                  <span className="text-[12.5px] truncate flex-1" style={{ color: 'var(--text-2)' }}>{n.givenName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="danger" onClick={() => setConfirmingDelete(true)} className="w-full justify-center text-[12px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
          Delete User
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete user"
        description={
          nodes.length > 0
            ? <>Delete <strong style={{ color: 'var(--text-1)' }}>{user.name}</strong>? It still owns {nodes.length} node{nodes.length !== 1 ? 's' : ''} — deleting the namespace won&apos;t remove them from the mesh, but they&apos;ll lose their owner.</>
            : <>Delete <strong style={{ color: 'var(--text-1)' }}>{user.name}</strong>? This can&apos;t be undone.</>
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={doDelete}
        onClose={() => setConfirmingDelete(false)}
      />
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

export default function UsersClient({ users, nodeCounts, nodesByUser = {} }: { users: User[]; nodeCounts: Record<string, number>; nodesByUser?: Record<string, NodeSummary[]> }) {
  const [localUsers, setLocalUsers] = useState(users.map(u => ({ ...u, nodeCount: nodeCounts[u.name] ?? 0 })));
  const [showAdd, setShowAdd] = useState(false);
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  useEffect(() => { setLocalUsers(users.map(u => ({ ...u, nodeCount: nodeCounts[u.name] ?? 0 }))); }, [users, nodeCounts]);

  const totalNodes = Object.values(nodeCounts).reduce((a, b) => a + b, 0);
  const selectedUser = localUsers.find(u => u.name === selectedUserName) || null;

  const focusUser = (name: string) => {
    document.getElementById(`user-row-${name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedUser(name);
    setTimeout(() => setHighlightedUser(null), 1600);
  };

  const table = (
    <div className="flex flex-col min-h-0 relative">
      <div className="flex-shrink-0 pb-3 px-8">
        <HealthMeter
          segments={[
            /* "Empty" (no nodes yet) isn't a warning — it's a neutral, expected
               state for a brand-new invite — so it gets the same deepened blue
               as the Keys bar instead of amber, which reads as "something's
               wrong" and clashed sitting next to green anyway. */
            { label: 'with nodes', count: localUsers.filter(u => (u.nodeCount ?? 0) > 0).length, color: '#22d98a' },
            { label: 'empty', count: localUsers.filter(u => (u.nodeCount ?? 0) === 0).length, color: '#3b82f6' },
          ]}
        />
      </div>
      <div className="user-row-desktop flex-shrink-0 flex items-center justify-between px-8 py-3" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--text-3)' }}>User / Namespace</span>
        <div className="flex items-center flex-shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider w-[140px]" style={{ color: 'var(--text-3)' }}>Created</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider w-[100px]" style={{ color: 'var(--text-3)' }}>Nodes</span>
          <span className="w-[24px]"></span>
        </div>
      </div>
      <div className="pt-1">
        {localUsers.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center py-16 px-8 gap-4 my-4"
            style={{ borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-2)', background: 'rgba(255,255,255,0.015)' }}
          >
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-1)' }}>Namespaces organize who owns which nodes</p>
            <p className="text-[12.5px] max-w-[300px]" style={{ color: 'var(--text-4)' }}>Create a user, generate a key for it, and every device that joins with that key lives in this namespace.</p>
            <Button variant="primary" onClick={() => setShowAdd(true)} className="text-[12px]" style={{ padding: '9px 18px' }}>Add your first user →</Button>
          </div>
        ) : (
          localUsers.map(u => (
            <UserRow
              key={u.name}
              user={u}
              selected={selectedUserName === u.name}
              highlighted={highlightedUser === u.name}
              onSelect={() => setSelectedUserName(prev => prev === u.name ? null : u.name)}
            />
          ))
        )}
      </div>
    </div>
  );

  const emptyNamespaces = localUsers.filter(u => (u.nodeCount ?? 0) === 0);

  const defaultPane = (
    <>
      <InsightCard
        title="Needs Attention"
        accent="rgba(245,158,11,0.15)"
        emptyLabel="Every namespace has at least one node."
        items={emptyNamespaces.map(u => ({
          label: `${u.name} — no nodes yet, generate a key`,
          tone: 'amber',
          onClick: () => focusUser(u.name),
        }))}
      />
      <ContextSection
        title="About Users &amp; Namespaces"
        collapsible
        items={[
          { title: 'Namespaces', desc: 'Each user is a namespace that owns nodes and keys. Use namespaces to organize devices by team, environment, or purpose.', icon: '📁', color: '#ff7300' },
          { title: 'Access Control', desc: 'Nodes within the same namespace can communicate freely. Cross-namespace access is managed through ACL policies (Pro).', icon: '🔒', color: '#8B5CF6' },
          { title: 'Node Ownership', desc: 'When a node joins using a key tied to a specific user, it belongs to that namespace. Reassignment requires re-registration.', icon: '🖥️', color: '#3ddc84' },
        ]}
      />
    </>
  );

  return (
    <div className="flex flex-col h-full relative overflow-y-auto custom-scrollbar" style={{ minHeight: 0 }}>
      <AddUserModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={name => setLocalUsers(prev => [...prev, { name, nodeCount: 0 }])}
      />

      <PageHeader
        title="Users"
        subtitle={`${localUsers.length} namespace${localUsers.length === 1 ? '' : 's'} · ${totalNodes} node${totalNodes === 1 ? '' : 's'}`}
        actions={
          <Button variant="primary" onClick={() => setShowAdd(true)} icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          }>
            Add User
          </Button>
        }
      />

      <SplitView
        scroll="page"
        autoOpenSignal={selectedUserName}
        main={table}
        pane={
          selectedUser ? (
            <UserInspector
              key={selectedUser.name}
              user={selectedUser}
              nodes={nodesByUser[selectedUser.name] || []}
              onClose={() => setSelectedUserName(null)}
              onRename={newName => {
                setLocalUsers(prev => prev.map(x => x.name === selectedUser.name ? { ...x, name: newName } : x));
                setSelectedUserName(newName);
              }}
              onDelete={() => {
                setLocalUsers(prev => prev.filter(x => x.name !== selectedUser.name));
                setSelectedUserName(null);
              }}
            />
          ) : defaultPane
        }
      />
    </div>
  );
}
