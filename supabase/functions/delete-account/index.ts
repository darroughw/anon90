import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Deletes the calling user's account: profile, activity history, and the auth user itself.
 *
 * Exists because account deletion needs the service-role key (to call
 * `auth.admin.deleteUser`), and that key must never ship inside a client binary — the web
 * app's server action can use it directly (see lib/supabase/admin.ts), but the iOS app has
 * no server of its own, so it calls this function instead. Both platforms end up sharing one
 * deletion code path.
 *
 * The caller's identity comes from their own JWT (verified via `getUser()`), never from a
 * client-supplied id — otherwise any signed-in user could delete any other user's account.
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userResult, error: userError } = await callerClient.auth.getUser();
  if (userError || !userResult.user) {
    return jsonResponse({ error: "Invalid or expired session" }, 401);
  }

  const userId = userResult.user.id;

  // Service-role client for the actual deletion. This key lives only in this function's
  // environment (set via `supabase secrets set` / the dashboard) -- never in app code.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Delete child rows before the parent, then the auth user last, so this is safe
  // regardless of what (if any) cascading foreign keys exist between profiles and
  // auth.users -- mirrors app/dashboard/actions.ts's deleteAccount on the web.
  const { error: entriesError } = await admin.from("daily_entries").delete().eq("user_id", userId);
  if (entriesError) {
    return jsonResponse({ error: entriesError.message }, 500);
  }

  const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
  if (profileError) {
    return jsonResponse({ error: profileError.message }, 500);
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return jsonResponse({ error: authError.message }, 500);
  }

  return jsonResponse({ success: true }, 200);
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
