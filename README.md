# Rhythm Recovery

A daily habit tracker that pairs fixed recovery commitments with the 12 steps, built to help people keep that rhythm one day at a time. See [docs/mvp-scope.md](docs/mvp-scope.md) for the full product scope, name, mission, and voice guide.

The homepage links straight into real sign-up/sign-in — this is the live product, not a pre-launch waitlist. Tracked in Linear under the Anon90 team, Rhythm Recovery project.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- [Supabase](https://supabase.com) (`@supabase/ssr`) — auth and the app's data store
- [Vercel Analytics](https://vercel.com/docs/analytics) (`@vercel/analytics`) — page view tracking; only reports when deployed on Vercel, a no-op locally
- No UI framework or CSS library, plain CSS in [app/globals.css](app/globals.css); a small shared primitives library in `components/ui/`

## Getting started

```bash
npm install
cp .env.local.example .env.local  # fill in credentials, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The homepage itself renders with no configuration, but its "Create your account" button leads to `/signup`, which needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set to a real Supabase project to actually work — without them `/login`, `/signup`, `/dashboard`, and `/onboarding` render but auth actions fail.

## Structure

- `app/page.tsx` — homepage (logo, mission statement, links to create an account or sign in)
- `app/privacy/page.tsx` — privacy policy page (kept in sync with [docs/privacy-policy.md](docs/privacy-policy.md))
- `app/terms/page.tsx` — terms of service page (kept in sync with [docs/terms-of-service.md](docs/terms-of-service.md))
- `app/login/`, `app/signup/` — Supabase email/password + Google OAuth sign-in
- `app/onboarding/` — post-signup profile setup, redirects to `/dashboard` once a profile exists
- `app/dashboard/` — the (early) authenticated app shell
- `app/auth/callback/route.ts` — OAuth callback, exchanges the code for a session
- `app/design-system/` — internal preview of the `components/ui/` primitives
- `app/not-found.tsx` — custom 404
- `app/api/subscribe/route.ts` — legacy pre-launch waitlist endpoint (verifies a Google ID token or a plain email, then records the row); not linked from the site anymore, kept working in case it's needed again
- `app/robots.ts`, `app/sitemap.ts` — SEO metadata routes
- `public/llms.txt` — plain-language summary for AI crawlers/answer engines
- `components/SignupForm.tsx` — legacy pre-launch waitlist form (including the Google Identity Services button); not rendered anywhere currently
- `components/auth/` — `LoginForm`, `SignUpForm`
- `components/ui/` — shared primitives (Button, Input, Dialog, Toast, Switch, etc.)
- `components/ThemeToggle.tsx` — dark/light switch (footer, every page); dark is the default, choice persists in `localStorage`, applied via a blocking inline script in `app/layout.tsx` before first paint to avoid a flash of the wrong theme. Light-mode tokens live in `app/globals.css` under `:root[data-theme="light"]`.
- `lib/supabase/` — `client.ts`/`server.ts` (browser/server Supabase clients), `proxy.ts` (session-refresh middleware helper)
- `lib/verifyGoogleToken.ts` — verifies a Google Sign-In ID token server-side
- `lib/googleSheets.ts` — appends a signup row to a Google Sheet via a service account
- `lib/streaks.ts`, `lib/milestones.ts`, `lib/generateUsername.ts` — core-loop helpers used by onboarding/dashboard
- `lib/quotes.ts`, `lib/helpfulLinks.ts` — dashboard content (daily quote, curated resource links)
- `lib/timezone.ts` — local-hour/local-date helpers for a given IANA timezone, used server-side (no "device" in a cron job) to compute each user's day boundary
- `lib/unsubscribeToken.ts` — signs/verifies the token used by `/unsubscribe`
- `lib/apns.ts` — signs an APNs auth token (ES256 JWT) and sends alert pushes over HTTP/2
- `lib/supabase/admin.ts` — service-role client for server-only code with no user session (the reminders cron, `/unsubscribe`)
- `proxy.ts` — root middleware: gates `/login`, `/signup`, `/onboarding`, `/dashboard`, `/auth` behind Basic Auth on preview/dev deployments (via `DEV_BASIC_AUTH_PASSWORD`), then refreshes the Supabase session
- `app/api/cron/reminders/route.ts` — hourly (see `vercel.json`): pushes to users whose local time is 9pm and whose checklist for the day isn't complete
- `app/unsubscribe/` — one-click unsubscribe from marketing/subscriber emails, verifies a signed token, no login required
- `supabase/migrations/` — schema changes, applied by hand via the Supabase SQL Editor (no `supabase` CLI linkage yet)
- `emails/` — transactional email templates (see Email templates below)
- `docs/` — product scope, mission/voice guide, privacy policy and terms of service drafts, accessibility process, logo source

## Google integration (legacy pre-launch waitlist)

`components/SignupForm.tsx` and `app/api/subscribe/` still work but aren't linked from the site anymore — the homepage now sends people straight to real sign-up. Kept in case a waitlist capture point is needed again; if not, safe to remove along with `lib/googleSheets.ts` and `lib/verifyGoogleToken.ts`. When it was live, sign-ups (from either the email field or the Google button) were appended as rows to a Google Sheet. Set these in `.env.local` (see [.env.local.example](.env.local.example) for the full walkthrough):

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth Client ID from [Google Cloud Console credentials](https://console.cloud.google.com/apis/credentials), used by the "Continue with Google" button and to verify tokens server-side. Public value, safe to expose to the browser.
- `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — a service account with Editor access to a Sheet with a "Signups" tab.

Without these, the Google button doesn't render and the API route falls back to just logging the email server-side (same as before). On Vercel, add the same variables under Project Settings → Environment Variables.

## Email templates

Built with [react-email](https://react.email) and sent via [Resend](https://resend.com), matching the voice guide (plain, no outcome promises, no hype):

- `emails/confirmation.tsx` — sent right after someone registers via the legacy waitlist endpoint (transactional/subscriber — see Email system below); dormant while that endpoint is unlinked
- `emails/launch.tsx` — for the list when the app is ready; not wired to an actual send yet (no bulk-send/campaign tooling built)
- `emails/authAction.tsx` — signup confirmation, password reset, magic link, email change — sent via a Supabase Auth "Send Email" hook (`app/api/auth/send-email/route.tsx`) instead of Supabase's default sender/template
- `emails/components/EmailLayout.tsx` — shared shell (logo, footer, privacy link, optional unsubscribe link)

Preview them locally:

```bash
npm run email:dev
```

Opens a browser preview (react-email's own dev server, separate from `next dev`, on the next free port) with live reload and per-client compatibility warnings.

The email logo (`public/email/logo.png`) is a separate asset from the site logo: same mark, rendered in `--rr-sienna` (`#A0522D`) on a transparent background instead of the site's near-black or cream, since email clients can render either a white or a dark surface behind it and a single mid-tone reads on both. Regenerate it from `public/assets/logo/rhythm-recovery.svg` if the logo changes (swap `#F2E9DD` for `#A0522D` and re-rasterize at 480×340).

## Email system

Per docs/mvp-scope.md, transactional and marketing/subscriber emails are kept separate:

- **Transactional** (`authAction.tsx`) — tied to core product function, no unsubscribe link. Reminders are no longer an email — they're a push notification (see Reminders & cron below); users control both channels via the per-channel toggles in the profile-edit dialog.
- **Marketing/subscriber** (`confirmation.tsx`, `launch.tsx`) — explicit opt-in (`profiles.marketing_emails_opt_in`, off by default) and one-click unsubscribe (`app/unsubscribe/`, token-verified, no login required). This only covers registered users — the legacy pre-launch waitlist (Google Sheets-backed, see Google integration) has no working unsubscribe, since there's no per-row status to update there. Moot while that capture point is unlinked from the site.

## Reminders & cron

`app/api/cron/reminders/route.ts` needs to run hourly, but Vercel Cron only supports daily schedules on the Hobby plan — so it's triggered by a Supabase `pg_cron` job (`reminders-hourly`, see `supabase/migrations/20261106220000_schedule_reminders_with_pg_cron.sql`) that calls the route via `pg_net`. (It used to be a GitHub Actions scheduled workflow, but GitHub's schedules are best-effort and fired only every 5–8 hours, so most users' 9pm hour was skipped.)

The job reads the bearer token from Supabase Vault at run time, so it needs a Vault secret named `cron_secret` with the same value as the Vercel `CRON_SECRET` env var (the route checks `Authorization: Bearer <CRON_SECRET>`, so both need to match). Set it in **Dashboard → Project Settings → Vault**, or `select vault.create_secret('<value>', 'cron_secret');`. If you rotate `CRON_SECRET`, update both.

To see recent runs and their HTTP status:

```sql
select start_time, status, return_message from cron.job_run_details order by start_time desc limit 10;
select created, status_code, error_msg from net._http_response order by created desc limit 10;
```

If this project ever moves to Vercel Pro, a native Vercel Cron entry in `vercel.json` (`{"crons":[{"path":"/api/cron/reminders","schedule":"0 * * * *"}]}`) is an alternative — unschedule the `pg_cron` job first (`select cron.unschedule('reminders-hourly');`) so reminders aren't sent twice.

To test locally, call the route directly with the header:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

A user's local day boundary (used both for the dashboard's `localToday()` and for this cron job) relies on `profiles.timezone`, captured once at onboarding via `Intl.DateTimeFormat().resolvedOptions().timeZone`. There's no UI to change it after signup yet.

The reminder itself is a push notification, sent via `lib/apns.ts` to every row in `device_tokens` for a due, incomplete-checklist user (the iOS app registers a token there — see `ios/RhythmRecovery/Services/PushNotificationManager.swift` and `DeviceTokenRepository.swift`). Needs these env vars, none of which are set yet (the route logs and skips a user's push when they're missing, same as the old `RESEND_API_KEY` fallback):

- `APNS_KEY_ID`, `APNS_TEAM_ID` — from the Apple Developer account's APNs Auth Key (Certificates, Identifiers & Profiles → Keys)
- `APNS_PRIVATE_KEY` — the `.p8` key's contents (`\n`-escaped if set as a single-line env var)
- `APNS_BUNDLE_ID` — `com.rhythmrecovery.app` (must match `ios/project.yml`'s `PRODUCT_BUNDLE_IDENTIFIER`)
- `APNS_ENV` — `production` once shipping via TestFlight/App Store; anything else (including unset) uses the sandbox APNs host, matching the `aps-environment: development` entitlement `ios/project.yml` ships with today

## Known gaps

- `supabase/migrations/` isn't applied automatically — there's no `supabase` CLI project link, so new migrations need to be pasted into the Supabase SQL Editor by hand.
- The legacy pre-launch waitlist (Google Sheets) has no working unsubscribe, and isn't linked from the site (see Email system above) — candidate for removal.
- `profiles.timezone` has no settings-page UI to change after onboarding.
- No APNs auth key has been generated yet — `lib/apns.ts` is wired up but every push send no-ops (logged, not thrown) until `APNS_KEY_ID`/`APNS_TEAM_ID`/`APNS_PRIVATE_KEY` are set.
- `ios/project.yml`'s push entitlement is pinned to `aps-environment: development`; flip it to `production` before archiving a release build, or device tokens registered against a TestFlight/App Store build won't be reachable in the `production` APNs environment (and vice versa).

## CI & accessibility

Every PR runs lint, typecheck, a production build, and an automated
accessibility scan (axe, WCAG 2.1 AA) via GitHub Actions
(`.github/workflows/ci.yml`). See [docs/accessibility.md](docs/accessibility.md)
for what's automated vs. the periodic manual a11y pass new screens/flows
should get before shipping.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run a production build locally
- `npm run lint` — ESLint (Next.js config)
- `npm run typecheck` — TypeScript, no emit
- `npm test` — Playwright a11y/e2e checks (first run: `npx playwright install chromium`)
