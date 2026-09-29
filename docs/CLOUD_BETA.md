# Cloud private beta — ops runbook

Do not flip `CLOUD_CHECKOUT_ENABLED` until two throwaway provisions have gone `provisioning` → `active` on a real card.

## Env on Vercel (production)

Set **both** checkout flags when you are ready to charge. The API gate and the homepage CTA are separate on purpose.

```
CLOUD_CHECKOUT_ENABLED=true
NEXT_PUBLIC_CLOUD_CHECKOUT_ENABLED=true
CLOUD_BETA_CAP=20
```

Also required (checklist, no values):

- `FLY_API_TOKEN`, `FLY_ORG_SLUG`, `FLY_REGION`
- `PROVISIONING_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `POSTGRES_URL`, `KV_REDIS_URL`
- Optional admin login: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Check readiness

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" https://www.lavamesh.com/api/cloud-ready
```

Every `ok` must be true. Then:

1. Create a throwaway Stripe checkout (`/api/checkout?plan=cloud`) while signed in.
2. Watch `HeadscaleInstance.status` go `provisioning` → `active` (Settings → Cloud card, or the dashboard waiter).
3. Repeat once. If either stays on `error`, fix Fly — do not open the waitlist.

## First wave

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://www.lavamesh.com/api/waitlist/announce
```

Emails the oldest waitlist addresses, up to remaining seats (`CLOUD_BETA_CAP` minus live instances). Already-emailed addresses are stored in KV (`waitlist:cloud-open:sent`).

When the cap is hit, checkout redirects to `/#waitlist?full=1`.
