/**
 * Verified Resend sender. Set EMAIL_FROM in production to a domain you've
 * verified in Resend (e.g. `LavaMesh <alerts@lavamesh.com>`).
 *
 * Never fall back to onboarding@resend.dev — that address only works in
 * Resend's sandbox and silently fails once you send to anyone else.
 */
export function emailFrom(fallback = 'LavaMesh <alerts@lavamesh.com>'): string {
  return process.env.EMAIL_FROM?.trim() || fallback;
}
