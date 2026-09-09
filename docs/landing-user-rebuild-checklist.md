# Rebuild checklist (dev-miko)

Tracking `docs/landing-user-rebuild-plan.md` §5.

## Status summary
Most of the user-facing redesign was **already shipped by the interns** on `origin/test`
(merged into `dev-miko`): landing sections, alumni page, gallery page, and the full auth
set all exist and reference the Figma nodes. This pass added the missing pieces and the
shell, and verified the whole surface. `npm run build` green; every route returns 200.

## 1. Shell
- [x] navbar.hbs full rewrite (Home / Class dd / Corporate Training / Information dd / lang / auth / mobile drawer) - our standard
- [x] partial: components/ui/nav/info_item
- [x] partial: components/ui/nav/lang_switcher (+ mobile variant)
- [x] navbar i18n keys en/id/ja
- [x] footer.hbs rewrite to Figma, single responsive tree on .page-shell
- [x] footer i18n keys en/id/ja (quickLinks, ourProgram, followUs)

## 2. Landing /dashboard
- [x] hero / benefit / program / alumni / partner / gallery / faq - **pre-existing (interns)**, Figma-node-referenced, render OK
- [x] section: final_cta - **NEW** (Figma 250:3070), prop-overridable, wired into dashboard.hbs
- [x] landing i18n: home.finalCta.* en/id/ja
- [x] container alignment: hero / benefit / program / alumni / partner / gallery / faq
      desktop wrappers swapped from `max-w-[1554/1375/1537/1400] px-[80px/20]` to `.page-shell`
      so section content shares one edge with navbar + footer
- [ ] DEFERRED: those sections still use the dual mobile/desktop block pattern + arbitrary
      `text-[NNpx]` on headings. Not converted to single-tree + `sizeClass` (working animated
      code, blind-edit regression risk). Needs an incremental pass with the dev server open.

## 3. Corporate Training (NEW)
- [x] route GET /dashboard/corporate-training (dashboard.controller, Promise.all)
- [x] corporate_training.hbs - custom hero + stats + coming-soon; reuses benefit / alumni /
      gallery / faq / final_cta section partials
- [x] i18n corporateTraining.* en/id/ja

## 4. Alumni + Gallery
- [x] alumni.hbs - **pre-existing (interns)**, redesigned, renders OK
- [x] public/gallery/index.hbs - **pre-existing (interns)**, redesigned, renders OK
- [ ] DEFERRED: alumni.hbs + gallery view outer containers not yet on `.page-shell`
      (own their `max-w-[1600/1440]` shells) - same incremental-pass note

## 5. Auth set
- [x] shared partial components/ui/auth/index.hbs + all 6 views (login/regis/forgot/reset/
      verify-email/verify-email-success) - **pre-existing (interns)**, render OK

## 6. About extras
- [x] View All Team: route GET /dashboard/about/team + about_team_all.hbs (Figma 250:1875)
- [x] Team-lead profile: route GET /dashboard/about/team/lead + about_team_lead.hbs
      (Figma 250:1458 / 250:1648), 2 Alpine tabs = Educational Background / Portfolio
- [x] partial about_sidebar/links.hbs (link-mode sidebar for the sub-pages)
- [x] i18n - reused existing about.team.* keys

## 7. Seed
- [x] DONE. `src/database/seeds/content.seed.ts` (+ `npm run seed:content`). Seeded local
      `e_learning_test`: Benefit x5, Category x4, Alumni x6, CategoryPartner x4 + Partner x12,
      Gallery x6, Faq x7, Social x1, Vision, Mission x5, Value x6, Commitment x6, Paragraph x3,
      TeamLead, Background x2, Experience x2, Team x6. Multi-lang jsonb as `{id,en,ja}`.
      Guarded on non-empty benefit table. Pages now render real data.

## 8. Sweep
- [x] .page-shell on all NEW page views (navbar, footer, final_cta, corporate_training,
      about_team_all, about_team_lead)
- [x] pre-existing bug fixed: `res.render('portofolios')` -> `'portofolio'` (view name);
      /dashboard/portofolios was 500, now 200
- [x] i18n complete en/id/ja for every new key (JSON-valid)
- [x] `npm run build` green (nest build + tailwind + esbuild)
- [x] commits on dev-miko as mikkoikoi (no Claude attribution)
- [x] container alignment: landing sections now on `.page-shell`
- [ ] DEFERRED: delete superseded old section partials - none superseded this pass
- [ ] DEFERRED: dual-block -> single-tree + `sizeClass` conversion of the intern
      landing/alumni/gallery sections (incremental, dev-server-open pass)

## Commits on dev-miko (this pass)
- feat(shell): rebuild navbar + footer to the Figma redesign
- feat(landing,corporate): add final-cta section + Corporate Training page
- feat(about): View All Team + Team Lead profile sub-pages
- (final) fix portofolios view name + checklist/memory
