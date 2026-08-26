/** Shared Stripe Payment Links — single source of truth for PricingSection
 *  (marketing site) and ProShowcase (in-dashboard upsell), so the two never
 *  drift out of sync. */
export const STRIPE_MONTHLY_LINK =
  process.env.NEXT_PUBLIC_STRIPE_MONTHLY_LINK ||
  'https://buy.stripe.com/fZu3cv6UEe6y3iAfgJ5Vu00';

export const STRIPE_LIFETIME_LINK =
  process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK ||
  'https://buy.stripe.com/dRm3cv6UE9QibP64C55Vu01';
