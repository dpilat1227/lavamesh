'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getTagGroupsAction, previewAclBuilderPolicyAction, applyAclBuilderPolicyAction } from '@/app/actions';
import { Badge, Button } from '@/components/ui';

interface TagGroupNode {
  id: string;
  name: string;
  ip: string | null;
}
interface TagGroup {
  tag: string;
  nodes: TagGroupNode[];
}
interface Rule {
  id: string;
  srcTag: string;
  dstTag: string;
  ports: string;
}

const newRule = (): Rule => ({ id: Math.random().toString(36).slice(2), srcTag: '', dstTag: '', ports: '*' });

function RuleSelect({ value, onChange, groups, placeholder }: { value: string; onChange: (v: string) => void; groups: TagGroup[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input text-[12px] py-1.5"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <option value="">{placeholder}</option>
      {groups.map(g => (
        <option key={g.tag} value={g.tag}>
          {g.tag} ({g.nodes.length} node{g.nodes.length === 1 ? '' : 's'})
        </option>
      ))}
    </select>
  );
}

export default function AclBuilder({ isPro }: { isPro: boolean }) {
  const [groups, setGroups] = useState<TagGroup[] | null>(null);
  const [rules, setRules] = useState<Rule[]>([newRule()]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isPro) return;
    getTagGroupsAction().then(setGroups).catch(() => setGroups([]));
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.16)' }}>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          Build tag-based access rules visually — no HuJSON required — on the Pro or Cloud plan.
        </p>
        <a href="/#pricing" className="btn btn-primary text-[12px] flex-shrink-0" style={{ padding: '7px 16px' }}>Upgrade →</a>
      </div>
    );
  }

  if (groups === null) {
    return <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>Loading tags…</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-4)' }}>
        No tagged nodes yet. Add tags to nodes from the{' '}
        <a href="/dashboard" style={{ color: 'var(--orange)' }}>Dashboard</a>, then come back here to build rules
        between them — e.g. <code style={{ fontFamily: 'var(--font-mono)' }}>servers</code> →{' '}
        <code style={{ fontFamily: 'var(--font-mono)' }}>databases</code> on port 5432.
      </p>
    );
  }

  const updateRule = (id: string, patch: Partial<Rule>) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
    setPreview(null);
    setApplied(false);
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setPreview(null);
    setApplied(false);
  };

  const rulesReady = rules.length > 0 && rules.every(r => r.srcTag && r.dstTag && r.ports.trim());

  const handlePreview = () => {
    setError('');
    startTransition(async () => {
      try {
        const policy = await previewAclBuilderPolicyAction(rules);
        setPreview(policy);
        setApplied(false);
      } catch (e: any) {
        setError(e?.message || 'Failed to generate preview');
      }
    });
  };

  const handleApply = () => {
    setError('');
    startTransition(async () => {
      try {
        await applyAclBuilderPolicyAction(rules);
        setApplied(true);
        router.refresh();
      } catch (e: any) {
        setError(e?.message || 'Failed to apply policy');
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center gap-2 px-3 py-2 rounded-[10px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)' }}>
            <RuleSelect value={rule.srcTag} onChange={v => updateRule(rule.id, { srcTag: v })} groups={groups} placeholder="Source tag…" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <RuleSelect value={rule.dstTag} onChange={v => updateRule(rule.id, { dstTag: v })} groups={groups} placeholder="Destination tag…" />
            <input
              value={rule.ports}
              onChange={e => updateRule(rule.id, { ports: e.target.value })}
              placeholder="* or 22,443"
              className="input text-[12px] py-1.5 w-[110px] flex-shrink-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <button
              onClick={() => removeRule(rule.id)}
              aria-label="Remove rule"
              className="w-6 h-6 flex items-center justify-center rounded-[6px] flex-shrink-0 transition-colors"
              style={{ color: 'var(--text-4)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={() => setRules(prev => [...prev, newRule()])} className="text-[12px] px-3 py-1.5">
        + Add rule
      </Button>

      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-4)' }}>
        Rules resolve to each tag&apos;s current node IPs. Applying merges a marked block into your existing
        policy — hand-written ACLs, groups, and DNS records stay. Re-generate whenever tagged nodes change.
      </p>

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handlePreview} disabled={isPending || !rulesReady} className="text-[12px] px-3 py-1.5" style={{ opacity: !rulesReady ? 0.5 : 1 }}>
          Preview policy
        </Button>
          <Button variant="primary" onClick={handleApply} disabled={isPending || !preview} className="text-[12px] px-3 py-1.5" style={{ opacity: !preview ? 0.5 : 1 }}>
            {isPending ? 'Working…' : 'Merge into policy'}
          </Button>
        {applied && (
          <Badge variant="green" className="animate-fade-in">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            Policy applied
          </Badge>
        )}
        {error && <Badge variant="red" className="text-[11px] max-w-[320px] truncate">{error}</Badge>}
      </div>

      {preview && (
        <pre className="px-4 py-3 rounded-[12px] text-[11.5px] leading-relaxed overflow-x-auto" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
          {preview}
        </pre>
      )}
    </div>
  );
}
