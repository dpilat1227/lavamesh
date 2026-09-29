# LavaMesh

Free, self-hosted dashboard for Headscale. Nodes, keys, routes, ACLs, backups, and the audit log are all part of the app. There is no paid tier.

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

Self-host: `docker compose up` after filling `.env` — see `docker-compose.yml`.
