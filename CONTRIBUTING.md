# Contributing

Keep the board and the repo telling the same story. These rules are tool-agnostic
(they survive a task-manager migration).

## TL;DR

- **Branch name = ticket ID** (`<ticket-id>-short-desc`).
- **No ticket, no PR.**
- **One page or one module per PR.** Delete the old partials for that page in the same PR.
- **Move your own card**: In Progress when you branch, Review when the PR is up.
- **Post your ticket ID in the WA group once a day.**
- `npm run build` must pass before you open the PR.

## Branches

- One branch per ticket. Name it `<ticket-id>-short-desc`
  (e.g. `z8pbk8whwe-landing-hero`).
- Branch from `test`. PRs target `test`.

## Pull requests

- One page **or** one module per PR. Never mix a shared/global refactor with a
  page change in the same PR.
- Every PR links its ticket. **No ticket, no PR.**
- Frontend re-slice / modular PRs: attach a before/after screenshot, and delete
  the old partials for that page **in the same PR**.
- `npm run build` must pass before you open the PR.

## Status (manual - we are between task managers)

- Move your ticket to **In Progress** when you create the branch.
- Move it to **Review** when the PR is open.
- Once a day, post the ticket ID you are working on in the WA group.

## Typography

Never put a raw `text-[NNpx]` or `text-Nxl` on a heading or paragraph. Use a
**semantic size key** — the scale is defined once in
`src/common/helpers/ui.helpers.ts` (`sizeClass`), so changing it updates the
whole app, and every key is responsive (mobile -> desktop):

- via a text component: `{{> components/ui/text/sub_title/index size="h2" ...}}`,
  `{{> components/ui/text/description/index size="body" ...}}`,
  `{{> components/ui/text/section_header/index titleSize="display" ...}}`

A Figma px value maps to a key, not to a literal. Each key is 2 steps only
(base -> `lg:`), named Tailwind sizes, no arbitrary `text-[NNpx]`:

| key | renders (mobile -> desktop) | use for |
|---|---|---|
| `display` | `text-3xl` -> `lg:text-5xl` | page / section hero headings |
| `h1` | `text-2xl` -> `lg:text-4xl` | big section titles |
| `h2` | `text-xl` -> `lg:text-3xl` | section titles |
| `h3` | `text-lg` -> `lg:text-2xl` | card / sub headings |
| `lead` | `text-base` -> `lg:text-lg` | intro / lead paragraph |
| `body` | `text-sm` | body copy (stays `text-sm` on all screens) |
| `body-sm` | `text-xs` | captions, meta |
| `eyebrow` | `text-xs uppercase tracking` | kicker label above a title |

Figma frames are drawn at 1728px wide - treat their px as the **desktop
ceiling**, never the literal value on a 1440px laptop. Layout splits use
`grid grid-cols-1 lg:grid-cols-2` (or `lg:grid-cols-[minmax(0,Npx)_1fr]`),
never `flex` with a fixed `w-[Npx]` child.

## Page container

Every **page** (a top-level view in `src/views/`, not a section) wraps its content
in the shared `.page-shell` class (defined once in
`src/common/public/style.css` -> `@layer components`):

```hbs
<div class="page-shell pt-20 pb-16 lg:pt-24 lg:pb-24"> ...page... </div>
```

`.page-shell` = `mx-auto w-full max-w-[1728px] px-4 sm:px-6 lg:px-10` (the Figma
frame width). Do **not** hand-roll `max-w-[...] mx-auto px-...` on a page - the
content edge must land in the same place on every page. Vertical padding (`pt-*` / `pb-*`) stays inline, it varies per
page. Sections inside render `w-full` + vertical spacing only; a full-bleed
background lives on the `<section>` and breaks out there, never by widening the shell.
The landing page (`dashboard.hbs`) is the exception - it is a stack of full-bleed
sections, each of whose inner container should use the `.page-shell` values.

## User area (role `user`)

Everything a logged-in student sees. The full plan, the gap per tab and the
ticket-sized work packages live in
[`docs/user-area-design-alignment-plan.md`](docs/user-area-design-alignment-plan.md).
Two rules decide how a student page is built:

1. **Where a Figma frame exists, Figma decides the layout.** Dashboard, Profile,
   the My Learning list and the program detail screens have frames; their node
   IDs are in the plan.
2. **Everywhere else, follow the matching super admin page.** Reuse the
   components under `src/views/partials/components/ui/super_admin/` as they are.
   They are plain partials with no role gating. Never change a component's
   defaults to suit a student page: pass `class` or an existing prop instead. If
   a new prop is genuinely needed, that is its own PR, reviewed by whoever owns
   the super admin page.

The shared tokens, in short:

| Element | Use |
|---|---|
| Page container | `p-4 sm:px-[34px] sm:py-[42px]`, inner `flex flex-col gap-7` |
| Title + intro | `super_admin/page_header/index` (`titleTag='h2'` inside the shell) + `super_admin/description/index` |
| Card | `rounded-xl border border-[#d9d9d9] bg-white p-5`, via `detail/section_card` or `form/section_card` |
| Read-only field | `super_admin/detail/field/index` |
| Inputs | `super_admin/form/text_field`, `super_admin/form/select_field` |
| Buttons | `super_admin/form/button`, gated per [`docs/form-submit-gating.md`](docs/form-submit-gating.md) |
| Lists | `super_admin/table/client_table` + `table/toolbar` + `table/card` |
| Status | `super_admin/badge/index` |
| Modals | `super_admin/modal/{detail,delete_confirm}/index` |
| Feedback | `super_admin/toast/success/index` (already mounted once in the shell) |
| Empty state | `components/ui/empty_state/index` |

No hard-coded `text-[NNpx]` and no `shadow-[0px_0px_...]` in this tree. Headings
come from the components; body copy is `font-inter`.

Before opening a PR that touches this area, run the gate on the paths you
changed:

```bash
scripts/check-user-area.sh src/views/partials/user/<what-you-touched>
```

It fails on hard-coded sizes, old heavy shadows, `href="#"`, and on any
admin/super_admin file showing up in `git status`. It also prints the remaining
per-element font count, which is tracked, not blocking.

**Never touch** `src/views/admin/`, `src/views/partials/super_admin/`, or any
controller path gated to `admin`/`super_admin`.

Local data: `npm run seed` (accounts, all verified), `npm run seed:content`
(marketing content), `npm run seed:student` (three programs, five weeks, ten
sessions, materials, attendance, logbooks in every status, assignments with and
without submissions, five quizzes, progress, three portfolio items, and sixteen
payment rows across every status and payment method). Log in as
`indra@gmail.com` / `12345678`. Without the third seed every student tab renders
its empty state and nothing can be reviewed. Scale it down with
`SEED_WEEKS=2 SEED_PAYMENTS=4 npm run seed:student`.

Before asking for review, run the screens in a real browser:

```bash
npx playwright install chromium   # once
npm run test:ui
```

It walks nine student screens at the design frame width, screenshots each into
`test/ui/shots/`, and checks titles, the elements the frames show, console
errors, and whether every Alpine expression on the page actually compiles. That
last check is the one that catches an attribute cut short by a component's
quoting rule, which neither grep nor a 200 response will show you.

## Docs

- Page refactor hand-off notes: `docs/<page>-handover.md`
  (pattern: `docs/paid-program-refactoring-handover.md`).
- Component conventions: `src/views/partials/components/README.md` (to be written).
