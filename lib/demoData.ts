/** Fixed sample network for the public demo. Nothing here is a live Headscale server. */

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const demoNodes = [
  {
    id: '1',
    givenName: 'drews-macbook',
    online: true,
    lastSeen: hoursAgo(0.05),
    createdAt: hoursAgo(24 * 40),
    expiry: '',
    ipAddresses: ['100.64.0.1', 'fd7a:115c:a1e0::1'],
    user: { name: 'admin' },
  },
  {
    id: '2',
    givenName: 'london-exit-node',
    online: true,
    lastSeen: hoursAgo(0.1),
    createdAt: hoursAgo(24 * 20),
    expiry: '',
    ipAddresses: ['100.64.0.2', 'fd7a:115c:a1e0::2'],
    user: { name: 'admin' },
  },
  {
    id: '3',
    givenName: 'raspberry-pi-4',
    online: false,
    lastSeen: hoursAgo(6),
    createdAt: hoursAgo(24 * 90),
    expiry: '',
    ipAddresses: ['100.64.0.3', 'fd7a:115c:a1e0::3'],
    user: { name: 'home' },
  },
  {
    id: '4',
    givenName: 'staging-server',
    online: true,
    lastSeen: hoursAgo(0.2),
    createdAt: hoursAgo(24 * 12),
    expiry: '',
    ipAddresses: ['100.64.0.4', 'fd7a:115c:a1e0::4'],
    user: { name: 'admin' },
  },
  {
    id: '5',
    givenName: 'phone',
    online: true,
    lastSeen: hoursAgo(1),
    createdAt: hoursAgo(24 * 8),
    expiry: '',
    ipAddresses: ['100.64.0.5', 'fd7a:115c:a1e0::5'],
    user: { name: 'home' },
  },
];

export const demoTags: Record<string, string[]> = {
  '2': ['exit'],
  '3': ['home'],
  '4': ['servers'],
};

export const demoUptimeLogs = Array.from({ length: 24 }, (_, i) => ({
  createdAt: new Date(Date.now() - (24 - i) * 60 * 60 * 1000),
  isOnline: i !== 9,
}));

export const demoRoutes = [
  {
    id: 'r1',
    prefix: '0.0.0.0/0',
    advertised: true,
    enabled: true,
    isPrimary: true,
    machine: { id: '2', givenName: 'london-exit-node', ipAddresses: ['100.64.0.2'] },
  },
  {
    id: 'r2',
    prefix: '192.168.1.0/24',
    advertised: true,
    enabled: true,
    isPrimary: true,
    machine: { id: '3', givenName: 'raspberry-pi-4', ipAddresses: ['100.64.0.3'] },
  },
  {
    id: 'r3',
    prefix: '10.0.0.0/24',
    advertised: true,
    enabled: false,
    isPrimary: false,
    machine: { id: '4', givenName: 'staging-server', ipAddresses: ['100.64.0.4'] },
  },
];

export const demoUsers = ['admin', 'home'];

export const demoUserRecords = [
  { name: 'admin', createdAt: hoursAgo(24 * 40) },
  { name: 'home', createdAt: hoursAgo(24 * 30) },
];

export const demoNodeCounts: Record<string, number> = { admin: 3, home: 2 };

export const demoNodesByUser = {
  admin: demoNodes.filter(n => n.user.name === 'admin').map(n => ({
    id: n.id, givenName: n.givenName, online: n.online, lastSeen: n.lastSeen,
  })),
  home: demoNodes.filter(n => n.user.name === 'home').map(n => ({
    id: n.id, givenName: n.givenName, online: n.online, lastSeen: n.lastSeen,
  })),
};

export const demoKeys = [
  {
    key: 'tskey-auth-demo-7f3a9c',
    reusable: true,
    ephemeral: false,
    used: false,
    expiration: hoursAgo(-24 * 20),
    createdAt: hoursAgo(24 * 2),
    user: 'admin',
  },
  {
    key: 'tskey-auth-demo-b21e04',
    reusable: false,
    ephemeral: false,
    used: true,
    expiration: hoursAgo(-24 * 5),
    createdAt: hoursAgo(24 * 8),
    user: 'home',
  },
  {
    key: 'tskey-auth-demo-e90c11',
    reusable: false,
    ephemeral: true,
    used: false,
    expiration: hoursAgo(-2),
    createdAt: hoursAgo(3),
    user: 'admin',
  },
];

export const demoAuditEvents = [
  { id: 'a1', ts: hoursAgo(0.4), action: 'key.generate', meta: { user: 'admin' } },
  { id: 'a2', ts: hoursAgo(2), action: 'node.rename', meta: { nodeId: '4', newName: 'staging-server' } },
  { id: 'a3', ts: hoursAgo(6), action: 'route.failover', meta: { prefix: '192.168.1.0/24' } },
  { id: 'a4', ts: hoursAgo(26), action: 'acl.update', meta: { source: 'visual-builder' } },
  { id: 'a5', ts: hoursAgo(50), action: 'user.create', meta: { name: 'home' } },
];
