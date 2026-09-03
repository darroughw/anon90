import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-only code that has no user session to act
 * on behalf of (cron jobs, the unsubscribe route) and needs to read/write
 * across users, bypassing RLS. Never import this into anything reachable
 * from a request that isn't independently authorized (a verified cron
 * secret, a verified unsubscribe token, etc).
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the admin client");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
