# Accessibility process

Rhythm Recovery targets WCAG 2.1 AA. This is a two-part process, not a
one-time launch checklist (see [ANO-12](https://linear.app/timewarptrivia/issue/ANO-12)):
automated checks catch regressions on every PR, and a periodic manual pass
catches what automation can't.

## Automated checks (every PR)

`.github/workflows/ci.yml` runs on every pull request:

- **`code-quality`** — lint (`npm run lint`, includes `eslint-config-next`'s
  `jsx-a11y` rules), typecheck (`npm run typecheck`), and a production build.
- **`accessibility`** — [`tests/a11y.spec.ts`](../tests/a11y.spec.ts) runs an
  [axe](https://github.com/dequelabs/axe-core) scan (`@axe-core/playwright`)
  against every public route (`/`, `/privacy`, `/login`, `/signup`) tagged
  `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` — this is what catches contrast
  failures, missing labels, and bad ARIA — plus a couple of hand-written
  keyboard-navigation checks (skip link, form field reachability).

Run either locally:

```bash
npm run lint
npm test          # runs Playwright; first run: npx playwright install chromium
```

New routes should be added to the `publicPages` list in `tests/a11y.spec.ts`
once they don't require auth to reach. Routes gated by Supabase auth
(`/dashboard`, `/onboarding`) aren't covered yet — CI has no signed-in
session to test against, and no Supabase project is provisioned for it.

## Manual pass (before a new screen or flow ships)

Automated scans catch maybe half of real accessibility problems — they miss
things like whether focus order makes sense, whether an interaction is
actually usable with a screen reader, or whether error messaging is
understandable. Before a new screen or flow ships (not on every PR — that's
what CI is for), walk through it against WCAG 2.1 AA:

1. **Keyboard only** — unplug the mouse. Tab through the whole flow. Every
   interactive element should be reachable, in a sensible order, with a
   visible focus indicator (`app/globals.css` already sets
   `:focus-visible`), and nothing should trap focus.
2. **Screen reader** — run it with VoiceOver (macOS: Cmd+F5) or a similar
   tool. Headings should form a sensible outline, form fields should
   announce their label and any error, and status changes (e.g. the sign-up
   confirmation) should be announced via `aria-live`/`role="status"` — check
   they still are.
3. **Zoom / reflow** — 200% browser zoom, no horizontal scrolling or clipped
   content.
4. **Color/contrast in context** — the palette's pre-computed contrast
   ratios in [docs/mvp-scope.md](mvp-scope.md) cover the tokens in
   isolation; check real combinations as used (e.g. text over an image or
   gradient) aren't covered by that table.
5. **Reduced motion** — enable "Reduce motion" in OS settings and confirm
   any animation respects `prefers-reduced-motion` (see `globals.css`).

File anything found as a Linear issue under the Anon90 / Rhythm Recovery
project rather than blocking the ship on a full fix, unless it's a hard
blocker (e.g. a flow that's entirely unusable by keyboard or screen reader).
