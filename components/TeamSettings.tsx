'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamSettings({ members }: { members: any[] }) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to invite user');
      } else {
        setSuccess('User granted access successfully');
        setEmail('');
        router.refresh(); // Reload to show the new member in the list
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setInviting(false);
  };

  return (
    <div className="animate-fade-in-up card p-6 overflow-hidden relative" style={{ animationDelay: '240ms' }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)' }} />
      <h2 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Team Management</h2>
      <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>Manage who has access to this LavaMesh network</p>

      {/* Current Members */}
      <div className="space-y-2 mb-6">
        {members.map((m: any) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-[12px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{m.user?.name || m.user?.email}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>{m.user?.email}</p>
            </div>
            <span className="badge badge-ghost capitalize">{m.role.toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="flex gap-2">
        <input 
          type="email" 
          placeholder="colleague@company.com" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input flex-1 text-[13px] py-2" 
          required 
        />
        <button 
          type="submit" 
          disabled={inviting || !email} 
          className="btn btn-primary px-4 py-2"
          style={{ opacity: inviting || !email ? 0.6 : 1 }}
        >
          {inviting ? 'Inviting...' : 'Grant Access'}
        </button>
      </form>

      {error && <p className="text-[12px] mt-3" style={{ color: 'var(--red)' }}>{error}</p>}
      {success && <p className="text-[12px] mt-3" style={{ color: 'var(--green)' }}>{success}</p>}
    </div>
  );
}
