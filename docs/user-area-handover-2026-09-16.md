# User area (post-login) redesign — handover, 2026-09-16

Branch: `dev-miko` (pushed, commit `025995ce`). This doc picks up where
[`user-area-redesign-checklist.md`](./user-area-redesign-checklist.md) (dated 2026-09-15) left off —
read that one first for architecture background (the shell, the 3 entry routes, why most of this
area has no Figma reference). This doc covers everything that happened after it: a full sizing
sweep, a shadow standard, structural rebuilds of 3 tabs to match late-arriving Figma references,
and the current state to hand off.

## 1. What changed since the 2026-09-15 checklist

### Sizing sweep (all of `sidebar_user_profile/*` + the standalone pages it links out to)
Every tab was oversized relative to normal UI scale — some headings were literally `text-[36px]`
`md:text-[36px]`, buttons `h-[54px]`+, page padding `p-16`. Reduced across Dashboard, Profile, My
Learning, My Portfolio, History Payment, Assignment, Logbook, and the whole Start Learning
sub-tree (materi pdf/video/ppt, quiz, quiz/week, attendance, join_group). Standard scale landed
on: page padding `p-5` flat (no responsive steps), headings `text-2xl sm:text-3xl`, sub-headings
`text-lg sm:text-xl`, body `text-sm`/`text-xs`, buttons `h-11`, icon chips `size-11`/`size-12`
with `10px` radius. **If you find a hardcoded `text-[NNpx]` anywhere in this tree going forward,
it's a leftover — flatten it to the nearest Tailwind step above.**

### Shadow standard
User explicitly rejected the old "heavy shadow always on" look app-wide
(`shadow-[0px_0px_4-8px_rgba(0,0,0,0.25-0.5)]`, seen on ~40+ elements). Two rules now apply:
1. **Cards** (any bordered content container — stat cards, transaction cards, session cards,
   portfolio cards, info panels): use the exact shadow copied from the Dashboard stat cards, which
   the user confirmed as "perfect":
   ```
   shadow-[0px_2px_8px_-2px_rgba(11,31,59,0.06)] hover:shadow-[0px_4px_12px_-2px_rgba(11,31,59,0.1)] transition
   ```
2. **Inputs, buttons, small interactive elements**: no shadow by default, `hover:shadow-sm
   transition-shadow` only. If removing the shadow leaves a white element invisible against a white
   page, add `border border-[#D9D9D9]` (or `border-[#E5E7EB]`) instead of a shadow.

This was applied to every input component (`components/ui/input/{email,password,search,
editable_field}`, the auth username field), every card in Dashboard/History Payment/My
Portfolio/Assignment/Start Learning, and the public registration forms
(`payments/registration.hbs`, `free_program/form_daftar_program.hbs`). **Do a final grep before
shipping**: `grep -rn 'shadow-\[0px_0px_[0-9]*px' src/views/partials/user/ src/views/user/` — a
few may still be lurking in files this pass didn't reach (see §3 below).

### Structural rebuilds (from real Figma screenshots the user pasted directly — not pulled via API)
Figma API access has been rate-limited most of this session (Viewer-seat quota, ~429s, multi-day
reset window — see §4). The user pasted real screenshots of 3 additional Figma frames not covered
by the original checklist's `598:2107` node fetch. These drove actual layout changes, not just
sizing:

- **History Payment** (`sidebar_user_profile/history_payment/{full_payment,registration,
  installment}/index.hbs`): was a 3-column card grid, Figma shows a single-column **row list**
  (icon, title+category, payment date, payment method, status pill, actions, all in one row). All
  3 sub-tabs rebuilt to match. Added a real **Payment Proof modal** wired to `payments.file` /
  `registrations.file` (only renders "View proof" when that column is non-null — installment's API
  response doesn't currently return a `file` field at all, so that tab has no proof button; if the
  friend wants it, `PaymentsService.getUserInstallmentDetail` needs to select it).
- **Start Learning** (`sidebar_user_profile/my_learning/start_learning/index.hbs`): was a single
  stacked column (program banner on top, weeks below). Figma shows two columns — weeks as the main
  (left) content, a sticky compact program card on the right with image, category badge, title,
  description, and **3 stacked buttons**: Join Group (`toggleActiveSection('group-class')`), My
  Logbook (`toggleActiveSection('logbook')`), Detail Program (real link to
  `/program/detail/{{course.id}}`, previously a dead `href="#"`). Restructured via a
  `lg:grid lg:grid-cols-[1fr_320px]` wrapper — the huge `{{#each course.weeks}}` loop's *internals*
  were **not** touched, only the wrapper around it, to avoid the risk of botching the
  session-unlock logic (still governed by `PRD-sequential-session-unlock.md`, still high-risk, see
  the 2026-09-15 checklist §4 warning — it still applies).
- **My Portfolio** (`sidebar_user_profile/my_portofolio/index.hbs`): was a horizontal filter row
  (3 dropdowns + a Clear Filter link). Figma shows a **left sidebar filter card** — "Active
  Filters" summary with pills + Reset, Category filter (search input + `<select>`), Class Type
  filter (search input + `<select>`), a "N Projects Available" counter — with results in a right
  column. Rebuilt with a `lg:grid lg:grid-cols-[280px_1fr]` wrapper. Note: switched the dropdowns
  from the old custom Alpine button+panel pattern to plain `<select x-model="...">` — functionally
  identical (`categoryFilter`/`classTypeFilter` still drive `filteredPortfolios()`), just simpler
  markup. Added `categorySearch`/`classTypeSearch` to `x-data` for the new search-above-dropdown
  inputs (client-side `.filter()` on the hardcoded option lists — those lists were already
  hardcoded before this pass, not something introduced here).

### App shell fixes (`src/views/user/user_profile/index.hbs`)
- **Log Out was fighting three different layout approaches this session** before landing right.
  Final state: the sidebar's outer `<div>` is `self-stretch` (so its white background/border
  always match the height of whichever tab content is taller, never "cuts off" early). `<nav>` is
  its own `lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-72px)] overflow-y-auto` region with
  `pb-24` reserved at the bottom. **Log Out is a sibling `<div>`, not inside `<nav>`, using real
  `position: fixed` (`fixed bottom-0 left-0`)** — genuinely independent of nav scroll/height, so it
  can never be pushed off-screen or overlap nav content no matter how many sidebar items exist.
  If you need to touch the sidebar again, keep these three pieces (outer self-stretch box / sticky
  scrolling nav / fixed Log Out) as separate concerns — collapsing them back into one flex column
  reintroduces the exact bugs that got fixed.
- **Language switcher was rendering completely blank** (`components/ui/nav/lang_switcher` reads a
  `lang` Alpine var from scope, but the shell's own `x-data` never defined one — it only worked
  elsewhere because `navbar.hbs` defines `lang: '{{lang}}'` locally, and this shell doesn't include
  navbar). Fixed by adding `lang: '{{lang}}'` to the shell's top-level `x-data`. `{{lang}}` is
  globally available via `res.locals.lang` (set in `main.ts`), so this works on all 3 entry routes
  without controller changes.
- **Assignment status badge was overlapping the collapse-chevron button** — the badge used
  `absolute top-6 right-6`, landing directly on top of the header row's chevron toggle (also
  right-aligned, same vertical zone). Fixed by moving the badge into normal document flow (a
  `flex justify-end` row above the header) instead of absolute-positioning it.

### Data seeding
The local dev Postgres DB ships essentially empty (no weeks/sessions/logbook/assignments/quiz/
payments/portfolio rows at all for the seeded `indra@gmail.com` test user, and only 1 course
existed total: "Full Stack Developer"). Seeded real rows (not hardcoded template text) so every
tab actually shows content instead of empty states:
- 2 weeks + 4 sessions + 3 materials for Full Stack Developer
- 2 logbook entries (1 approved, 1 in review), 4 assignments + 2 submissions, 1 quiz + 3
  questions/answers + 1 score, session/week progress (week 1 complete → week 2 unlocked),
  attendance records
- 2 more courses ("UI/UX Design Fundamentals", "Digital Marketing Essentials") + enrolled indra in
  both, so My Learning / Continue Learning show more than one row
- 1 registration, 1 full payment, 1 installment plan (month 1 paid, month 2 processing, month 3
  upcoming) + a proof file URL on the full-payment row
- 2 portfolio items

**This is all local-only** — nothing in this seed data touched migrations or seed scripts in the
repo (no `src/database/seeds/*` changes), it was raw `psql` INSERTs against the local
`e_learning_test` DB (port 5433). A fresh clone/fresh DB will be empty again. If the friend wants
this reproducible, the INSERT statements aren't saved anywhere — they were run and discarded as
scratch SQL files this session. Worth turning into a proper seed script if this keeps coming up.

## 2. Flagged issues — not fixed, need a decision

- **`assignment/index.hbs`**: hardcoded `"Poin: 90/100 Good Job"` score shown for every approved
  assignment. Pre-existing (not introduced this session), commented in the code as a placeholder
  ("no score/grade column exists yet on answer_task"). Real fabricated-looking data — needs either
  a real `score` column on `answer_task` or the text removed.
- **`user/payment.hbs`** (standalone, `GET /payment/detail/:courseId`): the whole page ignores the
  `course` variable the controller passes in and shows hardcoded "Belajar Web Development" +
  a stock Unsplash photo. Pre-existing, not touched — needs the template rewired to use `course.*`.
- **`join_group/index.hbs`**: "Join Now" button is `href="#"` — no real group-join flow exists.
  Pre-existing.
- **`user/myportfolio.hbs`**: confirmed orphaned — grepped the whole codebase, zero real `<a href>`
  or `window.location` pointing at `GET /portfolio/myportfolio/:userId` anywhere, only an
  inactive-state URL matcher in navbar. Left untouched on purpose.
- **Dashboard's "Certificates Earned" stat** is a proxy (`= completedCount`), not a real
  certificate-issuance query — noted in the 2026-09-15 checklist already, still true.

## 3. Not yet covered by this pass — genuinely unaudited

These were named directly by the user in the last session but never opened:

- `materi/{pdf,video,ppt}.hbs` — **a separate, top-level standalone page tree** rendered by
  `materials.controller.ts`, distinct from `sidebar_user_profile/my_learning/start_learning/
  materi/*` (which WAS fixed). Route paths like `/learning-material/:fileType/:sessionId`. Nobody
  has opened these files this whole redesign effort.
- `user/certificates/detail.hbs` (`certificates.controller.ts`) — never opened.
- `user/quiz/detail.hbs` (standalone variant, distinct from the sidebar quiz tabs which were sized)
  — never opened.
- `quiz/week/start/index.hbs` (the actual quiz-**taking** page, with the countdown timer) — only
  had its `<h1>` resized once, early in the session. Still contains hardcoded placeholder answer
  options ("Answer A/B/C/D") mixed into otherwise-real quiz logic. High-risk file (timer/scoring
  logic) — read it fully before touching again.
- `my_portofolio/detail/index.hbs` — never got the shadow-standard pass; still plain `shadow-sm`
  throughout instead of the Dashboard card shadow.
- The 4 legacy standalone pages (`riwayat.hbs`, `logbooks/*`, `portofolios/{create,edit}.hbs`,
  `biodata/{create,edit}.hbs`, `attendance/create.hbs`) — only their page-title `<h1>` got resized;
  the actual form/card content inside was never touched for the shadow standard or tighter scale.

## 4. Environment gotchas

- **Figma API is rate-limited** (Viewer-seat quota on the `figma-developer-mcp` unofficial MCP
  server configured in `.mcp.json`, gitignored). Hit 429 repeatedly this session with multi-day
  reset windows. Do not assume Figma pulls will work — check first, and if blocked, ask the user
  for screenshots rather than guessing at values.
- **The dev server (`npm run start:dev`) crashes on rapid consecutive file saves.** This happened
  ~4 times this session. Root cause: `nest start --watch`'s asset-copy watcher (chokidar) races
  against editor/sed temp files — it tries to copy a `.tmp.XXXXX` or `sedXXXXXX` file into `dist/`
  after the tool that created it has already deleted/renamed it, throwing an uncaught
  `ENOENT` and killing the whole `concurrently` process tree (fatal, not auto-restarting). Symptom:
  `curl localhost:3069` suddenly returns nothing / connection refused. Fix is just restarting
  (`npm run start:dev` again) — no code is actually broken when this happens, it's a tooling race,
  not a bug in the templates. If doing another large batch of scripted edits (sed loops especially),
  expect to restart the server partway through.
- Local Postgres: `e_learning_test` db, port 5433, user/pass `miko`/`miko`.
- Seeded test login used this session: `indra@gmail.com` / `12345678` (role `user`, `isVerified`
  manually flipped true — local seed data ships unverified by default).
- **Never touch anything under `src/views/admin/`, `src/views/partials/super_admin/`, or any
  controller path gated to `admin`/`super_admin` roles.** Checked via
  `git status --porcelain | grep -iE 'admin'` after every batch this whole session — stayed clean
  throughout. Keep doing this before every commit.

## 5. Suggested next steps, in priority order

1. Run the app, read through §3's unaudited files with fresh eyes before deciding what (if
   anything) they need.
2. Decide what to do with the 2 flagged fabricated-data spots (§2) — at minimum, they should be
   flagged to whoever owns the backend for those features.
3. If the friend wants Figma-accurate values instead of the "copied from the Dashboard/screenshot
   guesses" values used throughout this pass, wait out the API rate limit or get a Dev-seat
   upgrade — the visual result is close but not pixel-verified for anything outside the 3 real
   Figma screens (Dashboard, Profile, My Learning list) plus the 3 screenshot-driven rebuilds in
   §1.
4. Turn the local-only seed data (§1) into a real seed script if empty-state testing keeps coming
   up as a blocker.
