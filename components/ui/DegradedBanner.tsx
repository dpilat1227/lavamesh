/**
 * Partial-failure banner.
 *
 * `HeadscaleUnavailable` covers the all-or-nothing case: the control plane is
 * gone, show a full-page explainer. The nastier case is a *partial* failure —
 * one call in a `Promise.allSettled` batch rejects, the code falls back to `[]`
 * or `null`, and the page then confidently renders "No keys yet" or
 * "Magic DNS: Off". The user can't tell "not configured" from "we couldn't
 * ask". This renders above the real content so the page still works, but stops
 * lying about what it knows.
 */
export function DegradedBanner({ message, detail }: { message: string; detail?: string }) {
  return (
    <div
      role="status"
      className="mx-8 mb-3 px-3.5 py-2.5 rounded-[10px] flex items-start gap-2.5 flex-shrink-0"
      style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium" style={{ color: 'var(--amber)' }}>{message}</p>
        {detail && (
          <p className="text-[11.5px] mt-0.5 break-words" style={{ color: 'var(--text-4)' }}>{detail}</p>
        )}
      </div>
    </div>
  );
}
