# User area (post-login) redesign — checklist

Branch: `dev-miko`. Figma: file `LYJhMeQfBgu82us13XRHhv` ("Kesatria-Academy"), section
"Role User: Sudah Ikut Program" `830:8545` (+ empty "Belum Ikut Program Apapun" `830:8544`).
Full inventory + decisions: see conversation 2026-09-15. Scope confirmed with user:
build the new Dashboard page, reskin the 6 undesigned areas to our internal standard,
fold the two legacy profile routes into `user_profile/index`, build a real empty state.

Standard to apply (same as legacy program pages / About / Alumni pass): `.page-shell`,
`sizeClass`, `font-inter`, standard card hover
(`transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_12px_28px_rgba(11,31,59,0.10)]`),
shared `eyebrow`/`carousel_nav`/`program_filter`/`empty_state` components where they fit.

## ARCHITECTURE CORRECTION (found 2026-09-15 mid-execution, updating before continuing)
The real shape is NOT "many separate top-level pages." **`src/views/user/user_profile/index.hbs`
IS the shell** — one big Alpine `x-data` single-page app with a sidebar + `x-show` tab panels for
Profile / My Learning / My Portfolio / History Payment / Logbook / Quiz-start / Join Group Class /
Certificate (inline mini-panel), each pulling in a `partials/user/sidebar_user_profile/*` partial.
Assignment/Quiz/Presentation tabs are loaded async via `fetch` from
`/program/myProgram/:id/fragment*` (courses.controller.ts) into empty containers, then
`Alpine.initTree()`'d. This ONE shell is rendered by **3 different entry routes** that just vary
`activeSection`/preload data: `GET /users/profile` (users.controller.ts, the main navbar link),
`GET /program/myProgram/:id` (courses.controller.ts), `GET /quiz/start/:quizId` (quiz.controller.ts).
The top App bar in Figma = our already-reskinned global `navbar.hbs` (62px, `mt-[62px]` on the
shell confirms it sits under it) — **no new app bar component needed**.
Separately, there ARE real standalone full-page routes the shell links OUT to for drill-down
actions (NOT dead code, e.g. `<a :href="'/certificates/' + activeCourseId">` is literally in the
shell): `user/myportfolio` (`GET /portfolio/myportfolio/:userId`), `user/riwayat` + `user/payment`
(`GET /payment/history/:userId`, `/payment/detail/:courseId`), `user/portofolios/{create,detail,edit}`,
`user/logbooks/{index,createLog,edit,detail}`, `user/quiz/{quiz,detail}`, `user/attendance/create`,
`user/assignments`, `user/biodata/{create,edit}`, `user/certificates/detail`. Treat every file
listed in §5 as genuinely live unless proven otherwise — don't skip them as "probably dead."
One likely-dead outlier: `GET /register/:id` (auth.controller.ts, oddly placed under root
`@Controller()`) renders `user/mycourse` — old/orphaned, low priority, don't invest here without
re-checking first.

## 0. Shell — `src/views/user/user_profile/index.hbs` (528 lines, Alpine SPA — edit surgically)
Rule: touch classes/layout/copy only. Never change `x-data` keys, `@click` handlers, `:class`
bindings' underlying logic, method bodies, or `{{> partial}}` include paths — this file is the
single point of failure for the whole logged-in area.
- [x] Root div: `font-montserrat` (line 7) → `font-inter` — DONE 2026-09-15
- [x] Added **Dashboard** as the first nav item (mobile horizontal nav AND desktop sidebar,
      numbered comments 1-5 renumbered), default `activeSection` now falls back to `'dashboard'`
      instead of `'profile'` when no `?tab=`/controller-set section is present. The other 2 entry
      routes (`/program/myProgram/:id`, `/quiz/start/:quizId`) still explicitly set their own
      `activeSection` so they're unaffected. Icon: no matching SVG asset exists for "dashboard" in
      `/public/image/user_profile/`, used `<i class="fas fa-gauge-high">` instead (same pattern
      already used by the existing Log Out button in this file, not a new convention) — DONE 2026-09-15
- [x] `x-show="activeSection === 'dashboard'"` panel added, includes new partial (see §1) — DONE
- [ ] Reskin nav buttons (sidebar + mobile) to the fuller standard hover/active treatment beyond
      what already existed — NOT done yet, current buttons were left as-is (they already use
      font-inter + navy active state, functionally fine, just not a full Figma pixel-match pass)
- [x] Figma sidebar order confirmed: Dashboard/Profile/My Learning/My Portfolio/History Payment/
      Log Out — matches now.
- KNOWN GAP: the Dashboard tab panel is server-rendered on all 3 entry routes but `dashboardStats`/
      `ongoingCourses` are only computed on the `GET /users/profile` route (see §1). Visiting the
      other 2 routes and manually clicking "Dashboard" in the sidebar shows blank/zero stats
      (not broken, just not accurate) — acceptable for now, note if revisited.
- [x] IMPORTANT FIX 2026-09-15: `/users/profile` is also hit by `admin`/`super_admin` roles
      (`@Roles('user','admin','super_admin')` on that controller method) — they get the sidebar
      hidden (pre-existing `{{#unless (or (eq user.role 'admin') (eq user.role 'super_admin'))}}`)
      but the tab panels underneath still render, so my new "default to dashboard" would have
      silently changed what admins land on too. Fixed: the default is now
      `{{#if (or (eq user.role "admin") (eq user.role "super_admin"))}}profile{{else}}dashboard{{/if}}`
      — admin/super_admin still default to `'profile'` exactly as before, verified with a real
      admin login (`mentor@gmail.com`). Zero admin/super_admin files touched, confirmed via
      `git status`.

## 1. Dashboard — DONE 2026-09-15 (Figma `830:9155`), pragmatic version
New partial `src/views/partials/user/sidebar_user_profile/dashboard/index.hbs`, included from the
shell as the `activeSection === 'dashboard'` tab. Data added to `users.controller.ts`
`GET /users/profile` (`dashboardStats: {ongoingCount, completedCount, certificatesCount}` +
`ongoingCourses`, computed from `userWithCourses.userCourses` using the real `UserCourse.progress`
boolean column — `false` = ongoing, `true` = completed).
- [x] Welcome banner (gradient navy, "Welcome back" + username) — simplified from Figma's
      illustration version (no matching asset), same info conveyed
- [x] 3 stat cards: Ongoing / Completed / Certificates Earned — **Certificates Earned is a proxy
      equal to Completed Courses count**, not a real certificate-issuance query (no such aggregate
      exists in `certificates.service.ts` yet — it generates certs on-demand per course, doesn't
      track a count). Flag if this needs to be a real number later.
- [x] "Continue Learning" list: real `ongoingCourses` data, category badge + course name + "In
      progress" status + Continue button wired to the shell's own `selectCourseSection(courseId,
      'uiux')` Alpine method (same one the sidebar course accordion uses) — **no numeric progress
      bar**, because `UserCourse.progress` is a boolean in the DB, not a percentage; a fabricated
      % would be dishonest. No pagination either (Figma's "12 courses" pagination doesn't apply
      when the real list is just whatever the user is actually enrolled in).
- [x] "Student Activity Summary" card — kept to real, cheaply-available counts (total enrolled
      programs, logbook entries, portfolio items) instead of Figma's attendance %/average grade
      (no aggregate query exists for those yet, didn't want to fabricate numbers).
- [x] Empty state (0 enrollments) — icon + message + "Browse Programs" CTA to `/dashboard#courses-section`
- [x] Default landing tab after `/users/profile` (no `?tab=` param) is now `dashboard` (see §0)
- Verified end-to-end 2026-09-15: seeded `indra@gmail.com` / `12345678` (had to also run
  `npm run seed`, `npm run seed:content`, and manually flip `isVerified=true` + insert one
  `user_courses` row — local DB ships empty). Both the populated and empty-state branches render
  200, zero template errors, correct numbers (tested ongoing=1/completed=0 and the 0-course empty
  state). `/program/myProgram/:id` entry route still renders fine post-edit too.

## 2. Profile — DONE 2026-09-15 (Figma `830:8546`)
Correction: the file to touch was `partials/user/sidebar_user_profile/profile/index.hbs` (the
live Profile tab in the shell), NOT `partials/user/profile/index/*` (that's part of a THIRD,
fully orphaned generation — `src/views/profile/index.hbs` + its partials — confirmed via grep that
no controller renders `profile/index`; left untouched, out of scope, flagging for whenever a
dead-code sweep happens).
The live Profile tab already had Account Info (username/email, inline-edit + AJAX save) and
Biodata (full name/address/education/study program/gender/WhatsApp, inline-edit + AJAX save)
combined on one page — already matched Figma before I touched it. Only `editPassword.hbs`'s
functionality (current/new/confirm password) was genuinely missing.
- [x] Added a "Change Password" section between Account Info and Biodata, same inline-edit-field
      pattern + AJAX-PATCH-to-`/users/password/:id` convention as the existing two forms, client-side
      new/confirm match check, flash feedback via the existing `sweetalert.hbs` (confirmed wired
      in the layout already)
- [x] Font swept `font-montserrat` → `font-inter` on this partial + its shared dependencies
      (`editable_field`, `editable_select`, `profile_avatar`)
- [x] Retired `GET /users/profile/password` + `GET /users/profile/info_account` from
      `users.controller.ts`, deleted `src/views/profile/editInfo.hbs` + `editPassword.hbs`.
      Their only referrer was the dead `profile/index.hbs` tree above, so nothing live broke —
      verified: old route now 404s, `npx tsc --noEmit` clean, `/users/profile` still 200 with the
      new section rendering.

## 3. My Learning — list — DONE 2026-09-15 (Figma `830:8684`)
Correction: the live file is `partials/user/sidebar_user_profile/my_learning/index.hbs` (the
shell's "My Learning" tab), not `user/mycourse.hbs` (that one is only reachable through the
odd/likely-dead `GET /register/:id` in auth.controller.ts noted in the architecture section
above - left alone, not in scope).
- [x] Font swept to Inter, kept the header + search/filter bar + program card grid (real
      `{{#each course}}` data) as-is structurally
- [x] REMOVED four sections that had zero connection to real data and weren't in Figma at all:
      "Recent Activity" timeline (3 hardcoded items - "Yesterday", "1 Day Ago"...), 4 "Stats"
      cards (hardcoded numbers "2"/"1"/"1"/"8 Hours", not bound to anything), "Completed
      Learning" (a fake course "Fullstack Developer" with a made-up date and a random CDN image
      URL), "Learning This Week" bar chart (fully hardcoded bar heights, not real time-tracking
      data - no such tracking exists in the DB). Same principle as the Dashboard tab: don't
      dress up fabricated numbers, however tempting to reuse existing markup. Rebuilding these
      honestly would need new backend work (an activity log, learning-time tracking) that's a
      separate feature, not a redesign pass - flagging here in case that's ever wanted.
- [x] Also dropped two hardcoded per-card labels that weren't from real data ("Beginner" badge,
      "Next: User Interface Design" text)
- [x] Added an empty state for zero enrolled courses (matches the Dashboard tab's pattern)
- Verified: renders 200, no errors, real course data confirmed showing (tested with the seeded
  "Full Stack Developer" enrollment)

## 4. My Learning — View Program detail + Week expanded (Figma `830:8804` / `830:8956`) — DONE (font sweep)
`partials/user/sidebar_user_profile/my_learning/start_learning/index.hbs` (585 lines) is a MUCH
more sophisticated, genuinely real feature than anything else in this checklist so far - it drives
session unlock sequencing via `Alpine.store('sessionUnlock')` (references an external
"PRD-sequential-session-unlock.md" - go find and read that doc before touching this file again),
attendance-gating, per-session logbook status/approval states, materials-by-type (pdf/video/ppt)
lookups, and a quiz-unlock condition. This is NOT fake/hardcoded data like the My Learning stats
were - every piece of it is wired to real logic. **Treat this file as much higher-risk than
everything done so far.** The `{{#each course.weeks}}` block also uses two custom Handlebars
helpers (`weekUnlocked`, presumably in `src/common/helpers/` - find and read before editing) not
seen elsewhere in this codebase.
Remaining work here is PURELY the font sweep (`font-montserrat`/`font-sans`/`font-['Open_Sans']`
→ `font-inter`, ~40 occurrences) - every other visual element (week cards, lock icons, session
cards, attendance badge, materials list, the logbook modal) already structurally matches or
exceeds what Figma `830:8804`/`830:8956` show. Do this as a pure find-and-replace pass with a
Read-then-Write of the whole file (already have the full 585-line content captured once this
session) to avoid the risk of a botched targeted Edit missing an occurrence or breaking a
`{{}}`/`x-data` expression - re-verify byte-for-byte that ONLY font classes changed before saving,
then rebuild + click through: open the tab, expand a week, expand a session, open the logbook
modal, all via a real logged-in test session (see credentials note above) - this file's
interactivity is too deep to trust from a curl-only render check.

## 5. Undesigned areas — reskin to internal standard (no Figma reference)
- [ ] My Portfolio: `user/myportfolio.hbs`, `user/portofolios/{create,detail,edit}.hbs`,
      `partials/user/myPortfolio/*`, `partials/user/sidebar_user_profile/my_portofolio/*`
- [ ] History Payment: `user/payment.hbs`, `user/riwayat.hbs`,
      `partials/user/payment_history/*`, `partials/user/sidebar_user_profile/history_payment/*`
- [ ] Quiz: `user/quiz/{detail,quiz,start}.hbs`, `partials/user/quiz/start/*`,
      `partials/user/sidebar_user_profile/my_learning/start_learning/quiz/*`
- [ ] Logbook: `user/logbooks/{createLog,detail,edit,index}.hbs`,
      `partials/user/logbook/index/*`, `partials/user/sidebar_user_profile/logbook/*`
- [ ] Certificates: `user/certificates/detail` (find/confirm the actual view file — wasn't in
      the initial listing, check `certificates.controller.ts`)
- [ ] Assignments: `user/assignments.hbs`, `partials/user/sidebar_user_profile/assignment/*`
- [ ] Attendance (standalone create form, distinct from the Week-expanded button):
      `user/attendance/create.hbs`, `.../attendance/edit_modal.hbs`
- [ ] Biodata standalone routes `user/biodata/{create,edit}.hbs` — check if these become
      redundant once Profile absorbs biodata (§2), or if they're a distinct first-time-setup flow

## 0b. App Bar — DONE 2026-09-15 (Figma `830:9156`, was a real gap, not a nitpick)
Caught mid-review: the shell had been sitting under the reused **public marketing navbar**
(Home/Class/Corporate Training/Information), which doesn't match Figma's Application bar at all
and in practice wasn't even rendering usable chrome for this route. Built a dedicated `<header>`
directly inside `user_profile/index.hbs` (shares the shell's own Alpine scope, so the hamburger
wires straight to the existing `sidebarOpen`):
- [x] Logo (`logo_baru.png`) + hamburger (removed the old duplicate toggle button that used to
      live inside the sidebar itself)
- [x] Search bar ("Search course, program, or anything...") - visual only, not wired to a real
      search yet, matches Figma's placeholder text exactly
- [x] Notification bell - deliberately NO fake badge number (no real notification system exists;
      a hardcoded "1" would be fabricated data, same rule as everywhere else in this pass)
- [x] Language switcher - reused `components/ui/nav/lang_switcher/index` directly, fully
      functional (EN/ID/JA really switch)
- [x] Static name + avatar, **not a link** (Figma confirmed via a direct node fetch of `830:9177`:
      just a TEXT node + an IMAGE-SVG node, no button/instance wrapper - no Profile duplication)
- [x] Role-gated identically to the sidebar (`{{#unless (or (eq user.role 'admin') (eq user.role
      'super_admin'))}}`) so admin/super_admin (who get the separate CMS `{{> sidebar}}` layout via
      `layouts/main.hbs:89`) don't get double chrome
- [x] `layouts/main.hbs` given a `bareShell` escape hatch in the non-admin branch (mirrors the
      admin branch's existing `notSidebar` pattern) so the public navbar+footer don't render
      alongside this new bar; set `bareShell: true` on all 4 `res.render('user/user_profile/index', ...)`
      call sites (`users.controller.ts` profile, `courses.controller.ts` myProgram,
      `quiz.controller.ts` start x2)
- Verified live as both `indra@gmail.com` (bar renders, public navbar confirmed absent - 0 matches
  for "Corporate Training"/"isUserActive") and `mentor@gmail.com` (bar confirmed absent, CMS
  sidebar unaffected, "Welcome, mentor" profile content still renders)

## 0c. Post-login landing — DONE 2026-09-15
`GET /dashboard` already branched super_admin -> `/users` and admin -> `/program`
(`dashboard.controller.ts:52-57`, pre-existing, untouched) but `user` rendered the public
marketing homepage instead of going anywhere near the new Dashboard tab. Fixed the actual login
success handler instead of touching `/dashboard` itself: `auth.controller.ts`'s `POST /login`
now redirects `role === 'user'` straight to `/users/profile`, everyone else still goes through
`/dashboard` exactly as before. Deliberately did NOT make `/dashboard` itself redirect for users -
the navbar's "Home" link points at `/dashboard` and still needs to render the marketing homepage
for a logged-in user browsing normally; only the one-time post-login landing changed. Verified all
3 roles' actual redirect chains with real logins.

## 6. i18n
- [ ] Any new copy (Dashboard stats, empty states, etc.) needs en/id/ja keys under a sensible
      new namespace, following existing `test.<area>.*` convention

## 7. Verify
- [ ] `npm run build` passes
- [ ] Every touched route renders 200 in en/id/ja, no raw mustaches, no missing-helper errors
- [ ] No admin/super_admin file touched (user has confirmed this matters twice — double-check
      `git status` before considering any batch done)
- [ ] Screenshot / describe each reskinned page for user review

## Notes / open items (not blocking, revisit later)
- This Figma file (`LYJhMeQfBgu82us13XRHhv`) also contains a full alternate copy of the
  marketing/landing pages (About/Alumni/Gallery/Login/Corporate Training/Japan Pathway/Detail
  Bootcamp) under different node IDs (`640:xxx`) than the ones already built from
  (`mJTccZVBSX9SUB57lwrjkp`, `250:xxx`). Not yet clear if this is a newer canonical source or
  a stale duplicate — ask designer if it comes up, not urgent.
- "My Portfolio" and "History Payment" sidebar items exist in Figma but their target screens
  were not in the fetched data at all (possibly not designed yet, or exist elsewhere in the
  file not covered by node `598:2107`) — consistent with the "no Figma" reskin decision either way.
