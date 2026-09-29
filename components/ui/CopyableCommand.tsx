'use client';
import { useState } from 'react';

/**
 * A shell command the user is expected to run elsewhere, with a copy button
 * that is *always* visible.
 *
 * The pattern this replaces used `opacity-0 group-hover:opacity-100`, which
 * means on any touch device the copy affordance never appears at all — the
 * element is tappable but looks inert. Onboarding surfaces are exactly where
 * that hurts most, so the button here is persistent and just brightens on
 * hover/focus.
 */
export function CopyableCommand({ command, label }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is blocked in insecure contexts / denied permissions. The
      // text is selectable, so silently leaving it visible is fine.
    }
  };

  return (
    <div>
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-4)' }}>{label}</p>
      )}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-[10px]"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)' }}
      >
        <code
          className="text-[12px] flex-1 min-w-0 overflow-x-auto custom-scrollbar whitespace-nowrap text-left"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}
        >
          {command}
        </code>
        <button
          onClick={copy}
          aria-label={copied ? 'Copied to clipboard' : `Copy command: ${command}`}
          className="btn focus-ring flex-shrink-0 flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-[7px] transition-all"
          style={{
            background: copied ? 'var(--green-soft)' : 'var(--surface-2)',
            border: `1px solid ${copied ? 'rgba(61,220,132,0.25)' : 'var(--border-2)'}`,
            color: copied ? 'var(--green)' : 'var(--text-3)',
          }}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
