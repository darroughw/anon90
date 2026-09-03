# Rhythm Recovery

A daily habit tracker that pairs fixed recovery commitments with the 12 steps, built to help people keep that rhythm one day at a time. See [docs/mvp-scope.md](docs/mvp-scope.md) for the full product scope, name, mission, and voice guide.

This repo holds the pre-launch landing page plus the early scaffolding of the full app (auth, onboarding, dashboard). The core product loop (daily checklist, streaks, milestones) is still tracked in Linear under the Anon90 team, Rhythm Recovery project, and mostly unbuilt.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- [Supabase](https://supabase.com) (`@supabase/ssr`) — auth and the app's data store
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
- `proxy.ts` — root middleware: gates `/login`, `/signup`, `/onboarding`, `/dashboard`, `/auth` behind Basic Auth on preview/dev deployments (via `DEV_BASIC_AUTH_PASSWORD`), then refreshes the Supabase session
- `emails/` — transactional email templates (see Email templates below)
- `docs/` — product scope, mission/voice guide, privacy policy draft, accessibility process, logo source

## Google integration

Sign-ups (from either the email field or the Google button) are appended as rows to a Google Sheet. Set these in `.env.local` (see [.env.local.example](.env.local.example) for the full walkthrough):

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — OAuth Client ID from [Google Cloud Console credentials](https://console.cloud.google.com/apis/credentials), used by the "Continue with Google" button and to verify tokens server-side. Public value, safe to expose to the browser.
- `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — a service account with Editor access to a Sheet with a "Signups" tab.

Without these, the Google button doesn't render and the API route falls back to just logging the email server-side (same as before). On Vercel, add the same variables under Project Settings → Environment Variables.

## Email templates

Built with [react-email](https://react.email), matching the voice guide (plain, no outcome promises, no hype):

- `emails/confirmation.tsx` — sent right after someone registers on the landing page
- `emails/launch.tsx` — sent to the list when the app is actually ready
- `emails/components/EmailLayout.tsx` — shared shell (logo, footer, privacy link, unsubscribe link)

Preview them locally:

```bash
npm run email:dev
```

Opens a browser preview at [http://localhost:3000](http://localhost:3000) (react-email's own dev server, separate from `next dev`) with live reload and per-client compatibility warnings.

Neither template is wired to actual sending yet — that's blocked on the same email provider decision as the rest of the email system (see docs/mvp-scope.md → Open Decisions). Once a provider is chosen, render these with `@react-email/render`'s `render()` and pass the resulting HTML to that provider's send call; `subject` is exported from each template file for convenience.

The email logo (`public/email/logo.png`) is a separate asset from the site logo: same mark, rendered in `--rr-sienna` (`#A0522D`) on a transparent background instead of the site's near-black or cream, since email clients can render either a white or a dark surface behind it and a single mid-tone reads on both. Regenerate it from `public/assets/logo/rhythm-recovery.svg` if the logo changes (swap `#F2E9DD` for `#A0522D` and re-rasterize at 480×340).

## Known gaps

- `[date]`, `[30]`, and `[Support email / contact method]` in the privacy policy are placeholders pending legal review and provider decisions.
- The final production email/SMS provider choice is still open (see docs/mvp-scope.md → Open Decisions); Google Sheets is a temporary landing-page capture point, not the long-term data store.

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
