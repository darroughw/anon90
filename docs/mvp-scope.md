# Rhythm Recovery — MVP Scope

## Name & Mission

**Name:** Rhythm Recovery

**Mission statement:** Recovery isn't one decision. It's a rhythm you rebuild one day at a time. Rhythm Recovery gives you a place to track the daily commitments many people lean on in recovery: prayer, meetings, calls to your sponsor, calls to your fellowship. Paired with working the steps, it's built to help you keep that rhythm, one day at a time, through the first 90 days and beyond.

## Voice Guide

Four rules govern all copy in the app:

1. **Say the task, not the feeling about the task.** The app names what to do. It doesn't cheerlead.
   - Not: "You're crushing it! Keep the streak alive!"
   - Yes: "Day 14. Today's list is below."
2. **Plain words over program words.** No therapy jargon, no recovery-industry buzzwords.
   - Not: "Engage in supportive outreach with your fellowship."
   - Yes: "Call someone in the fellowship."
3. **A missed day is a fact, not a failure.** State what happened and move on. No guilt, no punishment language.
   - Not: "You broke your streak. Don't give up!"
   - Yes: "Streak reset to 0. The run continues."
4. **Never promise or imply an outcome.** The app describes what it does (track, remind, hold a record), not what it guarantees. No wording that suggests using it will produce sobriety, keep someone clean, or "carry" them through anything. That claim isn't ours to make.
   - Not: "This rhythm holds long enough to carry you through the first 90 days and past them."
   - Yes: "It's built to help you keep that rhythm, one day at a time."

Copy checklist before anything ships:
- No exclamation points except in genuinely rare moments (a major milestone, maybe)
- No em dashes
- No "journey," "empower," "unlock," or "crush it"
- No outcome claims or implied guarantees ("this will work," "keeps you sober," "carries you through")
- Every reminder and notification reads like something a calm sponsor would actually say out loud

## Tone & Visual Direction
- Cool, calm, quiet — not gamified, not loud
- Dark background throughout; headline text is white with a very faint glow (used sparingly — restraint over spectacle)
- Milestone badges carry the same treatment: dark chip, glowing white numeral/label
- Light mode is a planned future toggle, not part of MVP — see Color Palette below for both palettes

## Color Palette

**Dark (default, MVP)**
- `--rr-bg: #1A120B` — background
- `--rr-fg: #F2E9DD` — text, on dark background (15.4:1 contrast)
- `--rr-fg-muted: rgba(242, 233, 221, 0.72)` — secondary text
- `--rr-border: rgba(242, 233, 221, 0.24)` — dividers, input borders

**Light (future toggle, not built yet)** — warm palette on a cream background:
- `--rr-cream: #F2E9DD` — background
- `--rr-near-black: #1A120B` — primary text (15.4:1 on cream)
- `--rr-espresso: #3D2B1F` — secondary text (11.2:1 on cream)
- `--rr-forest: #3F4A34` — accent (7.8:1 on cream)
- `--rr-sienna: #A0522D` — mid accent, safe for normal text (4.7:1 on cream)
- `--rr-ochre: #C08A34` — decorative/large elements only, fails AA for text (2.5:1 on cream)
- `--rr-sand: #D9BFA0` — light fill only, not for text

Both palettes share the same near-black/cream pair, just inverted — the toggle swaps which one is the background.

## Auth & Identity
- Email/password + Google OAuth sign-in
- Auto-generated anonymous display name on signup (e.g. "QuietFalcon42"), editable anytime
- Real email stays private — never shown on shared dashboards

## Core Loop
- The daily checklist for the first 90 days is fixed, not user-defined:
  - Read literature
  - Pray or meditate (morning)
  - Call your sponsor
  - Call someone in the fellowship
  - Go to a meeting
  - Don't drink or use
  - Pray or meditate again at day's end
- Each day's checklist includes a comment/journal box — a note to your future self
- A day counts complete only if **all required tasks** are explicitly checked off before the day boundary
- Day boundary defaults to the user's local device timezone (captured at signup, adjustable in settings)
- Missing a day (not all required tasks closed) **resets the current streak to 0** — the underlying run continues, only the streak counter resets

## Milestones
- Progress is shown as a **progress bar toward the next milestone** — not a 90-day calendar grid
- Milestone sequence: **90 days → 6 months → 9 months → 1 year → 18 months → then annually**
- Reaching a milestone earns a badge in the same dark/glow visual language as headlines

## Dashboard
- Always visible: current **day streak** and current **week streak**
- Progress bar toward the next milestone
- Today's checklist + journal entry, front and center

## Encouragement & Resources
- Daily quote for encouragement
- Curated list of helpful links (fellowship meeting finders, hotlines, literature, etc.)

## Reminders
- In-app toast reminder for incomplete tasks ahead of day-end
- Email reminder as a secondary/backup channel
- User-configurable per channel (on/off), default timing TBD (e.g. 3 hrs before day-end)

## Email System
Two distinct categories — keep separate in the data model and unsubscribe logic:
- **Transactional**: reminders, streak/milestone notifications — tied to core product function
- **Subscriber/marketing**: product updates, tips — explicit opt-in, one-click unsubscribe required (CAN-SPAM/GDPR)

## Sharing
- Share a dashboard snapshot (streak, next-milestone progress) via SMS or email
- MVP: static snapshot, not a live/interactive shared view
- Shared snapshots never include journal entries, sponsor/fellowship contact info, or task-level detail — streak and milestone progress only
- Needs SMS + email delivery providers (via Vercel Marketplace)

## Privacy & Legal
- Privacy Policy required before launch — draft at [docs/privacy-policy.md](./privacy-policy.md)
- Recovery status and journal entries are sensitive personal data — treat with the same care as health data even where not legally required to
- Core commitments: no data retention beyond operational need, no selling/sharing data, analytics used only in aggregate for product improvement

## Explicitly Out of Scope for MVP
- Social feed / following other users
- Any public or default-visible display of recovery status
- Multiple concurrent 90-day challenges per user
- Custom badge design / gamification beyond milestone tiers
- Live/interactive shared dashboards (view-only snapshot only)

## Open Decisions
- Default reminder timing (how far ahead of day-end)
- Exact data retention window after account deletion (draft policy assumes 30 days)
- Source and rotation logic for the daily encouragement quote
- Curation source/ownership for the helpful-links list
- Provider choices for auth, email, SMS, analytics, hosting (via Vercel Marketplace once build starts)
