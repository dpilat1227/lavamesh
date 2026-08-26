/**
 * Extra DNS records live in the Headscale ACL policy as dns.extra_records
 * (HuJSON). Headscale 0.23+ dropped the REST DNS extra-record APIs, so we
 * edit the policy document instead of calling /api/v1/dns.
 */

export interface DnsExtraRecord {
  name: string;
  type: string;
  value: string;
}

const RECORD_TYPES = ['A', 'AAAA', 'CNAME'] as const;

export function parseHujson(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,(\s*[}\]])/g, '$1');
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function policyTextFromResponse(policy: any): string {
  if (!policy) return '';
  if (typeof policy === 'string') return policy;
  return policy.policy || policy.acl || '';
}

export function getExtraRecords(policyText: string): DnsExtraRecord[] {
  const obj = parseHujson(policyText);
  if (!obj) return [];
  const dns = (obj.dns && typeof obj.dns === 'object') ? obj.dns as Record<string, unknown> : obj;
  const recs = dns.extra_records;
  if (!Array.isArray(recs)) return [];
  return recs
    .filter((r): r is Record<string, unknown> => r && typeof r === 'object')
    .map(r => ({
      name: String(r.name || ''),
      type: String(r.type || 'A').toUpperCase(),
      value: String(r.value || ''),
    }))
    .filter(r => r.name && r.value);
}

export function setExtraRecords(policyText: string, records: DnsExtraRecord[]): string {
  const obj = parseHujson(policyText) || {
    acls: [{ action: 'accept', src: ['*'], dst: ['*:*'] }],
  };
  const dns = (obj.dns && typeof obj.dns === 'object')
    ? { ...(obj.dns as Record<string, unknown>) }
    : {};
  dns.extra_records = records.map(r => ({
    name: r.name.trim(),
    type: (RECORD_TYPES.includes(r.type as typeof RECORD_TYPES[number]) ? r.type : 'A').toUpperCase(),
    value: r.value.trim(),
  }));
  obj.dns = dns;
  return JSON.stringify(obj, null, 2);
}

export function validateDnsRecord(record: DnsExtraRecord): string | null {
  const name = record.name.trim();
  const value = record.value.trim();
  const type = record.type.trim().toUpperCase();
  if (!name) return 'Enter a hostname.';
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(name) && !name.endsWith('.')) {
    return 'Hostname looks invalid.';
  }
  if (!RECORD_TYPES.includes(type as typeof RECORD_TYPES[number])) return 'Type must be A, AAAA, or CNAME.';
  if (!value) return 'Enter a record value.';
  return null;
}
