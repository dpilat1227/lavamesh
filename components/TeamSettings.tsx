'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@/components/ui';

export default function TeamSettings({ members, isPro, seatLimit }: { members: any[]; isPro: boolean; seatLimit: number }) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const atSeatLimit = !isPro && members.length >= seatLimit;

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
    <Card accent="#3b82f6" padded={false} className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
      <div className="p-6">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-1)' }}>Team Management</h2>
        {!isPro && (
          <Badge variant={atSeatLimit ? 'amber' : 'ghost'} className="text-[10px]">{members.length} / {seatLimit} seats</Badge>
        )}
      </div>
      <p className="text-[12px] mb-4" style={{ color: 'var(--text-4)' }}>Manage who has access to this LavaMesh network</p>

      {/* Current Members */}
      <div className="space-y-2 mb-6">
        {members.map((m: any) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-[12px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{m.user?.name || m.user?.email}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>{m.user?.email}</p>
            </div>
            <Badge className="capitalize">{m.role.toLowerCase()}</Badge>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      {atSeatLimit ? (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.16)' }}>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
            Free plan is limited to {seatLimit} team members. Upgrade for unlimited seats.
          </p>
          <a href="/#pricing" className="btn btn-primary text-[12px] flex-shrink-0" style={{ padding: '7px 16px' }}>Upgrade →</a>
        </div>
      ) : (
        <form onSubmit={handleInvite} className="flex gap-2">
          <input 
            type="email" 
            placeholder="colleague@company.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input flex-1 text-[13px] py-2" 
            required 
          />
          <Button
            type="submit"
            variant="primary"
            disabled={inviting || !email}
            className="px-4 py-2"
            style={{ opacity: inviting || !email ? 0.6 : 1 }}
          >
            {inviting ? 'Inviting...' : 'Grant Access'}
          </Button>
        </form>
      )}

      {error && <p className="text-[12px] mt-3" style={{ color: 'var(--red)' }}>{error}</p>}
      {success && <p className="text-[12px] mt-3" style={{ color: 'var(--green)' }}>{success}</p>}
      </div>
    </Card>
  );
}
