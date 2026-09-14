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

## Docs

- Page refactor hand-off notes: `docs/<page>-handover.md`
  (pattern: `docs/paid-program-refactoring-handover.md`).
- Component conventions: `src/views/partials/components/README.md` (to be written).
