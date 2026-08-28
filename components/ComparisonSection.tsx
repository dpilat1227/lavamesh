/**
 * Two things in here are load-bearing and easy to accidentally undo:
 *
 * 1. Tailscale figures are their published list prices as of Aug 2026: Personal
 *    free for up to 6 users with *unlimited user devices*, Standard $8/user/mo,
 *    Premium $18/user/mo, 50 tagged resources then $1/mo each. This table used
 *    to headline "50 devices on Tailscale = $300-900/mo", which was true under
 *    their old device-counted model and is flatly false now — a solo homelab
 *    with 50 devices costs $0 on Tailscale. Never reintroduce device-count
 *    price scares.
 *
 * 2. The third column is "Headscale + a free UI", not "raw CLI Headscale".
 *    Headscale's own docs list ~11 community web UIs, and Headplane (MIT, 2.7k
 *    stars) is genuinely feature-complete. Comparing against CLI-only Headscale
 *    would be a strawman that any informed visitor spots instantly, and it
 *    would put our whole pitch on a feature three free projects already ship.
 *    So the dashboard/ACL rows are honest ties, and the argument is carried by
 *    the operational rows — standing Headscale up, upgrading it, and knowing
 *    when it breaks. That's what nothing in that column does.
 */
type Group = 'sovereignty' | 'operations';

interface Row {
  feature: string;
  lava: string;
  tail: string;
  /** Headscale plus one of the community UIs (Headplane, headscale-ui, ...). */
  head: string;
  tailBad?: boolean;
  headBad?: boolean;
  group: Group;
  /** Shown up front on mobile; the rest collapse behind an expander. */
  key?: boolean;
}

const rows: Row[] = [
  // ── Control & cost: where Tailscale loses, Headscale ties ──
  { group: 'sovereignty', feature: 'Who runs the control plane', lava: 'You, or we host it', tail: 'Tailscale does', head: 'You do', tailBad: true, key: true },
  { group: 'sovereignty', feature: 'Who can see your device list', lava: 'Only you', tail: 'Tailscale', head: 'Only you', tailBad: true, key: true },
  { group: 'sovereignty', feature: 'Cost at 10 people', lava: '$19/mo flat', tail: '$80/mo', head: 'Free + server cost', tailBad: true },
  { group: 'sovereignty', feature: 'Seat limits', lava: 'None, ever', tail: '7th user bills every seat', head: 'None', tailBad: true },
  { group: 'sovereignty', feature: 'Open source', lava: 'Yes', tail: 'Client only', head: 'Yes', tailBad: true },

  // ── Operations: the actual wedge ──
  { group: 'operations', feature: 'Standing up Headscale', lava: 'Hosted for you, or one compose file', tail: 'Nothing to run', head: 'config.yaml, TLS, database, systemd', headBad: true, key: true },
  { group: 'operations', feature: 'Headscale upgrades', lava: 'Handled on Cloud', tail: 'Managed for you', head: 'One minor version at a time, migrate the DB', headBad: true, key: true },
  { group: 'operations', feature: 'Knowing a node dropped', lava: 'Email + webhook alert', tail: 'Premium only', head: 'You notice eventually', headBad: true, key: true },
  { group: 'operations', feature: 'Uptime history', lava: 'Built in', tail: 'Built in', head: 'None', headBad: true },
  { group: 'operations', feature: 'Config backups', lava: 'Automated, restorable', tail: 'Managed for you', head: 'Write your own cron', headBad: true },
  { group: 'operations', feature: 'Audit log', lava: 'Searchable + CSV export', tail: 'Premium only', head: 'None', headBad: true },
  { group: 'operations', feature: 'Adding a node', lava: 'One curl command', tail: 'Admin console', head: 'Mint a key, SSH in, run the CLI', headBad: true },
  { group: 'operations', feature: 'Someone to email', lava: 'Priority support on Pro', tail: 'Paid plans', head: 'GitHub issues', headBad: true },

  // Honest ties. These stay in the table on purpose — dropping them to look
  // stronger is exactly what makes a comparison table untrustworthy.
  { group: 'operations', feature: 'Web dashboard', lava: 'Yes', tail: 'Yes', head: 'Yes, via community UIs' },
  { group: 'operations', feature: 'Visual ACL editor', lava: 'Yes', tail: 'Yes', head: 'Yes, in some UIs' },
];

const GROUP_LABEL: Record<Group, string> = {
  sovereignty: 'Control & cost',
  operations: 'Running the thing',
};

function Cross() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.6)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Spacer so neutral cells stay aligned with the ones carrying a mark. */
function NoMark() {
  return <span style={{ width: 15, flexShrink: 0 }} aria-hidden="true" />;
}

const GRID = '1.5fr 1.4fr 1.15fr 1.6fr';

export default function ComparisonSection() {
  const groups: Group[] = ['sovereignty', 'operations'];

  return (
    <section style={{ padding: '0 24px clamp(64px, 9vw, 120px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-bold tracking-tight mb-5" style={{ fontSize: 'clamp(30px, 4.6vw, 50px)', letterSpacing: '-0.03em', color: 'white' }}>
            Headscale, without<br />
            <span style={{ background: 'linear-gradient(135deg, #ff7300 0%, #FF8A00 60%, rgba(255,180,50,0.9) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              becoming its sysadmin.
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 600, margin: '0 auto 14px', lineHeight: 1.65 }}>
            Tailscale&apos;s free tier is generous — six users, unlimited devices. It&apos;s also their server holding your device list.
            Headscale fixes that, and there are good free UIs for it.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 600, margin: '0 auto', lineHeight: 1.65 }}>
            What none of them do is <span style={{ color: 'rgba(255,255,255,0.85)' }}>run the thing</span> — the config file, the TLS cert, the database
            migrations, the upgrades you have to take one minor version at a time. That&apos;s the part we take.
          </p>
        </div>

        {/* Desktop / tablet table */}
        <div className="comparison-desktop" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#080808', boxShadow: 'var(--shadow-lg)' }}>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 820 }}>
              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ padding: '20px 24px', position: 'sticky', left: 0, background: '#080808', zIndex: 10, borderRight: '1px solid rgba(255,255,255,0.04)' }} />
                <div style={{ padding: 20, background: 'rgba(255,115,0,0.05)', borderLeft: '1px solid rgba(255,115,0,0.15)', borderRight: '1px solid rgba(255,115,0,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-[5px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1a0802, #3a1405)', border: '1px solid rgba(255,115,0,0.3)' }}>
                      <svg className="w-2.5 h-2.5" style={{ color: '#ff7300' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: '#ff7300' }}>LavaMesh</span>
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Tailscale</span>
                </div>
                <div style={{ padding: 20 }}>
                  <span className="text-[13px] font-semibold block" style={{ color: 'rgba(255,255,255,0.55)' }}>Headscale</span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>+ a free community UI</span>
                </div>
              </div>

              {groups.map(group => (
                <div key={group}>
                  {/* Group band — makes it legible that the two alternatives lose
                      on different axes, rather than one flat list of ties. */}
                  <div style={{ display: 'grid', gridTemplateColumns: GRID, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ padding: '10px 24px', position: 'sticky', left: 0, background: '#0a0a0a', zIndex: 10 }}>
                      <span className="text-[10px] font-semibold uppercase" style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.09em' }}>{GROUP_LABEL[group]}</span>
                    </div>
                    <div /><div /><div />
                  </div>

                  {rows.filter(r => r.group === group).map(row => (
                    <div key={row.feature} className="table-row-hover" style={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ padding: '15px 24px', display: 'flex', alignItems: 'center', position: 'sticky', left: 0, background: '#080808', zIndex: 10, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{row.feature}</span>
                      </div>

                      {/* No blanket checkmark: claiming a win on every row —
                          including the honest ties — reads as marketing noise.
                          The column tint carries the emphasis instead. */}
                      <div style={{ padding: '15px 20px', background: 'rgba(255,115,0,0.03)', borderLeft: '1px solid rgba(255,115,0,0.12)', borderRight: '1px solid rgba(255,115,0,0.12)', display: 'flex', alignItems: 'center' }}>
                        <span className="text-[13px] font-semibold" style={{ color: 'white' }}>{row.lava}</span>
                      </div>

                      <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {row.tailBad ? <Cross /> : <NoMark />}
                        <span className="text-[13px]" style={{ color: row.tailBad ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.55)' }}>{row.tail}</span>
                      </div>

                      <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {row.headBad ? <Cross /> : <NoMark />}
                        <span className="text-[13px]" style={{ color: row.headBad ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.55)' }}>{row.head}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: lead with the rows that make the argument, collapse the rest.
            <details> keeps this a server component — no state, and it's
            keyboard-accessible for free. */}
        <div className="comparison-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
          {rows.filter(r => r.key).map(row => <MobileRow key={row.feature} row={row} />)}

          <details className="comparison-details">
            <summary
              className="text-[13px] font-semibold"
              style={{
                listStyle: 'none', cursor: 'pointer', textAlign: 'center',
                padding: '13px 14px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.72)',
              }}>
              See full comparison
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {rows.filter(r => !r.key).map(row => <MobileRow key={row.feature} row={row} />)}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

function MobileRow({ row }: { row: Row }) {
  return (
    <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: '#080808', overflow: 'hidden' }}>
      <div style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[12.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{row.feature}</span>
      </div>
      <div style={{ padding: '11px 14px', background: 'rgba(255,115,0,0.05)', display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-[11px] font-bold w-[70px] flex-shrink-0" style={{ color: '#ff7300', paddingTop: 1 }}>LavaMesh</span>
        <span className="text-[12.5px] font-semibold" style={{ color: 'white' }}>{row.lava}</span>
      </div>
      <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-[11px] font-semibold w-[70px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.42)', paddingTop: 1 }}>Tailscale</span>
        {row.tailBad ? <Cross /> : <NoMark />}
        <span className="text-[12.5px]" style={{ color: row.tailBad ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.55)' }}>{row.tail}</span>
      </div>
      <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span className="text-[11px] font-semibold w-[70px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.42)', paddingTop: 1 }}>Headscale</span>
        {row.headBad ? <Cross /> : <NoMark />}
        <span className="text-[12.5px]" style={{ color: row.headBad ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.55)' }}>{row.head}</span>
      </div>
    </div>
  );
}
