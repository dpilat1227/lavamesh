# LavaMesh

Headscale dashboard for Community (free, self-hosted) and Pro (license key). Cloud is waitlisted — do not charge for it yet.

## Beta: Pro fulfillment

1. Customer pays a Stripe Payment Link (monthly or lifetime) from `/#pricing`.
2. You email them a license string (8+ characters). Any unique string works for beta — this is a presence check, not cryptographic.
3. They paste it in **Settings → Activate Pro**.
4. The key is stored in KV (`license:key`). Presence unlocks audit, ACL builder, webhooks, backups, and unlimited seats.

Do not sell Pro until production has **KV_REDIS_URL**, **Resend** (`RESEND_API_KEY` + verified `EMAIL_FROM`), **Stripe links**, and **AUTH_PASSWORD** (or working magic-link email).

Self-hosted operators can skip paste and set `LAVAMESH_LICENSE_KEY` instead.

## Local

```bash
cp .env.example .env.local
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development without `AUTH_PASSWORD`, any password signs you in.

## Deploy

Push `main`. Vercel should build from GitHub. Confirm the env vars in `.env.example` are set on the project — especially KV, Resend, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_PASSWORD`, and Headscale.

Cloud checkout stays behind `CLOUD_CHECKOUT_ENABLED` (leave unset).
