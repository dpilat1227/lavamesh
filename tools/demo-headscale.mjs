/**
 * Stand-in Headscale control server for demos and screenshots.
 *
 * Serves the same REST shapes as Headscale 0.22 (/api/v1/machine rather than
 * /node) against an in-memory fleet, and accepts the mutations the dashboard
 * issues so a recorded walkthrough can approve routes and mint keys for real.
 *
 *   node tools/demo-headscale.mjs --port 8899
 *   HEADSCALE_API_URL=http://127.0.0.1:8899 HEADSCALE_API_KEY=demo npm run dev
 */

import { createServer } from 'node:http';

const PORT = Number(process.argv.find((a, i) => process.argv[i - 1] === '--port')) || 8899;

const now = Date.now();
const iso = (msAgo = 0) => new Date(now - msAgo).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const hex = (seed) => {
  let h = BigInt(seed) * 6364136223846793005n + 1442695040888963407n;
  let out = '';
  while (out.length < 64) {
    h = (h * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
    out += h.toString(16).padStart(16, '0');
  }
  return out.slice(0, 64);
};

const users = [
  { id: '1', name: 'admin', createdAt: iso(190 * DAY) },
  { id: '2', name: 'drew', createdAt: iso(180 * DAY) },
  { id: '3', name: 'maya', createdAt: iso(96 * DAY) },
  { id: '4', name: 'ci-runner', createdAt: iso(41 * DAY) },
];

const userByName = (name) => users.find((u) => u.name === name);

/** [givenName, displayName, user, onlineOrLastSeenMsAgo, opts] */
const fleetSpec = [
  ['drews-macbook-pro', "Drew's MacBook Pro", 'drew', 0, { createdAgo: 178 * DAY }],
  ['nas-truenas', 'nas-truenas', 'admin', 0, { createdAgo: 176 * DAY, tags: ['storage'] }],
  ['pi-dns-01', 'pi-dns-01', 'admin', 0, { createdAgo: 174 * DAY }],
  ['homelab-proxmox', 'homelab-proxmox', 'admin', 0, { createdAgo: 130 * DAY }],
  ['vps-frankfurt', 'vps-frankfurt', 'admin', 0, { createdAgo: 121 * DAY }],
  ['vps-chicago', 'vps-chicago', 'admin', 0, { createdAgo: 44 * DAY }],
  ['office-nuc', 'office-nuc', 'admin', 0, { createdAgo: 88 * DAY }],
  ['drew-iphone-15', 'drew-iphone-15', 'drew', 0, { createdAgo: 150 * DAY }],
  ['maya-thinkpad', 'maya-thinkpad', 'maya', 3 * DAY + 4 * HOUR, { createdAgo: 95 * DAY }],
  ['ci-runner-01', 'ci-runner-01', 'ci-runner', 0, { createdAgo: 12 * DAY, ephemeral: true }],
  ['ci-runner-02', 'ci-runner-02', 'ci-runner', 26 * MIN, { createdAgo: 12 * DAY, ephemeral: true }],
  ['old-mbp-2019', 'old-mbp-2019', 'drew', 51 * DAY, { createdAgo: 179 * DAY, expiredAgo: 9 * DAY }],
];

let machines = fleetSpec.map(([givenName, name, userName, lastSeenAgo, opts = {}], i) => {
  const id = String(i + 1);
  const user = userByName(userName);
  return {
    id,
    machineKey: hex(i * 7 + 11),
    nodeKey: hex(i * 13 + 29),
    discoKey: hex(i * 17 + 43),
    ipAddresses: [`fd7a:115c:a1e0::${(i + 1).toString(16)}`, `100.64.0.${i + 1}`],
    name,
    user,
    lastSeen: iso(lastSeenAgo || Math.floor(Math.random() * 90_000)),
    lastSuccessfulUpdate: iso(lastSeenAgo || 3 * MIN),
    expiry: opts.expiredAgo ? iso(opts.expiredAgo) : '0001-01-01T00:00:00Z',
    preAuthKey: {
      user: userName,
      id,
      key: hex(i * 3 + 5).slice(0, 48),
      reusable: !opts.ephemeral,
      ephemeral: !!opts.ephemeral,
      used: true,
      expiration: iso(-14 * DAY),
      createdAt: iso(opts.createdAgo),
      aclTags: [],
    },
    createdAt: iso(opts.createdAgo),
    registerMethod: 'REGISTER_METHOD_AUTH_KEY',
    forcedTags: [],
    invalidTags: [],
    validTags: [],
    givenName,
    online: !lastSeenAgo,
  };
});

const machineByGivenName = (n) => machines.find((m) => m.givenName === n);

let routes = [
  ['192.168.1.0/24', 'nas-truenas', true, true],
  ['192.168.50.0/24', 'office-nuc', true, true],
  ['0.0.0.0/0', 'vps-frankfurt', true, true],
  ['0.0.0.0/0', 'vps-chicago', false, false],
  ['10.0.20.0/24', 'homelab-proxmox', false, false],
  ['10.42.0.0/16', 'homelab-proxmox', false, false],
].map(([prefix, node, enabled, isPrimary], i) => ({
  id: String(i + 1),
  machine: machineByGivenName(node),
  prefix,
  advertised: true,
  enabled,
  isPrimary,
  createdAt: iso(30 * DAY),
  updatedAt: iso(2 * DAY),
  deletedAt: null,
}));

let preAuthKeys = {
  admin: [
    { id: '21', key: hex(101).slice(0, 48), reusable: true, ephemeral: false, used: true, expiration: iso(-22 * DAY), createdAt: iso(8 * DAY), aclTags: [] },
    { id: '22', key: hex(102).slice(0, 48), reusable: false, ephemeral: false, used: false, expiration: iso(-6 * DAY), createdAt: iso(1 * DAY), aclTags: [] },
  ],
  drew: [
    { id: '23', key: hex(103).slice(0, 48), reusable: true, ephemeral: false, used: true, expiration: iso(-60 * DAY), createdAt: iso(30 * DAY), aclTags: [] },
  ],
  maya: [
    { id: '24', key: hex(104).slice(0, 48), reusable: false, ephemeral: false, used: false, expiration: iso(18 * HOUR), createdAt: iso(6 * DAY), aclTags: [] },
  ],
  'ci-runner': [
    { id: '25', key: hex(105).slice(0, 48), reusable: true, ephemeral: true, used: true, expiration: iso(-9 * DAY), createdAt: iso(12 * DAY), aclTags: ['tag:ci'] },
  ],
};

let nextKeyId = 30;

let policy = `{
  // LavaMesh demo policy
  "tagOwners": {
    "tag:ci":      ["drew@"],
    "tag:storage": ["drew@"],
  },

  "acls": [
    // Admins reach everything
    { "action": "accept", "src": ["drew@"], "dst": ["*:*"] },

    // Everyone can reach the NAS over SMB and the DNS resolver
    { "action": "accept", "src": ["*"], "dst": ["tag:storage:445,139"] },
    { "action": "accept", "src": ["*"], "dst": ["pi-dns-01:53"] },

    // CI runners are egress-only — nothing may dial into them
    { "action": "accept", "src": ["tag:ci"], "dst": ["*:443,80"] },
  ],

  "dns": {
    "extra_records": [
      { "name": "nas.mesh",   "type": "A", "value": "100.64.0.2" },
      { "name": "grafana.mesh", "type": "A", "value": "100.64.0.4" },
    ],
  },
}`;

const json = (res, code, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
};
const notFound = (res) => json(res, 404, { code: 5, message: 'Not Found', details: [] });

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const seg = url.pathname.replace(/^\/api\/v1\/?/, '').split('/').filter(Boolean);
  const [head, ...rest] = seg;
  const method = req.method;
  const log = (msg) => console.log(`  ${method} ${url.pathname} → ${msg}`);

  if (!url.pathname.startsWith('/api/v1')) return notFound(res);

  // ── machines ──────────────────────────────────────────────────────────────
  if (head === 'machine') {
    if (method === 'GET' && rest.length === 0) {
      const user = url.searchParams.get('user');
      const list = user ? machines.filter((m) => m.user.name === user) : machines;
      log(`${list.length} machines`);
      return json(res, 200, { machines: list });
    }
    const target = machines.find((m) => m.id === rest[0]);
    if (!target) return notFound(res);

    if (method === 'GET' && rest[1] === 'routes') {
      return json(res, 200, { routes: routes.filter((r) => r.machine?.id === target.id) });
    }
    if (method === 'DELETE' && rest.length === 1) {
      machines = machines.filter((m) => m.id !== target.id);
      routes = routes.filter((r) => r.machine?.id !== target.id);
      log(`deleted ${target.givenName}`);
      return json(res, 200, {});
    }
    if (method === 'POST' && rest[1] === 'rename' && rest[2]) {
      target.givenName = decodeURIComponent(rest[2]);
      log(`renamed → ${target.givenName}`);
      return json(res, 200, { machine: target });
    }
    if (method === 'POST' && rest[1] === 'expire') {
      target.expiry = iso(0);
      target.online = false;
      log(`expired ${target.givenName}`);
      return json(res, 200, { machine: target });
    }
    return notFound(res);
  }

  // ── routes ────────────────────────────────────────────────────────────────
  if (head === 'routes') {
    if (method === 'GET' && rest.length === 0) return json(res, 200, { routes });
    const route = routes.find((r) => r.id === rest[0]);
    if (!route || rest[1] !== 'enable') return notFound(res);
    if (method === 'POST') {
      route.enabled = true;
      const siblings = routes.filter((r) => r.prefix === route.prefix && r.enabled);
      route.isPrimary = siblings.length === 1;
      route.updatedAt = iso(0);
      log(`approved ${route.prefix} on ${route.machine?.givenName}`);
      return json(res, 200, {});
    }
    if (method === 'DELETE') {
      route.enabled = false;
      route.isPrimary = false;
      route.updatedAt = iso(0);
      log(`disabled ${route.prefix}`);
      return json(res, 200, {});
    }
    return notFound(res);
  }

  // ── users ─────────────────────────────────────────────────────────────────
  if (head === 'user') {
    if (method === 'GET' && rest.length === 0) return json(res, 200, { users });
    if (method === 'POST' && rest.length === 0) {
      const { name } = await readBody(req);
      if (!name) return json(res, 400, { code: 3, message: 'name required' });
      if (userByName(name)) return json(res, 409, { code: 6, message: 'already exists' });
      const user = { id: String(users.length + 1), name, createdAt: iso(0) };
      users.push(user);
      preAuthKeys[name] = [];
      log(`created user ${name}`);
      return json(res, 200, { user });
    }
    const name = decodeURIComponent(rest[0] ?? '');
    const user = userByName(name);
    if (!user) return json(res, 500, { code: 2, message: 'User not found', details: [] });
    if (method === 'DELETE') {
      users.splice(users.indexOf(user), 1);
      delete preAuthKeys[name];
      log(`deleted user ${name}`);
      return json(res, 200, {});
    }
    if (method === 'POST' && rest[1] === 'rename' && rest[2]) {
      const next = decodeURIComponent(rest[2]);
      preAuthKeys[next] = preAuthKeys[name] ?? [];
      delete preAuthKeys[name];
      user.name = next;
      log(`renamed user → ${next}`);
      return json(res, 200, { user });
    }
    return notFound(res);
  }

  // ── pre-auth keys ─────────────────────────────────────────────────────────
  if (head === 'preauthkey') {
    if (method === 'GET') {
      const user = url.searchParams.get('user');
      if (!user || !userByName(user)) return json(res, 500, { code: 2, message: 'User not found', details: [] });
      const keys = (preAuthKeys[user] ?? []).map((k) => ({ ...k, user }));
      return json(res, 200, { preAuthKeys: keys });
    }
    if (method === 'POST' && rest[0] === 'expire') {
      const { user, key } = await readBody(req);
      const found = (preAuthKeys[user] ?? []).find((k) => k.key === key);
      if (found) found.expiration = iso(0);
      log(`expired key for ${user}`);
      return json(res, 200, {});
    }
    if (method === 'POST') {
      const { user = 'admin', reusable = true, ephemeral = false, expiration } = await readBody(req);
      if (!userByName(user)) return json(res, 500, { code: 2, message: 'User not found', details: [] });
      const key = {
        id: String(nextKeyId++),
        key: hex(nextKeyId * 991).slice(0, 48),
        reusable,
        ephemeral,
        used: false,
        expiration: expiration ?? iso(-DAY),
        createdAt: iso(0),
        aclTags: [],
      };
      (preAuthKeys[user] ??= []).unshift(key);
      log(`minted key for ${user}`);
      return json(res, 200, { preAuthKey: { ...key, user } });
    }
    return notFound(res);
  }

  // ── policy ────────────────────────────────────────────────────────────────
  if (head === 'policy') {
    if (method === 'GET') return json(res, 200, { policy, updatedAt: iso(2 * DAY) });
    if (method === 'PUT') {
      const body = await readBody(req);
      if (typeof body.policy === 'string') policy = body.policy;
      log('policy updated');
      return json(res, 200, { policy, updatedAt: iso(0) });
    }
    return notFound(res);
  }

  // ── dns ───────────────────────────────────────────────────────────────────
  if (head === 'dns') {
    if (rest[0] === 'routes') return json(res, 200, { domains: ['mesh.lavamesh.com'], magicDns: true });
    if (rest[0] === 'nameservers') return json(res, 200, { nameservers: ['1.1.1.1', '9.9.9.9'] });
    return notFound(res);
  }

  return notFound(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`demo headscale listening on http://127.0.0.1:${PORT}`);
  console.log(`  ${machines.length} machines · ${users.length} users · ${routes.length} routes`);
});
