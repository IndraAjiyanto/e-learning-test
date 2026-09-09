# Rebuild checklist (dev-miko)

Tracking `docs/landing-user-rebuild-plan.md` §5. Tick as done.

## 1. Shell
- [x] navbar.hbs full rewrite (Home / Class dd / Corporate Training / Information dd / lang / auth / mobile drawer)
- [x] partial: components/ui/nav/info_item
- [x] partial: components/ui/nav/lang_switcher
- [x] navbar i18n keys en/id/ja
- [ ] footer.hbs rewrite to Figma (address / quick links / our program / follow us / copyright)
- [ ] footer i18n keys en/id/ja

## 2. Landing /dashboard
- [ ] section: hero (eyebrow, H1, sub, 2 CTAs, image)
- [ ] section: benefit = "Why Choose" (Benefit x5, 3x2)
- [ ] section: program = "Specialized Career Pathways" (Category x4 + advisor banner)
- [ ] section: alumni = testimonials A (Alumni.message, 3 cards + pagination)
- [ ] section: partner = testimonials B (Partner + CategoryPartner, 4 filter buttons + logo grid)
- [ ] section: final_cta (NEW)
- [ ] section: gallery block (Gallery, 3-up + See All)
- [ ] section: faq block (Faq accordion)
- [ ] dashboard.hbs assembles new sections
- [ ] landing i18n keys en/id/ja

## 3. Corporate Training (NEW)
- [ ] route GET /dashboard/corporate-training (dashboard.controller)
- [ ] corporate_training.hbs (hero+stats, coming-soon card, why-choose, testimonials, gallery, faq, final-cta)
- [ ] i18n keys en/id/ja

## 4. Alumni + Gallery
- [ ] alumni.hbs rewrite (header, static stats card, filter, 2-row grid, pagination)
- [ ] public/gallery/index.hbs rewrite (header, filter, 6-card masonry, pagination)
- [ ] i18n keys en/id/ja

## 5. Auth set
- [ ] shared glass-card partial + auth navbar
- [ ] login.hbs
- [ ] regis.hbs
- [ ] forgot-password.hbs
- [ ] reset-password.hbs
- [ ] verify-email.hbs
- [ ] verify-email-success.hbs
- [ ] auth i18n keys en/id/ja

## 6. About extras
- [ ] View All Team: route + view (About shell + Team grid)
- [ ] Team-lead profile: route + view (breadcrumb, profile header, 2 tabs, timeline)
- [ ] i18n keys en/id/ja

## 7. Seed
- [ ] seeder: Benefit x5, Category x4, Alumni x6, CategoryPartner x4 + Partner, Gallery x6, Faq x7

## 8. Sweep
- [ ] .page-shell on every rebuilt page view
- [ ] delete superseded old section partials
- [ ] i18n complete en/id/ja (no missing keys)
- [ ] npm run build green
- [ ] commits on dev-miko as mikkoikoi (no Claude attribution)
