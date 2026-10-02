# Kesatria Academy LMS

Server-rendered learning management system for [Kesatria Academy](https://kesatriaacademy.com): programs, classes, materials, quizzes, assignments, attendance, logbooks, certificates, payments with installments, and the public marketing site, in one NestJS application.

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, Express |
| Views | Handlebars (`express-handlebars`), Tailwind CSS 3, Alpine.js, Editor.js |
| Database | PostgreSQL, TypeORM 0.3 (migrations only, `synchronize` is off everywhere) |
| Auth | `express-session` stored in Postgres (`web_sessions` table), Passport local strategy, bcrypt |
| Integrations | Xendit (payments), Cloudinary (media), Nodemailer (SMTP), LibreOffice (PPTX to PDF) |
| i18n | `nestjs-i18n`, languages `id` (default), `en`, `ja` |

## Contents

- [Features and roles](#features-and-roles)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Running](#running)
- [Project structure](#project-structure)
- [Quality gates](#quality-gates)
- [Documentation](#documentation)
- [Known issues](#known-issues)
- [Contributing](#contributing)

## Features and roles

Three roles, checked by `@Roles()` metadata and a global `RolesGuard`:

| Role | What they do |
|---|---|
| `super_admin` | Manage everything: users, programs, payments, installments, vouchers, and all marketing content (about, team, partners, gallery, FAQ, social links). |
| `admin` | Mentor role. Manages the programs they are assigned to, sessions, materials, quizzes, assignments, grading, attendance, mentor logbooks. |
| `user` | Student. Registers for programs, pays (full or installments), follows weeks and sessions, submits quizzes, assignments, logbooks, builds a portfolio, earns certificates. |

Learning: programs (`course`) split into weeks and sessions, materials (including PPTX uploads converted to PDF), quizzes with questions and scores, assignments with submissions and review, attendance per session, week and session progress, student and mentor logbooks, mentoring assignments, comments, certificates, portfolios.

Commerce: registrations, Xendit invoices, installment plans with due dates and payment reminders, manual payment proof upload, vouchers, invoice records, super admin approval flow.

Marketing site: landing page, about (vision, mission, values, commitments, team, backgrounds, experiences, awards), programs catalogue by category, alumni, gallery, FAQ, partners, technologies, contact form.

## Prerequisites

- Node.js 22 or newer with npm. Verified with Node 24.18 and npm 11.
- PostgreSQL 14 or newer. Verified with 16. The `uuid-ossp` extension must be creatable (superuser) or already installed.
- LibreOffice, only if you need PPTX to PDF conversion for materials. Path is configured with `LIBREOFFICE_PATH`.
- Accounts for Cloudinary, Xendit (test mode is fine), and an SMTP mailbox. The app boots without them, but uploads, payments, and emails will fail at runtime.

## Quick start

```bash
npm ci
cp .env.example .env         # then fill in the values, see below
# get a database: see the Database section, an empty database is NOT enough
npm run migration:run        # builds first, then applies pending migrations
npm run seed                 # optional, dev only: default users + one sample program
npm run seed:content         # optional: marketing content for the public pages
npm run start:dev
```

Open http://localhost:3069 (or whatever `PORT` you set; the code falls back to 3000 when `PORT` is missing). Swagger UI is served at `/api-docs`.

## Environment variables

Copy `.env.example` and fill it in. Nothing is validated at boot, so a missing value surfaces as a runtime error in the feature that needs it.

| Variable | Used for | Notes |
|---|---|---|
| `PORT` | HTTP port | `.env.example` uses 3069, PM2 config too |
| `APP_URL` | Absolute links in verification and reset emails | |
| `APP_URL_LMS` | Absolute link to the payment history page in reminder emails | |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | TypeORM runtime, TypeORM CLI, and the session store | All three read the same keys |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image and file uploads | |
| `XENDIT_SECRET_KEY` | Creating Xendit invoices | |
| `XENDIT_CALLBACK_TOKEN` | Verifying the `x-callback-token` header on `POST /invoice/webhook/xendit` | If empty, the check is skipped. Always set it outside local dev. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_FROM_NAME` | Verification, password reset, and payment reminder emails | |
| `LIBREOFFICE_PATH`, `LIBREOFFICE_TEMP_DIR` | PPTX to PDF conversion | Defaults per OS if unset |
| `NODE_ENV` | `production` disables the payment simulation endpoint | Set by `ecosystem.config.js` |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_EMAIL` | The public contact form (`src/contact/contact.service.ts`) uses its own SMTP settings | **Not in `.env.example`.** Add them or the contact form cannot send. |

## Database

### How schema changes work

Migrations are the only way the schema changes. `synchronize` is `false` in both `src/data-source.ts` (used by the CLI and by `AppModule`) and the unused legacy provider. The CLI and the runtime load compiled files from `dist/`, so the npm scripts run `npm run build` before touching the database.

| Command | What it does |
|---|---|
| `npm run migration:run` | Build, then apply every pending migration in `src/database/migrations/` (top level only, `_archive/` is ignored) |
| `npm run migration:revert` | Revert the last applied migration (does not build first, run `npm run build` if `dist/` is stale) |
| `npm run migration:generate -- src/database/migrations/<Name>` | Build, diff entities against the connected database, write a migration |
| `npm run migration:create -- src/database/migrations/<Name>` | Write an empty migration |
| `npm run typeorm -- migration:show` | List applied and pending migrations |

Back up before running anything against a database with real data:

```bash
pg_dump -h <host> -U <user> -d <db> -Fc -f backup.dump
```

### The active migration chain

| File | Purpose | Reversible |
|---|---|---|
| `1788100000000-RefactorDatabaseServer.ts` | One-step transform of the legacy Indonesian-named schema (`kelas`, `pembayaran`, `pertemuan`, ...) into the current English schema. No-op when the `pertemuan` table is absent. | Structure yes, dropped legacy content no |
| `1788300000000-ConvertIdsToUuid.ts` | Converts every integer `id` primary key and its foreign keys to deterministic UUIDv5 values, keeping the old integers in `legacy_id`. **Aborts if it finds no integer-PK table.** | Yes, via the `_uuid_migration_meta` snapshot table it leaves behind |
| `1788400000000-AddDueDatesToInstallment.ts` | Adds `installment.dueDates date[]`. Not idempotent. | Yes |
| `1788500000000-AddLearningScopeToUserActivity.ts` | Adds `user_activity.currentCourseId` and `activityLabel`. Guarded, safe to re-run. | Yes |

The UUID namespace constant inside `ConvertIdsToUuid` must never change once the migration has run anywhere. Changing it produces different UUIDs for the same rows.

### An empty database cannot be built with `migration:run`

This is the most important thing to know about the repository. Verified on 2026-09-16 against a fresh PostgreSQL 16 database:

1. `RefactorDatabaseServer` sees no legacy tables and does nothing.
2. `ConvertIdsToUuid` finds no integer-PK tables and throws. TypeORM rolls the whole run back, so nothing is recorded.

The chain assumes a database that already has the schema. The earlier migrations that created it were deleted or archived; `src/database/migrations/_archive/README.md` explains why and which ones are missing.

The entities themselves are coherent. Generating a migration from them against an empty database produces a 67-table initial schema that applies cleanly and shows zero drift when regenerated. That is the eventual fix (an `InitialSchema` migration plus no-op guards in `ConvertIdsToUuid` and `AddDueDatesToInstallment`), but it has not been done yet.

**Until then, get your schema from an existing environment:**

```bash
# on the source machine
pg_dump -h <host> -U <user> -d <db> -Fc -f e-learning.dump

# locally
createdb e_learning_test
pg_restore -h localhost -U postgres -d e_learning_test --no-owner e-learning.dump
npm run migration:run
```

If the dump comes from the legacy `e-learning-server` database (Indonesian table names, only one migration recorded), run `docs/prestamp-migrations.sql` against it first. That file marks the old migration history as applied so only `RefactorDatabaseServer` is pending. Read the header comments in that file before using it.

### Seeds

Both seeds run from `dist/`, so build first (or run `npm run migration:run`, which builds). They need a migrated database.

- `npm run seed` creates three users and one sample program with two technologies and a mentoring assignment. **Development only.** Every user gets the password `12345678`.

  | Email | Role |
  |---|---|
  | `super@gmail.com` | `super_admin` |
  | `mentor@gmail.com` | `admin` |
  | `indra@gmail.com` | `user` |

- `npm run seed:content` fills the marketing tables (social links, benefits, categories, alumni, partners, gallery, FAQ, vision, mission, values, team). It refuses to run if the `benefit` table already has rows.

## Running

### Development

```bash
npm run start:dev
```

This first regenerates the Font Awesome icon index, then runs four watchers concurrently: Tailwind (`src/common/public/style.css` to `css/style.css`), esbuild for the Alpine bundle (`js/alpine.js` to `assets/main.js`), esbuild for the Editor.js bundle (`js/editor.js` to `assets/editor.bundle.js`), and `nest start --watch`. Generated CSS, `main.js`, and `fa-icons.json` are gitignored; `editor.bundle.js` is committed.

### Production

```bash
npm run build          # nest build + minified CSS + both bundles + icon index
npm run start:prod     # node -r tsconfig-paths/register dist/main.js
```

Run from the repository root. `main.ts` resolves views and static assets from `src/views` and `src/common/public` relative to `process.cwd()`, and serves `./uploads` and `./public/asset` if they exist, so the deployment must ship the `src/` tree alongside `dist/`. `ecosystem.config.js` is a PM2 definition for this (app name `elearning-kesatria`, port 3069, `NODE_ENV=production`). `nginx.conf` is a reverse-proxy example for `kesatriaacademy.com` with a 50 MB upload limit.

There is no Dockerfile; `.dockerignore` is a leftover.

## Project structure

```
src/
├── main.ts                    Bootstrap: Handlebars, session store, Passport, flash, global filters and guard
├── app.module.ts              Imports ~60 feature modules; AuthMiddleware exclusions for public routes
├── data-source.ts             TypeORM options shared by CLI and runtime
├── entities/                  64 entities, centralized (one file per table)
├── database/
│   ├── migrations/            Active migrations (+ _archive/ with disabled history and README)
│   └── seeds/                 user.seed.ts, content.seed.ts
├── common/
│   ├── guards/                RolesGuard, AuthenticatedGuard
│   ├── decorators/            @Roles, @ValidateImage, @ValidateFile, pagination
│   ├── interceptors/          Image and file validation, multer error handling
│   ├── filters/               403 / 404 / 500 pages
│   ├── helpers/               Handlebars helpers, aggregated in helpers/index.ts (see CONTRIBUTING.md for sizeClass)
│   ├── email/                 Nodemailer templates (verification, reset, reminders)
│   ├── config/                Multer and Cloudinary, LibreOffice service
│   ├── upload/                Cloudinary upload service
│   └── public/                Static assets, Tailwind source, client JS sources and bundles
├── i18n/                      id/, en/, ja/ translation JSON
├── views/                     Handlebars templates: layouts/, partials/, admin/, super_admin/, user/, public/, ...
└── <feature>/                 controller, service, module, dto/ per domain (courses, payments, quiz, logbook, ...)
docs/                          Hand-over notes, architecture notes, payment integration notes, prestamp SQL
test/                          Single e2e spec (currently broken, see below)
```

Domain naming is English in code and in the database since the `RefactorDatabaseServer` migration. Older docs and some comments still use the Indonesian terms (kelas = course, materi = material, pertemuan = session, absen = attendance, tugas = assignment, nilai = score, pembayaran = payment, cicilan = installment, pendaftaran = registration).

## Quality gates

State on 2026-09-16 at commit `b2762cea` on `test-back-office`:

| Check | Command | Result |
|---|---|---|
| Type check | `npx tsc --noEmit` | passes |
| Build (the PR gate) | `npm run build` | passes, one Tailwind `@variants` deprecation warning |
| Lint | `npx eslint "src/**/*.ts"` | about 28,000 errors in 515 files. Roughly 27,400 are `prettier/prettier` because `.prettierrc` sets `endOfLine: crlf` while almost every file is LF. About 1,100 real findings hide underneath. Do not run `npm run lint`, it passes `--fix` and would rewrite every file to CRLF. |
| Unit tests | `npx jest` | 8 of 104 suites pass. The 96 failures are NestJS CLI scaffolds that only assert "should be defined" and cannot resolve dependency injection. Real tests exist for payments, invoice, installment payments, translation, and the session-unlock client script. |
| e2e | `npm run test:e2e` | Broken. Needs a database and asserts that `/` returns `Hello World!`. |
| CI | none | `.github/` holds only the PR template. The build gate is enforced by convention. |

## Documentation

| Document | What it covers |
|---|---|
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Branch and PR rules, typography scale (`sizeClass`), page container (`.page-shell`) |
| [`docs/arsitektur-lms-notes.md`](docs/arsitektur-lms-notes.md) | Architecture walkthrough, DI, guards, entity relationships, RBAC, technical debt list |
| [`docs/xendit-payment-gateway-notes.md`](docs/xendit-payment-gateway-notes.md) | Payment flow, what was fixed, open P0 items before going live, migration to Payment Sessions API |
| [`docs/prestamp-migrations.sql`](docs/prestamp-migrations.sql) | Marks legacy migration history as applied on the old `e-learning-server` database |
| [`src/database/migrations/_archive/README.md`](src/database/migrations/_archive/README.md) | Why the old migrations are disabled and which ones are missing from the repo |
| [`docs/form-submit-gating.md`](docs/form-submit-gating.md) | Which super admin forms gate the submit button on validity |
| [`docs/user-area-design-alignment-plan.md`](docs/user-area-design-alignment-plan.md) | Plan to bring every student-facing page in line with the design: super admin component library as the token source, legacy route retirement, ticket-sized work packages |
| [`docs/project-audit-handover-2026-09-17.md`](docs/project-audit-handover-2026-09-17.md) | Fresh-clone audit: quality gates, verified migration-chain failure on an empty database and the proposed fix, open security findings, how the 2026-09-17 `dev-miko` merge conflicts were resolved |
| [`docs/paid-program-refactoring-handover.md`](docs/paid-program-refactoring-handover.md), [`docs/about-vision-mission-handover.md`](docs/about-vision-mission-handover.md) | Page refactor hand-over notes |
| [`docs/landing-user-rebuild-plan.md`](docs/landing-user-rebuild-plan.md), [`docs/landing-user-rebuild-checklist.md`](docs/landing-user-rebuild-checklist.md) | Figma-driven rebuild of the public and auth pages |
| [`mpp_pattern_analysis.md`](mpp_pattern_analysis.md) | UI pattern inventory of the MPP partials for component extraction |

## Known issues

Open items a new contributor should know about. Several are also tracked in the docs above.

- **Fresh database bootstrap** does not work, see [Database](#an-empty-database-cannot-be-built-with-migrationrun).
- **Routes keyed by `:userId` trust the URL.** `payments`, `registrations`, `portfolios`, and `users/update/profile` never compare the param with `req.user.id`, so any logged-in `user` can act on another user's records. `attendances` was already fixed and documents the pattern to follow.
- **Session secret is hardcoded** in `src/main.ts` and the cookie sets neither `secure` nor `sameSite`.
- **Xendit webhook** skips token verification when `XENDIT_CALLBACK_TOKEN` is empty, does not check the paid amount against the invoice, and `payment.no` (`INV-<timestamp>`) has no unique constraint. Listed as open P0 in the Xendit notes.
- **No CSRF protection** on server-rendered forms, no security headers from the app itself (nginx adds a few), no rate limiting on login.
- **`.env.example` is missing** the `EMAIL_*` and `CONTACT_EMAIL` keys used by the contact form.
- **`src/database/database.providers.ts`** is dead code with hardcoded localhost credentials. Nothing imports it.
- **Lint is unusable** until the CRLF setting or the files are normalized.
- **Unused server-side dependencies**: `canvas`, `sharp`, `pdf-poppler`, `pptxgenjs`, `pptx2json`, `ppt-pdf`, `convertapi`, `spire.presentation`, `exceljs`, and `cheerio` are not imported anywhere under `src/`. Several are heavy native builds.
- **Views are not cached** (`view cache` is off in `main.ts`) and are read from `src/` in production.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a PR: one ticket per branch, one page or module per PR, `npm run build` must pass, and follow the typography and page-container rules. The PR template in `.github/pull_request_template.md` lists the checklist.
