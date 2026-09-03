# Rhythm Recovery

A daily habit tracker that pairs fixed recovery commitments with the 12 steps, built to help people keep that rhythm one day at a time. See [docs/mvp-scope.md](docs/mvp-scope.md) for the full product scope, name, mission, and voice guide.

This repo holds the pre-launch landing page plus the early scaffolding of the full app (auth, onboarding, dashboard). The core product loop (daily checklist, streaks, milestones) is still tracked in Linear under the Anon90 team, Rhythm Recovery project, and mostly unbuilt.

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

The landing page and sign-up form work with no configuration (email address, logged server-side). The "Continue with Google" button and Google Sheets persistence only activate once the Google env vars below are set. `/login`, `/signup`, `/dashboard`, and `/onboarding` need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set to a real Supabase project to work — without them those routes render but auth actions will fail.

## Structure

- `app/page.tsx` — landing page (logo, mission statement, early-access sign-up)
- `app/privacy/page.tsx` — privacy policy page (kept in sync with [docs/privacy-policy.md](docs/privacy-policy.md))
- `app/login/`, `app/signup/` — Supabase email/password + Google OAuth sign-in
- `app/onboarding/` — post-signup profile setup, redirects to `/dashboard` once a profile exists
- `app/dashboard/` — the (early) authenticated app shell
- `app/auth/callback/route.ts` — OAuth callback, exchanges the code for a session
- `app/design-system/` — internal preview of the `components/ui/` primitives
- `app/not-found.tsx` — custom 404
- `app/api/subscribe/route.ts` — sign-up endpoint: verifies a Google ID token or a plain email, then records the row
- `app/robots.ts`, `app/sitemap.ts` — SEO metadata routes
- `public/llms.txt` — plain-language summary for AI crawlers/answer engines
- `components/SignupForm.tsx` — landing-page sign-up form, including the Google Identity Services button
- `components/auth/` — `LoginForm`, `SignUpForm`
- `components/ui/` — shared primitives (Button, Input, Dialog, Toast, Switch, etc.)
- `lib/supabase/` — `client.ts`/`server.ts` (browser/server Supabase clients), `proxy.ts` (session-refresh middleware helper)
- `lib/verifyGoogleToken.ts` — verifies a Google Sign-In ID token server-side
- `lib/googleSheets.ts` — appends a signup row to a Google Sheet via a service account
- `lib/streaks.ts`, `lib/milestones.ts`, `lib/generateUsername.ts` — core-loop helpers used by onboarding/dashboard
- `lib/quotes.ts`, `lib/helpfulLinks.ts` — dashboard content (daily quote, curated resource links)
- `lib/timezone.ts` — local-hour/local-date helpers for a given IANA timezone, used server-side (no "device" in a cron job) to compute each user's day boundary
- `lib/unsubscribeToken.ts` — signs/verifies the token used by `/unsubscribe`
- `lib/supabase/admin.ts` — service-role client for server-only code with no user session (the reminders cron, `/unsubscribe`)
- `proxy.ts` — root middleware: gates `/login`, `/signup`, `/onboarding`, `/dashboard`, `/auth` behind Basic Auth on preview/dev deployments (via `DEV_BASIC_AUTH_PASSWORD`), then refreshes the Supabase session
- `app/api/cron/reminders/route.tsx` — hourly (see `vercel.json`): emails users whose local time is 9pm and whose checklist for the day isn't complete
- `app/unsubscribe/` — one-click unsubscribe from marketing/subscriber emails, verifies a signed token, no login required
- `supabase/migrations/` — schema changes, applied by hand via the Supabase SQL Editor (no `supabase` CLI linkage yet)
- `emails/` — transactional email templates (see Email templates below)
- `docs/` — product scope, mission/voice guide, privacy policy draft, accessibility process, logo source

## Google integration

Sign-ups (from either the email field or the Google button) are appended as rows to a Google Sheet. Set these in `.env.local` (see [.env.local.example](.env.local.example) for the full walkthrough):

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth Client ID from [Google Cloud Console credentials](https://console.cloud.google.com/apis/credentials), used by the "Continue with Google" button and to verify tokens server-side. Public value, safe to expose to the browser.
- `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — a service account with Editor access to a Sheet with a "Signups" tab.

Without these, the Google button doesn't render and the API route falls back to just logging the email server-side (same as before). On Vercel, add the same variables under Project Settings → Environment Variables.

## Email templates

Built with [react-email](https://react.email) and sent via [Resend](https://resend.com), matching the voice guide (plain, no outcome promises, no hype):

- `emails/confirmation.tsx` — sent right after someone registers on the landing page (transactional/subscriber — see Email system below)
- `emails/launch.tsx` — for the list when the app is ready; not wired to an actual send yet (no bulk-send/campaign tooling built)
- `emails/authAction.tsx` — signup confirmation, password reset, magic link, email change — sent via a Supabase Auth "Send Email" hook (`app/api/auth/send-email/route.tsx`) instead of Supabase's default sender/template
- `emails/reminder.tsx` — the email half of Reminders, sent by `app/api/cron/reminders/route.tsx`
- `emails/components/EmailLayout.tsx` — shared shell (logo, footer, privacy link, optional unsubscribe link)

Preview them locally:

```bash
npm run email:dev
```

Opens a browser preview (react-email's own dev server, separate from `next dev`, on the next free port) with live reload and per-client compatibility warnings.

The email logo (`public/email/logo.png`) is a separate asset from the site logo: same mark, rendered in `--rr-sienna` (`#A0522D`) on a transparent background instead of the site's near-black or cream, since email clients can render either a white or a dark surface behind it and a single mid-tone reads on both. Regenerate it from `public/assets/logo/rhythm-recovery.svg` if the logo changes (swap `#F2E9DD` for `#A0522D` and re-rasterize at 480×340).

## Email system

Per docs/mvp-scope.md, transactional and marketing/subscriber emails are kept separate:

- **Transactional** (`authAction.tsx`, `reminder.tsx`) — tied to core product function, no unsubscribe link; users control reminders via the per-channel toggles in the profile-edit dialog instead.
- **Marketing/subscriber** (`confirmation.tsx`, `launch.tsx`) — explicit opt-in (`profiles.marketing_emails_opt_in`, off by default) and one-click unsubscribe (`app/unsubscribe/`, token-verified, no login required). This only covers registered users — the pre-launch waitlist (Google Sheets-backed, see Google integration) has no working unsubscribe yet, since there's no per-row status to update there; that's expected to go away once Sheets is replaced as the capture mechanism.

## Reminders & cron

`app/api/cron/reminders/route.tsx` needs to run hourly, but Vercel Cron only supports daily schedules on the Hobby plan — so it's triggered instead by a GitHub Actions scheduled workflow (`.github/workflows/reminders-cron.yml`), which needs a repo secret: **GitHub → Settings → Secrets and variables → Actions → New repository secret** → name `CRON_SECRET`, same value as the Vercel env var of the same name (the route checks `Authorization: Bearer <CRON_SECRET>`, so both need to match). If this project ever moves to Vercel Pro, switching back to a native Vercel Cron entry in `vercel.json` (`{"crons":[{"path":"/api/cron/reminders","schedule":"0 * * * *"}]}`) is simpler and one less thing depending on GitHub Actions staying enabled.

To test locally, call the route directly with the header:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

A user's local day boundary (used both for the dashboard's `localToday()` and for this cron job) relies on `profiles.timezone`, captured once at onboarding via `Intl.DateTimeFormat().resolvedOptions().timeZone`. There's no UI to change it after signup yet.

## Known gaps

- `[date]`, `[30]`, and `[Support email / contact method]` in the privacy policy are placeholders pending legal review.
- `supabase/migrations/` isn't applied automatically — there's no `supabase` CLI project link, so new migrations need to be pasted into the Supabase SQL Editor by hand.
- The pre-launch waitlist (Google Sheets) has no working unsubscribe (see Email system above).
- `profiles.timezone` has no settings-page UI to change after onboarding.

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
