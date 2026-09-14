# User-facing rebuild - Figma redesign, full-stack

Session goal: information gathered from the latest Figma + how the backend feeds the
views. This is the plan; implementation is a later session.

Branch: everything on **`dev-miko`** (one long branch, one PR to `test` at the end).
Standard: `docs/` + `CONTRIBUTING.md` Typography / Page container sections, and the
`frontend-standards` memo (`sizeClass` keys, `.page-shell`, grid-not-flex, base+`lg:`).
Schema changes: TypeORM migration file + entity + seeder (matches `src/database/migrations/`).

---

## 1. Figma inventory (file `mJTccZVBSX9SUB57lwrjkp`, section `250:723`)

| # | Figma frame | node | Route | Current view | State |
|--|--|--|--|--|--|
| 1 | Landing Page Kesatria Academy | `250:2777` | `/dashboard` | `dashboard.hbs` (7 section partials) | rebuild |
| 2 | Corporate Training | `559:211` | none | none | **new page** (route + view + controller method) |
| 3 | Alumni | `250:2118` | `/dashboard/alumni` | `alumni.hbs` | rebuild (interns sliced on `test`) |
| 4 | Gallery | `250:2333` | `/dashboard/gallery` | `public/gallery/index.hbs` | rebuild |
| 5 | Log In - Website | `250:2499` | `/login` | `login.hbs` | rebuild (interns sliced) |
| 6 | Sign Up - Website | `250:2560` | `/register` | `regis.hbs` | rebuild |
| 7 | Verify Email 1 / 3 / 4 | `250:2642` `250:2685` `250:2734` | `/users/...` | `verify-email.hbs`, `verify-email-success.hbs` | rebuild (3 states) |
| 8 | Forgot Password (x2) | `250:3216` `250:3265` | `/users/...` | `forgot-password.hbs` | rebuild (2 states: request + sent) |
| 9 | Reset Password Successfully | `250:3173` | `/users/...` | `reset-password.hbs` | rebuild (success state) |
| 10 | About Us - View All Team | `250:1875` | none | none | **new route** (`/dashboard/about/team` or query) |
| 11 | About Us - Faisal - Edu Background | `250:1458` | none | none | **new route** - team member profile, tab 1 |
| 12 | About Us - Faisal - Portfolio & Experience | `250:1648` | none | none | team member profile, tab 2 |
| - | About Us Story / Vision&Mission / Values / Team | `250:724` `250:883` `250:1022` `250:1176` | `/dashboard/about` | `about.hbs` | **done** (do not touch) |

Auth frames (5-9) all instance the same `Sign In Card` component (`250:89`) -> one shared
`auth` partial, per-page content overrides.

Artboard widths are mixed: About + Corporate Training = 1728px; Landing + Gallery = 1920px.
`.page-shell` stays `max-w-[1728px]`; treat the extra 192px as outer gutter, not content.

Font drift in the new frames: Landing = Montserrat; Corporate Training mixes Outfit /
Inter / Open Sans / Montserrat. Pin to the `frontend-standards` font roles, do not copy
per-element.

---

## 2. Landing page - section -> backend map (`250:2777`, verified against leaf content)

`GET /dashboard` already renders `dashboard` with `special_program, partners, gallery,
programs, faq, courseType, category, alumni, collaborations, categoryPartner, benefits,
about, social` from `dashboard.service`.

The redesign has **6 outer sections but 8 content blocks** - two of the sections stack two
blocks each (the current `dashboard.hbs` splits these into 7 flat partials):

| Figma block | Real content in the frame | Entity + fields | Gap |
|--|--|--|--|
| `hero-section` 2796 | eyebrow, H1 "Learn More Meaningfully, Grow Faster", sub para, 2 CTAs ("Explore Programs" / "Book Consultation"), 1 image | `Header` has only `title/text/image` as **plain `string` (single-language)** | **copy -> i18n `test.json` (en/id/ja), like About; hero image = static asset or the one `Header` row.** Not a table gap, a copy gap |
| `why-choose-us` 2815 | eyebrow "WHY KESATRIA", H2, sub, accent, **5 feature cards** (icon + title + body) | `Benefit` (`title[]`, `description[]`, `icon`, `no` 1..5) via `findAllBenefits` | none - seed 5 rows |
| `programs-section` 2866 | eyebrow "OUR DIRECTORY", H2 "Specialized Career Pathways", sub, **4 program cards** (image + footer row) + a static "advisor call" banner | `Category` (`name`, `text[]`, `icon`, `hero_section_image`, `description[]`, `type`) via `findAllCategories` | none - seed 4 categories; banner copy -> i18n |
| `testimonials` block A 2971 | eyebrow "ALUMNI SUCCESS", H2 "Real Stories, Real Placement", sub, **3 alumni cards + prev/next pagination**, each = quote + avatar + name + role + badge | `Alumni` (`message[]`, `name[]`, `currentPosition[]`, `profile`, `course`->badge) via `findAllAlumni` (take 6) | none - `message[]` already exists; current `dashboard.hbs` never rendered a quote. Seed >=6 |
| `testimonials` block B 3027 | eyebrow "OUR partners", H2 "Trusted by Leading Partners", body, **4 filter buttons** (Government Institutions / Company / Institutions / BUMN) + **logo grid (~11)** | `Partner` (`image`, `categoryPartner`) + `CategoryPartner` (`category: string`) via `findAllPartners` + `findCategoryPartners` | none - **partner section is NOT dropped**, it is block B of this section. Seed 4 `CategoryPartner` + partners |
| `final-cta` 3070 | H2 "Take Your Tech Skills to the Next Level", sub, "Get Started Today" button | static | copy -> i18n |
| `faq-section` block A = `gallery-section` 3080 | eyebrow "academy in action", H2 "Life at Kesatria Academy", sub, **3-image grid** + "See All Our Gallery" link | `Gallery` (`filePath`, `title`, `description`, `no`, `category`) via `galleryService.findAll` | none - seed >=3 |
| `faq-section` block B 3103 | eyebrow "questions", H2, sub, **7-item accordion** (questions are in the frame: "What will I learn...", "Is the bootcamp online or offline?", "Do I need prior programming experience", "Will I receive a certificate...", "What if I miss a class?", "How can I register?", "Is there career support after graduation?") | `Faq` (`question[]`, `answer[]`) via `findFAQ` | none - seed 7 rows |
| `Footer` 3111 | address block (address / email `kesatriaacademy@gmail.com` / phone `+62 896 4683 4607`), QUICK LINKS (Home/About Us/Program/Alumni/Gallery), OUR PROGRAM (Bootcamp/Short Class/In House Training/Wiratek Internship Program), FOLLOW US (linkedin/instagram/youtube), copyright | `Social` (`linkedin`, `instagram`, `youtube`, `email`, `address`, `number`, `linkAddress`) via `findSocial` | none - `Social` covers all of it; link lists are static nav |

**Net: landing needs ZERO new tables.** The only non-DB work is the trilingual marketing
copy (hero H1/sub/CTA labels, every eyebrow + H2 + sub, final-cta, program banner) which
must go into `src/i18n/{en,id,ja}/test.json` - `Header` and section copy are not jsonb, so
they are not editable content, they are static strings. Same pattern as About.

Schema-consistency flag: `Course` mixes two i18n styles - jsonb `string[]` indexed by lang
(`description`, `locations`) **and** explicit `...Id/...En/...Ja` triples (`criteria*`,
`materials*`, `learningTargets*`). New content should stick to one (`string[]` + `getByLang`).

---

## 3. Other pages - backend map

- **Corporate Training** (`559:211`): sections = hero + stats, "choose program (coming soon)"
  ("coming soon" static card), why-choose (reuse `Benefit`), testimonials (reuse `Alumni`),
  gallery (reuse `Gallery`), FAQ (reuse `Faq`), final-cta ("Contact Us", static). Hero:
  tag + title-block + big image with overlay + a floating `hero-stats` card (numbers =
  static i18n). New `GET /dashboard/corporate-training` -> `corporate_training.hbs`,
  controller method reusing `dashboardService` finders. **No new tables.**
- **Alumni** (`250:2118`, verified): navbar + footer shells; header (H1 "Our Alumni Our
  Pride" + sub); a **stats card** (Alumni / Career Growth / Hiring Partners - numbers are
  **static**, no entity); "Filter by Program Type" (search box + category chips); 2-row card
  grid + numbered pagination. `/dashboard/alumni` + `/dashboard/alumni/filter` (search /
  course / category / paginated) already exist. `Alumni` has `profile`, `name[]`,
  `message[]`, `currentPosition[]`, `course`. **View + i18n only.**
- **Gallery** (`596:352`, verified): header (H1 "Capturing Every Meaningful Moment" + sub);
  "Filter by Program Type" (search + chips); "Our Activities" **masonry grid, 3 cols x 2 =
  6 cards** (gradient overlay on image), "View All Activities" link, pagination. `Gallery`
  `no` enum is `'1'..'6'` - exactly 6 slots. `/dashboard/gallery` + gallery search already
  exist. **View + i18n only.**
- **Auth set** (`250:2499` verified; login / register / verify x3 / forgot x2 / reset):
  full-bleed bg image + gradient + a `backdrop-blur` glass card. Login card = logo + "LMS"
  heading + sub + Email field (icon) + Password field (icon + eye toggle) + "Log In to
  System" button + "Don't have an account? Sign Up". Pure forms -> existing `POST /login`,
  `POST /register`, `users` controller (`token`, `remainingMs`). **Views only**: rebuild
  `login.hbs`, `regis.hbs`, `forgot-password.hbs`, `reset-password.hbs`, `verify-email.hbs`,
  `verify-email-success.hbs` + one shared `auth` glass-card partial + the lighter auth navbar.
- **View All Team** (`250:1875`, verified): the **About shell** (463px `#F9FAFB` sidebar
  with the same 4-tab nav we already built + `.page-shell` content). Heading + a full grid
  of all `Team` rows. `findTeam` (order `teamOrder`) already loaded by the `about`
  controller. **New route + view, no schema.**
- **Team lead profile** (`250:1458` Edu Background / `250:1648` Portfolio & Experience,
  verified): same About shell; breadcrumb ("Our Teams > ... > Educational Background"),
  circular profile photo + name/role, a **2-tab bar** (Educational Background | Portfolio &
  Experience), then a timeline of cards. It is **one page, two tabs** = the two frames. Data
  = `TeamLead` + `background` (order `backgroundOrder`) + `experience` (order
  `experienceOrder`) + `award` - all already loaded by the `about` controller. Frame is
  named "Faisal" and uses the team **lead**; regular `Team` grid members have no detail
  frame, so `Team` needs no `slug`. **New route + view, no schema.**

---

## 4. Gaps to fill (full-stack)

**Zero new tables. Zero entity changes.** Every block across all 12 frames maps to an
existing entity (`Benefit`, `Category`, `Course`, `Alumni`, `Partner`, `CategoryPartner`,
`Gallery`, `Faq`, `Social`, `Team`, `TeamLead`, `background`, `experience`, `award`).

Non-view work:

1. **i18n copy** - all marketing text into `src/i18n/{en,id,ja}/test.json`: hero H1 / sub /
   CTA labels, every section eyebrow + H2 + sub, final-cta, programs "advisor" banner,
   alumni page stat numbers + labels, corporate-training hero-stats + "coming soon" card,
   auth headings. `Header` / stats are plain `string`, not jsonb -> they are static copy.
2. **New routes + controller methods** (reuse existing services, no new data):
   - `GET /dashboard/corporate-training` -> `corporate_training.hbs`
   - `GET /dashboard/about/team` (View All Team) -> new view in the About shell
   - `GET /dashboard/about/team/lead` (or `?tab=`) -> team-lead profile, 2 tabs
3. **Navbar dropdowns** - build "Pop Up Dropdown Navbar - Class" (`433:211`) and
   "Informasi" (`433:266`) as partials; Class links into the existing
   `/category/:type` + `/courses/*` routes, Information links to About / Alumni / Gallery.
4. **Seed data** for existing tables so the pages render with realistic content:
   `Benefit` x5, `Category` x4 (with `hero_section_image`), `Alumni` x6 (with `message[]`),
   `CategoryPartner` x4 + `Partner` logos, `Gallery` x6, `Faq` x7 (questions are in the
   Figma). Seeder under `src/database/` + migration if a seed table is added.

If anything below turns up needing a column, it is a migration + entity + seeder (per the
`src/database/migrations/` pattern) - but nothing found so far does.

---

## 5. Build sequence (all on `dev-miko`, one PR to `test`)

1. **Shell** - rebuild `navbar.hbs` (+ Corporate Training item, Class/Information dropdown
   partials, language switcher, login button) and `footer.hbs` (address/quick-links/program
   /follow-us from `Social` + static lists) to the new Figma. Both already on `.page-shell`.
2. **Landing** `/dashboard` - rebuild the 6 sections / 8 blocks: hero, why-choose (`Benefit`),
   programs (`Category` x4 + banner), testimonials A (`Alumni.message`) + B (`Partner` /
   `CategoryPartner` with 4 filter buttons), final-cta, gallery block (`Gallery`) + FAQ
   block (`Faq`). All copy to i18n. Wire the alumni-quote render that never existed.
3. **Corporate Training** - new route + `corporate_training.hbs`, reuse the landing
   section partials + `Benefit` / `Alumni` / `Gallery` / `Faq`; static hero-stats + coming-soon.
4. **Alumni** `/dashboard/alumni` - rebuild view on `Alumni` + the existing filter endpoint;
   static stat numbers.
5. **Gallery** `/dashboard/gallery` - rebuild view: 6-card masonry + category filter + search.
6. **Auth set** - shared glass-card `auth` partial + auth navbar, then `login` / `regis` /
   `forgot-password` / `reset-password` / `verify-email` / `verify-email-success`.
7. **About extras** - `View All Team` grid + `team-lead profile` (2 tabs) in the About shell;
   new routes on the `about` controller data.
8. **Seed** - one seeder pass for the 6 content tables above.
9. **Sweep** - `.page-shell` on every rebuilt view, delete superseded old `sections/*`
   partials, i18n complete en/id/ja, `npm run build` green, screenshots per page.

Program-list / program-detail (`special_program`, `paid_program`, `free_program`,
`detail_program/*`) have **no frame anywhere in the file** -> keep current; only their
navbar dropdown entry points are rebuilt.

---

## 6. Flags for designer / lead dev

- **No Program List / Program Detail design exists** in file `mJTccZVBSX9SUB57lwrjkp` (5
  canvases checked). Keeping current views. Confirm there is no separate program-pages file.
- Landing `programs-section` = exactly **4 cards** + an advisor banner. Assuming the 4
  `Category` rows (name + `hero_section_image` + `description[]` + link to `/category/:type`).
- `Header` + all stat numbers are single-language `string` -> treated as static i18n copy,
  not superadmin-editable. Flag if CMS editing is expected (then `Header` needs jsonb + CRUD).
- Mixed artboards (1728 About/Corp vs 1920 Landing/Gallery) and mixed fonts
  (Outfit/Inter/Open Sans/Montserrat on Corporate Training) - pinning to `frontend-standards`
  font roles + `.page-shell` `max-w-[1728px]`; confirm that is acceptable.
- Verify Email x3 frames, Forgot Password x2 - mapping 3 = {enter code / resend / done} and
  2 = {request / link-sent}; confirm.
- Team-lead profile is CEO-only ("Faisal"); regular team members have no detail page.
  Confirm no per-member profile is wanted.

---

## 7. ClickUp (list `901819035487` "LMS - Development")

The board still has these as intern-assigned, `pending`/urgent, due ~2026-09-10 - the same
pages this rebuild covers. Per the verbal reassignment, Miko owns all of them; the tickets
should be reassigned or the interns told to stand down before work starts.

| Ticket | ID | Board assignee |
|--|--|--|
| Slicing halaman landing page | `z8pbk8wv9k` | John Calvin S |
| Slicing halaman about | `z8pbk8wv9w` | John Calvin S |
| Slicing halaman gallery | `z8pbk8wv9t` | Sayyid Murtaja |
| Slicing halaman alumni | `z8pbk8wv9q` | Sayyid Murtaja |
| Slicing sign in / sign up / verify email 1·3·4 / reset pw / reset pw success | `z8pbk8wv8p` `wv8q` `wv92` `wv94` `wv96` `wv9b` `wv9e` | Izaz Falih |
| Slicing halaman forgot password | `z8pbk8wv98` | Izaz Falih (in review) |
| Tab Story / Vision Mission / Values / Team | `z8pbk8wv9y` `wv9z` `wva0` `wva9` | unassigned (= the About work already done) |
| Section hero section | `z8pbk8wk7u` | unassigned |

No **Corporate Training** ticket exists - create one. The "Redesign Page * - Super Admin"
tickets are Khoirul / Livia / Indra and are out of this scope.
