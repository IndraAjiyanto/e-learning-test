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
- [ ] DEFERRED: intern sections use the dual mobile/desktop block pattern + arbitrary
      `text-[NNpx]` + per-section `max-w-[1554/1760/1375...]` instead of the approved
      single-tree + `sizeClass` + `.page-shell`. Not refactored this pass (working code,
      blind-edit regression risk). Follow-up ticket.

## 3. Corporate Training (NEW)
- [x] route GET /dashboard/corporate-training (dashboard.controller, Promise.all)
- [x] corporate_training.hbs - custom hero + stats + coming-soon; reuses benefit / alumni /
      gallery / faq / final_cta section partials
- [x] i18n corporateTraining.* en/id/ja

## 4. Alumni + Gallery
- [x] alumni.hbs - **pre-existing (interns)**, redesigned, renders OK
- [x] public/gallery/index.hbs - **pre-existing (interns)**, redesigned, renders OK
- [ ] DEFERRED: same standard-compliance note as landing sections

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
- [ ] NOT DONE. Local DB `e_learning_test` (port 5433) is **empty** - all 8 content tables
      have 0 rows, so every section renders its hardcoded `{{else}}` fallback. A seeder was
      not written/run (DB mutation blind against inferred schema = confirm-first). Pages
      look complete via fallbacks; real seed is a follow-up.

## 8. Sweep
- [x] .page-shell on all NEW page views (navbar, footer, final_cta, corporate_training,
      about_team_all, about_team_lead)
- [x] pre-existing bug fixed: `res.render('portofolios')` -> `'portofolio'` (view name);
      /dashboard/portofolios was 500, now 200
- [x] i18n complete en/id/ja for every new key (JSON-valid)
- [x] `npm run build` green (nest build + tailwind + esbuild)
- [x] commits on dev-miko as mikkoikoi (no Claude attribution)
- [ ] DEFERRED: delete superseded old section partials - none superseded this pass
- [ ] DEFERRED: standard-compliance refactor of intern landing/alumni/gallery sections

## Commits on dev-miko (this pass)
- feat(shell): rebuild navbar + footer to the Figma redesign
- feat(landing,corporate): add final-cta section + Corporate Training page
- feat(about): View All Team + Team Lead profile sub-pages
- (final) fix portofolios view name + checklist/memory
