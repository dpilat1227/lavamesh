import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];

export function proxy(req: NextRequest) {
  const token =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/install") ||
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/provision") ||
    pathname.startsWith("/api/cron/");

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, generated metadata image routes (these are
  // served without a file extension in their path, e.g. /apple-icon), and
  // any request path with a file extension — this covers everything in
  // `public/` (images, icons, etc.), which was previously being redirected
  // to /login for signed-out visitors.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
