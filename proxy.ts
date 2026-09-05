import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PROTECTED_PREFIXES = [
  "/signup",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/dashboard",
  "/auth",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function unauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Rhythm Recovery dev"' },
  });
}

export async function proxy(request: NextRequest) {
  // Gates the in-progress app (not the public landing page) behind Basic
  // Auth while it's not launch-ready. Only set on preview/development env
  // vars, never production, so promoting to prod can't lock out real users.
  const devPassword = process.env.DEV_BASIC_AUTH_PASSWORD;

  if (devPassword && isProtectedPath(request.nextUrl.pathname)) {
    const expected = `Basic ${Buffer.from(
      `${process.env.DEV_BASIC_AUTH_USER ?? "rhythm"}:${devPassword}`,
    ).toString("base64")}`;

    if (request.headers.get("authorization") !== expected) {
      return unauthorized();
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
