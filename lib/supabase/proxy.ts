import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Nothing to refresh without Supabase configured. This middleware only
    // refreshes the session cookie — it isn't the auth gate itself (see
    // app/dashboard and app/onboarding, which redirect unauthenticated
    // requests) — so pass the request through rather than crashing every
    // route, including the public marketing pages, on a missing env var.
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() validates the JWT signature against the project's published
  // public keys on every call — never trust getSession() here, it doesn't
  // guarantee revalidation.
  await supabase.auth.getClaims();

  return response;
}
