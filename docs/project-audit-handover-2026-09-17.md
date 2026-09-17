# Project audit, migration chain, and branch state - hand-over notes

> **Date:** 2026-09-17 (work done on the evening of 2026-09-16)
> **Branch:** local `dev-miko` = `origin/test-back-office` (`873331df`, PR #159) + merge of `origin/dev-miko` (`fffe0115`, user-area reskin) + the docs commits from this session
> **Scope:** first full check of a fresh clone: build, lint, tests, security read-through, migration chain verified against a throwaway Postgres 16, README rewritten, branch divergence checked
> **Not in scope:** no code under `src/` was changed except the six merge-conflict resolutions in section 4. Everything below in "Findings" is still open.

## 0. What this session changed

| File | Change |
|---|---|
| `README.md` | Replaced the NestJS starter boilerplate with real project docs: stack, roles, prerequisites, quick start, env table, database and migration guide, seeds, running, layout, quality gates, docs index, known issues |
| `docs/project-audit-handover-2026-09-17.md` | This file |
| 6 files under `src/` | Merge-conflict resolutions only (section 4.1), committed in the merge commit |

Locally, `npm ci` and `npm run build` were run, so `node_modules/` and `dist/` exist. Both are gitignored. The working tree is otherwise clean.

## 1. Quality gates at `873331df`

| Check | Command | Result |
|---|---|---|
| Type check | `npx tsc --noEmit` | 0 errors |
| Build (PR gate) | `npm run build` | passes; one Tailwind `@variants` deprecation warning from `src/common/public/style.css` |
| Lint | `npx eslint "src/**/*.ts"` | 28,381 errors, 193 warnings, 515 files. 27,422 are `prettier/prettier`: `.prettierrc` says `endOfLine: crlf`, only 39 of 525 `.ts` files are CRLF, some are mixed. Real rules underneath: `no-unsafe-member-access` 410, `no-unsafe-assignment` 213, `no-unsafe-argument` 190, `no-unused-vars` 123, `no-unsafe-call` 60, `require-await` 50, `await-thenable` 40, `no-empty` 27 |
| Unit tests | `npx jest` | 8 of 104 suites pass, 62 of 158 tests. The 96 failing suites are CLI scaffolds (`should be defined`) that cannot resolve DI (`Nest can't resolve dependencies of ...`). Suites with real tests: `payments.service`, `payments.controller`, `invoice.service`, `installment-payment.service`, `translation.*`, `common/public/js/sessionUnlock` |
| e2e | `npm run test:e2e` | not runnable: needs a DB and asserts `/` returns `Hello World!` |
| CI | - | none; `.github/` has only the PR template |

**Do not run `npm run lint`.** The script passes `--fix`, and with the current prettier config that rewrites every LF file to CRLF.

## 2. Migration chain - what was verified

### 2.1 Method

Throwaway database, nothing in the project touched:

```bash
docker run --rm -d --name elt-migcheck -p 5499:5432 \
  -e POSTGRES_PASSWORD=elt -e POSTGRES_DB=elt_fresh postgres:16-alpine

export DB_HOST=localhost DB_PORT=5499 DB_USERNAME=postgres DB_PASSWORD=elt DB_NAME=elt_fresh
npm run build
npx typeorm-ts-node-commonjs migration:show -d ./src/data-source.ts
npx typeorm-ts-node-commonjs migration:run  -d ./src/data-source.ts
npx typeorm-ts-node-commonjs migration:generate -d ./src/data-source.ts /tmp/InitialSchema

docker stop elt-migcheck
```

Env vars are exported inline because `data-source.ts` calls `dotenv.config()`, which does not override variables that are already set. No `.env` was created.

### 2.2 Results

1. **`migration:run` on an empty database fails.** `RefactorDatabaseServer1788100000000` sees no `pertemuan` table and returns. `ConvertIdsToUuid1788300000000` then throws:

   ```
   ConvertIdsToUuid: tidak menemukan satu pun tabel dengan primary key integer bernama "id".
   Migrasi dibatalkan agar tidak mengubah apa pun.
   ```

   TypeORM runs the batch in one transaction, so the run is rolled back and the `migrations` table stays empty. This confirms what `src/database/migrations/_archive/README.md` says: the repo cannot build the schema from zero. New environments need a `pg_dump` from an existing database (README, "Database").

2. **The entities are coherent.** `migration:generate` against the empty database produced a 336-line `InitialSchema` with 67 `CREATE TABLE`, 20 `CREATE TYPE`, 67 foreign keys. Applied through a throwaway `DataSource`, it created 68 tables (67 + `migrations`). Running `migration:generate` again reported `No changes in database schema were found`. So the entity metadata and the target schema agree.

3. **Even with that initial schema in place, the repo chain still fails.** `ConvertIdsToUuid` finds no integer PK (they are already uuid) and throws again. `AddDueDatesToInstallment1788400000000` would fail next with a duplicate-column error, because it runs a bare `ADD COLUMN` and the entity already has `dueDates`.

4. `AddLearningScopeToUserActivity1788500000000` is guarded correctly and is safe on any database.

5. `RefactorDatabaseServer` and `ConvertIdsToUuid` intentionally leave helper tables behind (`_refactor_server_applied`, `_uuid_migration_meta`). Their `down()` methods need them. Do not drop them.

### 2.3 Proposed fix (not done)

Goal: `migration:run` works on an empty database, and is a no-op on every existing one.

1. **Add `src/database/migrations/1788000000000-InitialSchema.ts`**, generated from the entities as above. The timestamp must sort before `1788100000000` so it runs first on a fresh database. It must start with a guard that returns when the database already has application tables, otherwise it would create English tables next to the legacy Indonesian ones and `RefactorDatabaseServer` would collide on the renames:

   ```ts
   const [{ n }] = await q.query(`
     SELECT count(*)::int AS n FROM pg_tables
     WHERE schemaname = 'public' AND tablename NOT IN ('migrations', 'web_sessions')`);
   if (n > 0) return;
   ```

   Existing databases will see it as pending, run it as a no-op, and record it.

2. **`ConvertIdsToUuid`**: keep the throw as a safety net, but return early when zero targets are found *and* the schema is already at the target, e.g. `course.id` is already `uuid`:

   ```ts
   const [{ done }] = await q.query(`
     SELECT (atttypid = 'uuid'::regtype) AS done FROM pg_attribute
     WHERE attrelid = 'public.course'::regclass AND attname = 'id'`);
   if (targets.length === 0 && done) return;
   ```

3. **`AddDueDatesToInstallment`**: `ADD COLUMN IF NOT EXISTS`.

4. **Verify** on three databases: empty (all five apply, then `migration:generate` reports no changes), a dump of the current production schema (only `InitialSchema` is pending and it no-ops), and a legacy `e-learning-server` dump after `docs/prestamp-migrations.sql` (only `InitialSchema` no-op + `RefactorDatabaseServer` run).

## 3. Findings - project (all still open)

### 3.1 Security

| # | Finding | Where | Note |
|---|---|---|---|
| 1 | **Routes keyed by `:userId` trust the URL param.** Any `user`-role account can create an invoice, read payment/registration/installment data, submit a registration, view a portfolio, or edit a profile for another user by changing the id | `src/payments/payments.controller.ts:129,160,206,217,224,231,241`, `src/registrations/registrations.controller.ts:30`, `src/portfolios/portfolios.controller.ts:138`, `src/users/users.controller.ts:429` | The fix pattern already exists in `src/attendances/attendances.controller.ts:26`: ignore the param, use `req.user.id`. The comment there describes this exact bug |
| 2 | Session secret hardcoded (`'rahasia-super'`); cookie has no `secure` or `sameSite` | `src/main.ts:87-90` | Move to env, set cookie flags, add `app.set('trust proxy', 1)` behind nginx |
| 3 | Xendit webhook: token check skipped when `XENDIT_CALLBACK_TOKEN` is empty; `payload.amount` never compared to the invoice; `payment.no` is `INV-${Date.now()}` with no unique constraint | `src/invoice/invoice.service.ts:247`, `src/payments/payments.service.ts:604` | Already listed as open P0 #2, #3, #5 in `docs/xendit-payment-gateway-notes.md` |
| 4 | No CSRF protection on SSR forms, no security headers from the app, no login rate limiting | app-wide | nginx adds a few headers in `nginx.conf`, the app itself none |
| 5 | Duplicate `@Roles('user')` decorator | `src/payments/payments.controller.ts:127-128` | Harmless, just noise |

### 3.2 Configuration

- `.env.example` lacks `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_EMAIL`, which `src/contact/contact.service.ts` reads. The contact form cannot send until they are set. Either add the keys or make the contact service use the `MAIL_*` transport like `EmailService` does.
- `src/database/database.providers.ts` (+ `database.module.ts`) is dead code with hardcoded localhost credentials and database name `e-learning`. Nothing imports it. Delete.
- Production serves views and static assets from `src/` via `process.cwd()` and has `view cache` off (`src/main.ts`). Deployments must ship `src/` and run from the repo root.

### 3.3 Hygiene

- Prettier CRLF mismatch (section 1). Decide once: drop `endOfLine: crlf` (recommended, matches 486 of 525 files) or convert everything. Then the ~1,100 real lint findings become visible.
- 96 scaffold specs fail. Either delete them or give them repository mocks. `test/app.e2e-spec.ts` asserts the wrong response.
- Server-side packages not imported anywhere under `src/`: `canvas`, `sharp`, `pdf-poppler`, `pptxgenjs`, `pptx2json`, `ppt-pdf`, `convertapi`, `spire.presentation`, `exceljs`, `cheerio`. Several are heavy native builds. (Front-end packages like `quill`, `reveal.js`, `cropperjs`, `sweetalert2` are referenced from templates and were not checked further.)
- `CONTRIBUTING.md` says branch from `test` and target `test`. The last five merged PRs (#155-#159) all target `test-back-office`, and `origin/test` is 127 commits behind it. Update the guide or the workflow.
- Largest files: `src/courses/courses.service.ts` (1,241 lines, 24 injected repositories), `src/courses/courses.controller.ts` (1,008), `src/payments/payments.service.ts` (753).

## 4. Branch state at hand-over

Reflog of this checkout: clone -> `test-back-office` -> `checkout dev-miko` (at `c2fca8f3`) -> `git pull origin test-back-office` (fast-forward to `873331df`) -> `git pull --no-ff origin dev-miko` (six conflicts, resolved, merge committed). So local `dev-miko` is now `test-back-office` + the user-area reskin + this session's docs commits.

The 3 commits that were only on `origin/dev-miko`, all by the user-area owner on 2026-09-16, are now merged in:

- `025995ce` refactor(user-area): reskin logged-in user shell to match Figma + internal standard (92 files)
- `5d502a96` docs: user-area handover for 2026-09-16 session handoff (`docs/user-area-handover-2026-09-16.md`)
- `fffe0115` docs: add Figma file/node IDs and per-page state table to handover

### 4.1 Merge conflicts and how they were resolved

| File | Conflict | Resolution |
|---|---|---|
| `src/auth/auth.controller.ts` | activity tracking (`67f8a7f5`) vs role-based login redirect | Both kept: `markActive()` then redirect `user` to `/users/profile`, others to `/dashboard` |
| `src/users/users.controller.ts` | `GET profile/password` + `GET profile/info_account` kept (`01e46d5f`) vs removed by the reskin | Kept. The unified profile component links admins to `/users/profile/password` |
| `components/ui/input/editable_field`, `editable_select` | generalized components (`01e46d5f`: optional `editingKey`, `labelClass`/`inputClass`, options-array dropdown) vs reskin sizing on the old markup | Kept the generalized components (the unified profile component needs them); adopted the reskin's smaller label default (`text-sm`, `mb-2`) |
| `sidebar_user_profile/profile/index.hbs` | include of `components/ui/profile/index` (`01e46d5f`, `4c96e54c`) vs reskin of the old inline form with an inline change-password section | **Kept the unified component.** The reskin's inline profile form is gone from the merged tree. Needs a decision, see 4.2 |
| `user/user_profile/index.hbs` (shell) | 7 hunks: flat nav styling, Dashboard section, course tree (reskin) vs toast partial, admin branch, `password` section, bg colour (`test-back-office`) | Reskin styling everywhere; `test-back-office` additions layered on top; `handledSections` is the union; Profile button active for `profile` and `password`; `bg-[#F2F2F3]`, `min-h-screen` |

Verified after resolving: `tsc --noEmit` clean, `npm run build` passes, all 894 `.hbs` templates precompile with Handlebars, and no partial reference was left dangling by the merge (the two unresolved references that exist, `dashboard/explore_program` and `components/ui/card_alumni`, were already missing on both sides).

### 4.2 Two judgment calls that need an owner's confirmation

1. **Profile page for role `user`.** Two designs collided: the reskin's inline form (Figma file `LYJhMeQfBgu82us13XRHhv`, node `830:8546`, per the user-area hand-over) and the unified `components/ui/profile/index` component (Figma nodes `#2561:*`, from the profile relocation refactor). The merge kept the component because it is shared with admin/super_admin, has the change-password card, and carries the photo-upload fix. If the `830:8546` design is the intended one for students, port its sizing into the component instead of resurrecting the inline partial.
2. **My Learning sidebar course tree.** `921dac97` (activity tracking) removed the tree from the shell without saying so; the reskin restyled it the next day. The merge keeps the restyled tree because every Alpine function it uses (`selectCourse`, `selectCourseSection`, `openedCourses`, `loadCourseFragment`) still exists and the `myProgram/:id?courseId=` fragment routes are live. Note the merged My Learning list links courses to `/program/:id` (a separate detail page, from `921dac97`), so students now have two navigation paths into a course. Pick one.

### 4.3 Remote state

Local `dev-miko` is ahead of `origin/dev-miko` by the 128 `test-back-office` commits plus the merge commit and the docs commits from this session, and behind by nothing. A normal `git push origin dev-miko` will fast-forward the remote. Do not force-push.

Other local branches: `test-back-office` is 18 behind its remote and fast-forwards cleanly; `main` matches `origin/main`, which is stale. No stashes, no tags, no open PRs. The last five merged PRs (#155-#159) all target `test-back-office`.

## 5. Suggested next steps, in priority order

1. Fix the `:userId` ownership checks (3.1 #1). Touches money, not on any existing list.
2. Session secret to env, cookie flags, trust proxy (3.1 #2).
3. Close the three webhook P0s before Xendit goes live (3.1 #3).
4. Confirm the two merge judgment calls in 4.2 with the profile-refactor and user-area owners.
5. `InitialSchema` + guards so a fresh clone can bootstrap (2.3).
6. Add the missing keys to `.env.example` (3.2).
7. Fix the prettier line-ending config, then triage the real lint findings; delete or mock the scaffold specs (3.3).
8. Add a CI workflow running `npm run build`, `tsc --noEmit`, eslint without `--fix`, and the passing test suites.
9. Align `CONTRIBUTING.md` with the actual integration branch.
10. Remove the unused dependencies and the dead database provider.
