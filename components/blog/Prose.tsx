import type { ReactNode } from 'react';

/** Typography primitives for blog post bodies — kept separate from the
 * BlogPostLayout shell so article files stay readable prose, not style soup. */

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="text-[18px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 450 }}>
      {children}
    </p>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-[16px] leading-[1.75] mb-6" style={{ color: 'rgba(255,255,255,0.68)' }}>
      {children}
    </p>
  );
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-bold mt-14 mb-5 scroll-mt-24" style={{ fontSize: 'clamp(22px, 3vw, 28px)', color: 'white', letterSpacing: '-0.02em' }}>
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-semibold mt-10 mb-4" style={{ fontSize: 19, color: 'white', letterSpacing: '-0.01em' }}>
      {children}
    </h3>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-6 space-y-2.5 pl-1">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
      <span className="mt-2.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#ff7300' }} />
      <span>{children}</span>
    </li>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-8 pl-5 py-1 text-[17px] leading-relaxed italic"
      style={{ borderLeft: '2px solid rgba(255,115,0,0.5)', color: 'rgba(255,255,255,0.8)' }}>
      {children}
    </blockquote>
  );
}

export function Callout({ children, label = 'Real talk' }: { children: ReactNode; label?: string }) {
  return (
    <div className="my-8 rounded-[14px] p-5" style={{ background: 'rgba(255,115,0,0.05)', border: '1px solid rgba(255,115,0,0.18)' }}>
      <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#ff7300' }}>{label}</div>
      <div className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{children}</div>
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-[5px] text-[14px]"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#ffb37a', fontFamily: 'var(--font-mono)' }}>
      {children}
    </code>
  );
}

export function Pre({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="my-6 rounded-[12px] overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
      {label && (
        <div className="px-4 py-2 text-[11px] font-medium" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
          {label}
        </div>
      )}
      <pre className="px-4 py-4 overflow-x-auto text-[13.5px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
        {children}
      </pre>
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="my-8 rounded-[14px] overflow-hidden overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#080808' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 480 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {headers.map((h, i) => (
              <th key={h} className="text-left text-[12px] font-semibold uppercase tracking-wider px-4 py-3"
                style={{ color: i === 0 ? 'rgba(255,255,255,0.4)' : '#ff7300', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-[14px]" style={{ color: ci === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.85)', fontWeight: ci === 0 ? 500 : 400, whiteSpace: 'nowrap' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ArticleCTA() {
  return (
    <div className="mt-16 p-8 rounded-[20px] text-center" style={{ background: 'rgba(255,115,0,0.05)', border: '1px solid rgba(255,115,0,0.18)' }}>
      <h3 className="font-bold mb-3" style={{ fontSize: 22, color: 'white', letterSpacing: '-0.02em' }}>
        Want the dashboard without the CLI?
      </h3>
      <p className="text-[15px] mb-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
        LavaMesh is a self-hosted control panel for Headscale — nodes, keys, ACLs, and users in one place. Free to self-host, flat-rate if you want the extras.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <a href="/#pricing" className="btn btn-primary text-[14px] font-semibold" style={{ padding: '11px 22px', borderRadius: 12, textDecoration: 'none' }}>
          See pricing →
        </a>
        <a href="https://github.com/dpilat1227/lavamesh" target="_blank" rel="noopener noreferrer"
          className="text-[14px] font-medium" style={{ padding: '11px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
          Star on GitHub
        </a>
      </div>
    </div>
  );
}
