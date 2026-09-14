# About Us - Vision & Mission tab - hand-over notes

> **Date:** 2026-09-08
> **Ticket:** Tab Vision Mission (`z8pbk8wv9z`)
> **Figma:** node `250:883` (Ready for dev)
> **Scope:** the Vision & Mission tab content + the shared About sidebar + a responsive type scale

---

## 1. Responsive typography scale (new, app-wide)

Modelled on the `foodieku` repo: named Tailwind sizes, **two steps only**
(base -> `lg:`), body copy stays `text-sm` at every width, no arbitrary
`text-[NNpx]`, no `sm:`/`md:` micro-steps.

`src/common/helpers/ui.helpers.ts` -> `sizeClass` gained these keys, alongside the
untouched legacy `xs`..`4xl`:

| key | renders | use for |
|---|---|---|
| `display` | `text-3xl` -> `lg:text-5xl` | section hero headings ("Vision" / "Mission") |
| `h1` | `text-2xl` -> `lg:text-4xl` | big section titles |
| `h2` | `text-xl` -> `lg:text-3xl` | section titles |
| `h3` | `text-lg` -> `lg:text-2xl` | card / sub headings |
| `eyebrow` | `text-xs uppercase tracking` | kicker label |
| `lead` | `text-base` -> `lg:text-lg` | intro / lead paragraph |
| `body` | `text-sm` | body copy (all widths) |
| `body-sm` | `text-xs` | captions |

Use via `size="lead"` on `text/sub_title` / `text/description`, or `titleSize=` /
`descSize=` on `text/section_header`. **Never** write `text-[NNpx]` / `text-Nxl` on
a heading or paragraph. Layout splits use `grid grid-cols-1 lg:grid-cols-2`, never
`flex` + a fixed `w-[Npx]` child. Rules in `CONTRIBUTING.md` and
`pedoman-modular-komponen.md` §7.

### Page container (`.page-shell`)

New shared class in `src/common/public/style.css` -> `@layer components`:
`.page-shell` = `mx-auto w-full max-w-[1728px] px-4 sm:px-6 lg:px-10` (the Figma
frame width - one outer content edge for the whole site).
Change the width/gutter in that one place and everything on it moves together.
Now on `.page-shell`: `about.hbs`, plus the shared **navbar** (`partials/navbar.hbs`
- was `max-w-[1728px] lg:px-20`) and **footer** (`partials/footer.hbs` desktop - was
`max-w-7xl px-6`), so the logo / nav / footer / page content all share one left and
right edge. Rolling `.page-shell` out to the remaining page views (`gallery`,
`portofolio`, profile, admin CRUD) and aligning the landing sections' inner
containers is a **follow-up ticket**.

`text/section_header` change is backward compatible: `titleSize` / `descSize` are
optional; when omitted the output is byte-identical to before (39 existing callers
unaffected).

## 2. Components created

| Component | Path | Props |
|---|---|---|
| About Nav Item | `ui/button/about_nav_item/index.hbs` | `section`, `icon` (FontAwesome), `text` |
| About Sidebar | `ui/sections/about_sidebar/index.hbs` | none (reads Alpine `activeSection`) |
| Mission Item | `ui/sections/mission/mission_item.hbs` | `number` (1..N, shown `01`..), `lead`, `body` |

- `about_nav_item` is one `<button>` that self-restyles: base = pill (mobile scroll
  row), `lg:` = Figma sidebar card (light-blue `#E0F2F9` + 4px `#003060` accent bar
  when active). Same pattern as the old `button/tab_btn`.
- `about_sidebar` is one `<nav>`: `flex overflow-x-auto` pill row up to `lg`, then
  `lg:flex-col lg:w-80 lg:sticky`. Single markup, no breakpoint dead zone.

## 3. Rewritten

- `ui/sections/mission/index.hbs` - one reflowing tree (foodieku style):
  `grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16`. Left =
  "Vision" eyebrow (`titleSize="display"`) + hairline + white card. Right = "Mission"
  eyebrow + hairline + `mission_item` rows (`divide-y`). Data path unchanged:
  `visions.[0].visions` + `mission[].content` / `mission[].items` via
  `getByLang ... lang`; 5 hard-coded EN fallback rows kept for the empty DB.
- `src/views/about.hbs` - collapsed to `max-w-7xl mx-auto px-6 lg:px-10` +
  `flex flex-col lg:flex-row lg:gap-10`: `about_sidebar` + one content column with
  the four `x-show` tabs. **Per-tab background image removed** (`bgImage` getter and
  the absolute bg `<div>` gone; flat `#F9FAFB`). `activeSection` /
  `toggleActiveSection` Alpine model unchanged.

## 4. i18n

`src/i18n/{en,id,ja}/test.json` - added `test.about.visionsMisi.vision` /
`.mission` (single-word eyebrows). All other keys already existed in all three locales.

## 5. Deferred / not in scope

1. **Story / Values / Team** tabs still render their old content under the new
   sidebar / flat background; their own tickets re-slice the content.
2. **`button/tab_btn`** is now unused by About. Left in place; delete in the full
   "Slicing halaman about" PR once nothing references it.
3. Pixel-perfect mobile polish = the separate responsive-mobile ticket.
4. The other 38 `text/section_header` callers were not migrated to `titleSize=`.

## 6. Verify

`npm run build`, then `http://localhost:3069/dashboard/about` -> "Vision & Mission".
Check 375 / 768 / 1024 / 1440 px: **no horizontal scroll at any width**; single
column on mobile, two columns from `lg`; sidebar = horizontal pills up to `lg`, then
vertical; card + accent bar on the active tab; "Vision"/"Mission" ~`text-3xl` mobile
/ ~`text-5xl` desktop; body stays `text-sm`. Switch tabs - old content still renders,
no console errors, no background image. `lang=id` / `lang=ja` cookie switches labels;
EN fallback shows on the empty local DB.
