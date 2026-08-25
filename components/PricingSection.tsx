'use client';
import { useState } from 'react';
import Link from 'next/link';

const MONTHLY_LINK = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_LINK || null;
const LIFETIME_LINK = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK || null;

type Billing = 'monthly' | 'lifetime';

const plans = [
  {
    id: 'community',
    name: 'Community',
    badge: null,
    desc: 'For homelabbers and developers self-hosting their own infrastructure.',
    price: { monthly: 'Free', lifetime: 'Free' },
    sub: { monthly: 'forever', lifetime: 'forever' },
    features: [
      'Full dashboard — nodes, keys, users, routes',
      'Self-hosted on your own server',
      'ACL policy editor',
      'Up to 2 team members',
      'Open source on GitHub',
      'Community support (Discord)',
    ],
    notIncluded: ['Audit log', 'Webhook alerts', 'Priority support'],
    cta: (billing: Billing) => ({
      label: 'Deploy on GitHub →',
      href: 'https://github.com/dpilat1227/lavamesh',
      external: true,
    }),
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    desc: 'For serious operators who want full control with premium tooling and support.',
    price: { monthly: '$19', lifetime: '$149' },
    sub: { monthly: '/month', lifetime: 'one-time' },
    savings: 'Save $79 vs monthly',
    features: [
      'Everything in Community',
      'Unlimited team members',
      'Advanced audit log & event history',
      'Visual tag-based ACL builder',
      'Webhook alerts (Slack, Discord)',
      'Subnet route failover alerts',
      'Automated config backups',
      'Priority email support',
      'License key for your instance',
    ],
    notIncluded: [],
    cta: (billing: Billing) => ({
      label: billing === 'monthly' ? 'Get Monthly License →' : 'Get Lifetime License →',
      href: billing === 'monthly' ? MONTHLY_LINK : LIFETIME_LINK,
      external: true,
    }),
    highlight: true,
  },
  {
    id: 'cloud',
    name: 'Cloud',
    badge: null,
    desc: 'Zero infrastructure. We host Headscale and LavaMesh together for you.',
    price: { monthly: '$39', lifetime: null },
    sub: { monthly: '/month', lifetime: null },
    features: [
      'Everything in Pro',
      'Managed Headscale instance',
      'Zero server setup required',
      'Automatic updates & backups',
      '99.9% uptime SLA',
      'White-glove onboarding call',
      'Custom domain support',
    ],
    notIncluded: [],
    cta: (billing: Billing) => ({
      label: 'Deploy Cloud Instance →',
      href: '/api/checkout?plan=cloud',
      external: false,
    }),
    highlight: false,
  },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#34d399', flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function PricingSection() {
  const [billing, setBilling] = useState<Billing>('lifetime');

  return (
    <section id="pricing" style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,90,0,0.8)' }}>Pricing</p>
          <h2 className="font-bold tracking-tight mb-4" style={{ fontSize: 'clamp(36px, 5vw, 54px)', letterSpacing: '-0.03em', color: 'white' }}>
            Simple, flat-rate pricing.<br />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Zero per-user fees.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Scale your mesh network without scaling your bill.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center p-1 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['monthly', 'lifetime'] as Billing[]).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="relative px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all"
                style={{
                  background: billing === b ? (b === 'lifetime' ? '#FF5A00' : 'rgba(255,255,255,0.08)') : 'transparent',
                  color: billing === b ? 'white' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {b === 'monthly' ? 'Monthly' : 'Lifetime'}
                {b === 'lifetime' && (
                  <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: billing === 'lifetime' ? 'rgba(255,255,255,0.2)' : 'rgba(255,90,0,0.15)', color: billing === 'lifetime' ? 'white' : '#FF5A00' }}>
                    SAVE 35%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          {plans.map(plan => {
            const ctaInfo = plan.cta(billing);
            const price = plan.price[billing];
            const sub = plan.sub[billing];

            return (
              <div
                key={plan.id}
                className="relative flex flex-col"
                style={{
                  background: plan.highlight ? 'rgba(255,90,0,0.04)' : 'rgba(255,255,255,0.02)',
                  border: plan.highlight ? '1px solid rgba(255,90,0,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  padding: '32px 28px',
                  boxShadow: plan.highlight ? '0 0 60px rgba(255,90,0,0.06)' : 'none',
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        background: plan.badge === 'Coming Soon' ? 'rgba(255,255,255,0.06)' : '#FF5A00',
                        color: plan.badge === 'Coming Soon' ? 'rgba(255,255,255,0.5)' : 'white',
                        border: plan.badge === 'Coming Soon' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      }}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name + desc */}
                <div className="mb-6">
                  <h3 className="text-[18px] font-bold mb-1" style={{ color: 'white', letterSpacing: '-0.02em' }}>{plan.name}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {price ? (
                    <div className="flex items-end gap-1">
                      <span className="font-bold leading-none" style={{ fontSize: price === 'Free' ? 36 : 42, color: 'white', letterSpacing: '-0.04em' }}>{price}</span>
                      {sub && <span className="text-[14px] mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</span>}
                    </div>
                  ) : (
                    <span className="text-[16px]" style={{ color: 'rgba(255,255,255,0.3)' }}>See monthly →</span>
                  )}
                  {billing === 'lifetime' && plan.savings && (
                    <div className="mt-2 text-[12px] font-medium" style={{ color: '#34d399' }}>✓ {plan.savings}</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded?.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <XIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {ctaInfo.href && !ctaInfo.href.startsWith('#') ? (
                  <a
                    href={ctaInfo.href}
                    target={ctaInfo.external ? '_blank' : undefined}
                    rel={ctaInfo.external ? 'noopener noreferrer' : undefined}
                    className="btn text-center text-[14px] font-semibold w-full"
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: plan.highlight ? '#FF5A00' : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      display: 'block',
                      textDecoration: 'none',
                      boxShadow: plan.highlight ? '0 0 30px rgba(255,90,0,0.25)' : 'none',
                      opacity: ctaInfo.href ? 1 : 0.5,
                      cursor: ctaInfo.href ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {!ctaInfo.href || ctaInfo.href === '#' ? 'Coming Soon' : ctaInfo.label}
                  </a>
                ) : (
                  <a
                    href={ctaInfo.href || '#waitlist'}
                    className="btn text-center text-[14px] font-semibold w-full"
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'block',
                      textDecoration: 'none',
                    }}
                  >
                    {ctaInfo.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Enterprise callout */}
        <div className="mt-8 flex items-center justify-center gap-3 text-center flex-wrap">
          <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Need multi-instance management or a custom contract?</span>
          <a href="#waitlist" className="text-[14px] font-medium" style={{ color: '#FF5A00', textDecoration: 'none' }}>Talk to us →</a>
        </div>
      </div>
    </section>
  );
}
