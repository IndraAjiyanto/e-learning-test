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

## Docs

- Page refactor hand-off notes: `docs/<page>-handover.md`
  (pattern: `docs/paid-program-refactoring-handover.md`).
- Component conventions: `src/views/partials/components/README.md` (to be written).
