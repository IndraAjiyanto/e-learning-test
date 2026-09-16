# User area (role `user`) - design alignment plan

> **Date:** 2026-09-17
> **Branch:** local `dev-miko` after the `origin/dev-miko` merge (`46503c1b`)
> **Inputs:** [`user-area-handover-2026-09-16.md`](./user-area-handover-2026-09-16.md), [`user-area-redesign-checklist.md`](./user-area-redesign-checklist.md), [`project-audit-handover-2026-09-17.md`](./project-audit-handover-2026-09-17.md) section 4, and the measured state of every student template in the merged tree
> **Owner instruction (2026-09-17):** where a student page has no Figma frame, follow the matching super admin page and its component library
> **Scope:** everything a `user` sees after login. **Out of scope:** `src/views/admin/`, `src/views/super_admin/`, any route gated to `admin`/`super_admin`, the marketing site

## 0. Ground rules

1. **The shell stays the frame.** `src/views/user/user_profile/index.hbs` (app bar per Figma `830:9156`, sidebar per `830:9186`) matches Figma after the merge. No ticket below restyles it except WP0.
2. **Super admin components are the token source.** Reuse `src/views/partials/components/ui/super_admin/*` inside `partials/user/sidebar_user_profile/*`. They are plain Handlebars partials with no role gating; "scoped super_admin" in their headers is naming, not a restriction. Never change a component's defaults for a student need. Pass `class` or existing props; if a new prop is unavoidable, that is its own PR reviewed by the super admin page owner, because the admin-path check in rule 7 will flag it.
3. **Figma wins on layout where a frame exists** (Dashboard `830:9155`, Profile `830:8546`, My Learning list `830:8684`, program detail `830:8804`/`830:8956`, and the History Payment / My Portfolio / Start Learning frames under `598:2107`). Super admin wins on tokens everywhere, and on layout where no frame exists.
4. **Profile tab = `components/ui/profile/index`.** Settled by this instruction: that component is the super admin profile design (`mJTccZVBSX9SUB57lwrjkp`, nodes `#2561:*`). The reskin's inline profile form dropped in the merge does not come back.
5. **Legacy standalone student pages are retired, not reskinned.** Evidence in section 2.2: none is linked from the shell, and two already return 500 because their view file no longer exists.
6. **No fabricated data.** The 2026-09-16 rule stands: remove or hide placeholders, never invent numbers.
7. **One page or module per PR** (CONTRIBUTING). `npm run build` passes, before/after screenshots attached, and `git status --porcelain | grep -iE 'admin'` is empty.

## 1. The standard, in tokens

Copied from the super admin pages so a student tab and a super admin page look like one product.

| Element | Use | Notes |
|---|---|---|
| Page container | `p-4 sm:px-[34px] sm:py-[42px]` on the tab panel, `flex flex-col gap-7` inside | Super admin pages use `min-h-screen bg-[#f3f3f3] px-4 py-8 sm:px-[34px] sm:py-[42px]`; the shell already provides background and height. Replaces the flat `p-5` from 2026-09-16 |
| Title + intro | `super_admin/page_header/index` (34px Montserrat bold, `tracking-[-1px]`, `#003060`) + `super_admin/description/index` | `titleTag='h2'` inside the shell, the shell owns the `h1` |
| Card | `rounded-xl border border-[#d9d9d9] bg-white p-5`, via `super_admin/detail/section_card/index` (icon + title) or `super_admin/form/section_card` (numbered) | Border, no shadow. Only the Figma-verified Dashboard stat cards keep their shadow |
| Read-only field | `super_admin/detail/field/index` (`label`, `value`, or a block for chips/images) | |
| Inputs | `super_admin/form/text_field` (`multiline`, `type`, `hint`, `required`, `toggle`), `super_admin/form/select_field` (`options`, `variant`) | Caller provides `formData`, `formErrors`, `validateField()`; 44px high, radius 8, border `#d4d4d4` |
| Buttons | `super_admin/form/button` (`variant` primary/secondary/danger/danger-soft, `as='link'`, `loading`, `disabled` expression, `row=true` + `cancelHref`) | Submit gating per [`form-submit-gating.md`](./form-submit-gating.md): `disabled='!canSubmit() || loading'` |
| Lists | `super_admin/table/client_table` factory + `table/toolbar` + `table/card` + `header_cell`/`cell`/`avatar`/`row_actions`/`message_row`/`pagination` | `items` from the template or `url` for fetched panels, which matches the shell's fragment pattern |
| Status | `super_admin/badge/index` (`dot=true` for statuses, `classExpr` for conditional colour) | |
| Modals | `super_admin/modal/detail/index` (read-only, `name` channel) and `super_admin/modal/delete_confirm/index` | |
| Feedback | `super_admin/toast/success/index` | Already mounted once in the shell; fire `toast:success` events, do not mount again |
| Empty state | `components/ui/empty_state/index` (`show`, `icon`, `title`, `description`, `actionText`, `onAction`) | |
| Tabs | `super_admin/tabs/panel/index`, `super_admin/tabs/fetch/index` | |
| Typography | Headings Montserrat via the components; body Inter (the component library is 170 `font-inter` to 47 `font-montserrat`). No `text-[NNpx]` outside components; custom headings use the CONTRIBUTING `sizeClass` keys | |

## 2. Current state after the merge

### 2.1 Shell tabs and fragments

Gap markers are counts in the file today: hard-coded `text-[NNpx]`, per-element `font-*` overrides, old heavy shadows, dead `href="#"`.

| Area | Partial(s) | Reference | Lines | px / font / shadow / dead link | State | Ticket |
|---|---|---|---|---|---|---|
| Dashboard | `sidebar_user_profile/dashboard/index.hbs` | Figma `830:9155` | 126 | 0 / 0 / 0 / 0 | Done | none |
| Profile | `sidebar_user_profile/profile/index.hbs` -> `components/ui/profile/index.hbs` | super admin profile (`#2561:*`) | 7 + 516 | 0 | Done, one copy bug | WP8 |
| My Learning list | `sidebar_user_profile/my_learning/index.hbs` | Figma `830:8684` | 161 | 6 / 15 / 1 / 0 | Layout done, tokens not | WP6 |
| Start Learning | `.../start_learning/index.hbs` | Figma `830:8804`, `830:8956`, `598:2107` | 576 | 11 / 48 / 0 / 1 | Layout done, tokens not, high risk | WP6 |
| Attendance | `.../start_learning/attendance/{index,edit_modal}.hbs` | none | 265 + 137 | 5 / 11 / 0 / 0 | Sized only | WP6 |
| Materials (in shell) | `.../start_learning/materi/{pdf,ppt,video}/index.hbs` | none | 111 + 112 + 144 | 3 / 15 / 0 / 0 | Sized only | WP6 |
| Quiz list / week | `.../start_learning/quiz/{index,week/index}.hbs` | none | 82 + 111 | 1 / 9 / 0 / 1 | Sized only | WP6 |
| Quiz taking | `.../start_learning/quiz/week/start/index.hbs` | none | 617 | 1 / 2 / 0 / 0 | Placeholder answers mixed with real logic, unaudited | WP7 |
| Join Group | `.../start_learning/join_group/index.hbs` | none | 34 | 0 / 3 / 0 / 1 | Button goes nowhere | WP6 |
| History Payment | `sidebar_user_profile/history_payment/index.hbs` + `{full_payment,installment,registration}/index.hbs` | `598:2107` row list | 233 + 171 + 217 + 167 | 8 / 54 / 2 / 0 | Layout done, tokens not | WP2 |
| History Payment detail | `.../history_payment/{full_payment,installment,registration}/detail/index.hbs` | none | 376 + 280 + 247 | 75 / 32 / 0 / 0 | Never touched by the sizing sweep | WP2 |
| My Portfolio list | `sidebar_user_profile/my_portofolio/index.hbs` | `598:2107` filter sidebar | 979 | 2 / 50 / 0 / 0 | Layout done; one file, needs splitting; no create entry point | WP3 |
| My Portfolio detail | `.../my_portofolio/detail/index.hbs` | none | 360 | 0 / 28 / 0 / 0 | Sized, no card standard | WP3 |
| Assignment (fragment) | `sidebar_user_profile/assignment/index.hbs` | none | 299 | 0 / 19 / 0 / 0 | Sized; shows `Poin: 90/100 Good Job` for every approved item | WP5 |
| Logbook tab | `sidebar_user_profile/logbook/index.hbs` | none; super admin has `program/log_book_user_tab` | 131 | 1 / 11 / 0 / 0 | Sized only | WP4 |
| Certificate | inline mini-panel in the shell, link to `/certificates/:courseId` | none | - | - | Target route returns 500, view missing | WP1 |

### 2.2 Legacy standalone student pages

Every `@Roles('user')` GET that renders a view outside the shell, with the number of student templates that link to it (literal path search across `src/views/user`, `src/views/partials/user`, `components/ui/profile`).

| Route | View | Inbound links | Finding | Action |
|---|---|---|---|---|
| `GET /payment/history/:userId` | `user/riwayat` + `partials/user/payment_history/*` | 0 (only controller redirects after a payment) | Duplicate of the History Payment tab | Redirect to `/users/profile?tab=history-payment` |
| `GET /payment/detail/:courseId` | `user/payment` | 0 from student views | Ignores `course`, shows a hard-coded title and a stock photo | Check inbound from `detail_program/*` first; if used, rebuild with `detail/program_hero` + section cards, else retire |
| `GET /logbook/user/:courseId`, `/logbook/:id`, `/logbook/formCreate/...`, `/logbook/formEdit/:id` | `user/logbooks/*` + `partials/user/logbook/*` | 0 | Logbook lives in the shell modal | Redirect list to `?tab=logbook`; keep POST/PATCH; drop GET form views once the modal covers edit |
| `GET /portfolio/myportfolio/:userId` | `user/myportfolio` + `partials/user/myPortfolio/*` | 0 (confirmed twice) | Orphaned | Redirect to `?tab=portfolio`, delete |
| `GET /portfolio` | `portfolio` | - | **View does not exist, returns 500** | Remove the route or redirect |
| `GET /portfolio/formCreate/:courseId`, `/portfolio/formEdit/:id/:courseId`, `/portfolio/:id/:courseId` | `user/portofolios/{create,edit,detail}` + `partials/user/portfolio/create/form` | 1 (detail -> edit only) | **No student template links to create.** Students cannot reach portfolio creation from the UI | Keep until WP3 rebuilds them and adds entry points |
| `GET /certificates/:courseId` | `user/certificates/detail` | 1 (the shell) | **View does not exist, returns 500** | WP1 builds it |
| `GET /attendance/form/:id` | `user/attendance/create` | 0 | Attendance is in the shell | Redirect to `?tab=uiux` |
| `GET /quiz/form/:quizId`, `GET /questions/quiz/...` | `user/quiz/{quiz,detail}` | 0 | Quiz lives in the shell | Retire after confirming `quiz.controller.ts` lines 134 and 158 (the two `user/quiz/start` branches) are unreachable |
| `GET /biodata/formCreate`, `/biodata/formEdit/:id` | `user/biodata/*` | 1, from the orphaned `partials/user/profile/index/*` tree | Profile component covers biodata | Retire with that tree |
| `GET /assignment/:sessionId/:assignmentId` | `user/assignments` | linked from the assignment fragment | Standalone duplicate of the fragment | Decide in WP5 |
| `GET /learning-material/:fileType/:sessionId` | `materi/{pdf,video,ppt}` | 0 from student views | Probably an admin preview | Leave, not a student page |
| `GET /register/:id` | `user/mycourse` | 0 | Old, oddly placed under the root controller | Retire |

Roughly 5,500 lines of legacy templates fall under this table. The portfolio forms stay until WP3.

## 3. Work packages

Each is one PR with its own ticket. Size is S (under a day), M (one to two days), L (three or more).

### WP0 Foundations (S)
- Extract the shell's `<header>` (currently inline at `user_profile/index.hbs` line 111) into `partials/user/app_bar/index.hbs`. Standalone student pages can then share it via `bareShell`.
- Add `scripts/check-user-area.sh`: greps `src/views/user` and `src/views/partials/user` for `text-[NNpx]`, `shadow-[0px_0px_`, `href="#"`, and reports `git status --porcelain | grep -iE 'admin'`. Every PR below runs it on the files it touched and reports zero.
- Add `src/database/seeds/student.seed.ts` reproducing the 2026-09-16 local rows (weeks, sessions, materials, logbooks, assignments and submissions, quiz, payments, installment plan, portfolio items for `indra@gmail.com`), and set `isVerified: true` in `user.seed.ts`. Without it every tab is an empty state on a fresh database.
- After it lands, copy section 1 of this plan into `CONTRIBUTING.md` as a "User area" section.

### WP1 Retire legacy routes and fix the two 500s (M)
- Apply the Action column of 2.2: redirects in the controllers, delete the views and the partial trees `partials/user/{logbook,myPortfolio,myProgram,payment_history,profile,quiz}` after a final grep for consumers. Keep `partials/user/portfolio/create/form` for WP3.
- Certificate: build `sidebar_user_profile/certificate/index.hbs` as a shell panel (`detail/section_card` with course, completion date, download via `form/button as='link'`), fed by `certificates.service.ts`, which is already completion-gated. Point the shell's certificate link at `?tab=certificate` instead of the dead route.
- Remove `GET /portfolio` or redirect it.

### WP2 History Payment (M)
- Keep the `598:2107` row-list layout. Swap tokens: status pills to `badge dot=true`, action buttons to `form/button variant='secondary'`, the payment-proof modal to `modal/detail name='payment-proof'`, pagination to `table/pagination` when a list exceeds one page.
- Rebuild the three detail partials (75 hard-coded pixel sizes) with `detail/section_card` + `detail/field`, one card for the order, one for the payer, one for the proof.
- Backend: `PaymentsService.getUserInstallmentDetail` must select `file` so the installment tab can show a proof (noted 2026-09-16, still open).
- Verify with a student who has rows: in the local restore, `indraajiyanto052@gmail.com` has 5 payments and `indrajajal3@gmail.com` has 3. Set a known password locally first.

### WP3 My Portfolio (L)
- Split the 979-line list into `filter_sidebar`, `grid`, and `card` partials. Filter card uses `form/text_field` for the two search boxes and `form/select_field` for Category and Class Type; active filters as `badge`; `empty_state` for zero results.
- Detail: `detail/section_card` + `detail/field`, buttons via `form/button`.
- Create and edit: rebuild `user/portofolios/{create,edit}` with `form/section_card` (numbered), `form/text_field`, `form/image_dropzone`, `form/button row=true cancelHref=...`, `canSubmit()` gating; render with `bareShell` and the WP0 app bar. Add the missing "Add portfolio" entry point to the tab and "Edit" to the card.
- Confirm the intended creation flow with the owner first (see section 7).

### WP4 Logbook tab (M)
- Mirror the super admin `program/log_book_user_tab`: `clientTable` + `table/card` with date, session, activity, status `badge`, and `row_actions`; `modal/detail name='logbook'` for reading an entry; the existing in-shell create/edit modal restyled with `form/text_field multiline=true` and `form/button`.
- Do not touch the approval-state logic or the session gating.

### WP5 Assignment fragment (M)
- One `detail/section_card` per assignment, status `badge`, submission form with `form/text_field` / `form/image_dropzone` and `form/button`.
- Remove `Poin: 90/100 Good Job`. It returns only when `answer_task` has a real score column (backend ticket).
- Decide whether `user/assignments` (standalone) is still needed; if the fragment covers it, retire it here.

### WP6 Start Learning subtree, tokens only (L, high risk)
- Files: `start_learning/index.hbs`, `my_learning/index.hbs`, attendance index and modal, materi pdf/ppt/video partials, quiz index and week. Replace the 27 hard-coded pixel sizes and 105 font overrides with component tokens; cards to the section 1 standard.
- Rule: touch `class` attributes and copy only. Never `x-data` keys, `@click` handlers, `:class` logic, method bodies, the `weekUnlocked` helper, or `Alpine.store('sessionUnlock')`. The referenced `PRD-sequential-session-unlock.md` is not in this repo; get it from the user-area owner before starting.
- Join Group: `Course.group` exists as a string. Bind the button to it when it is a URL; hide the card otherwise. No more `href="#"`.
- Verify by clicking through as `indra@gmail.com`: expand a week, expand a session, open the logbook modal, open each material type, start a quiz. A curl-only check is not enough here.

### WP7 Quiz-taking page (M, high risk)
- `quiz/week/start/index.hbs` (617 lines). Audit first: remove the placeholder answer options that sit next to real quiz data. Then tokens only. Timer and scoring logic untouched. Needs a tester with a seeded quiz.

### WP8 Profile polish (S)
- `components/ui/profile/index.hbs` line 335 describes the Change Password card as "Permanently remove this user and revoke access". Replace with the password copy. This file is shared with admins, so it is a component PR.
- Nothing else. The tab is done.

### WP9 Cross-cutting decisions (S each, last)
- i18n: the super admin pages have zero `t` calls and so does `sidebar_user_profile/*`. Following the super admin pages means English copy for now; when i18n happens it is one sweep under `test.userArea.*`.
- Dashboard stats are only computed on `GET /users/profile`; the other two shell entry routes show zeros. Compute them in a shared service method.
- "Certificates Earned" equals completed courses. Either query real issuance or rename the stat.

## 4. Order

```
WP0 -> WP1 -> WP2 -> WP4 -> WP5 -> WP3 -> WP6 -> WP7
WP8 any time. WP9 after WP6.
```

WP1 first because it deletes the most code and removes two live 500s before anyone restyles them. WP6 and WP7 last because they carry the session-unlock and quiz logic.

## 5. Definition of done, per PR

- `npm run build` passes; `npx tsc --noEmit` clean.
- `scripts/check-user-area.sh` reports zero leftovers in the touched files.
- `git status --porcelain | grep -iE 'admin'` is empty (or the PR is a declared component PR).
- Before/after screenshots at 1440px for every touched tab, taken as a real logged-in student.
- Three-role smoke: `indra@gmail.com`, `mentor@gmail.com`, `super@gmail.com` all still log in and land where they did before.
- No new hard-coded numbers or copy that pretends to be data.

## 6. Verification data

Use the restored dump (`e_learning_migrasi_test` on port 5499 locally). `indra@gmail.com` has 1 enrolled course, 2 weeks, 3 sessions, 6 materials in the programme, 3 logbook entries, 1 submission, 3 attendance rows, 1 portfolio item, and no payments. For payment tabs use `indraajiyanto052@gmail.com` or `indrajajal3@gmail.com`. Once WP0 lands, `npm run seed` plus the new student seed replaces this dependency.

## 7. Open questions for owners

1. May the legacy routes in 2.2 be removed outright, or must they redirect for a release?
2. How should a student create a portfolio item: from the My Portfolio tab, from a completed session, or only via a mentor? Nothing links to the create form today.
3. Assignment scores: will `answer_task` get a `score` column, or is the placeholder removed for good?
4. Is `Course.group` the WhatsApp link the Join Group card should open?
5. Certificate: shell panel (this plan) or a standalone page?
6. Where is `PRD-sequential-session-unlock.md`? It is referenced by two hand-over docs and is not in the repo.
7. The merge kept the My Learning sidebar course tree that `921dac97` had removed. Confirm it stays, since WP6 restyles it.
