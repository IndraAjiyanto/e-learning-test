# Paid Program Page Refactoring - Hand-over Notes

> **Date:** 2026-09-04
> **Scope:** `paid_program.hbs` page and its L2 sections
> **Goal:** Component extraction, reuse-first strategy, i18n compliance

---

## 1. Summary of Changes

### 1.1 New Components Created

| Component | Location | Level | Purpose |
|---|---|---|---|
| `badge/paid_status` | `ui/badge/paid_status/index.hbs` | L1 | Enrollment status badge (diamond icon + text pill shape) |
| `button/btn_action` (updated) | `ui/button/btn_action/index.hbs` | L1 | Added `outline-white` variant for transparent buttons with white border |

### 1.2 Sections Refactored

| Section | File | Changes |
|---|---|---|
| **paid_hero** | `ui/sections/paid_hero/index.hbs` | Replaced inline badges with `badge/paid_status`, replaced hardcoded buttons with `btn_action` (primary + outline-white variants), fixed broken HTML structure |
| **paid_program** | `ui/sections/paid_program/index.hbs` | Replaced hardcoded header with `text/section_header`, added i18n keys |
| **paid_advantage** | `ui/sections/paid_advantage/index.hbs` | Replaced hardcoded titles/descriptions with `text/sub_title` and `text/description` components |
| **paid_flow** | `ui/sections/paid_flow/index.hbs` | Replaced hardcoded header with `text/section_header`, added i18n keys |
| **paid_cta** | `ui/sections/paid_cta/index.hbs` | Replaced hardcoded buttons with `btn_action`, replaced hardcoded text with `text/sub_title` and `text/description` |

### 1.3 Unchanged Sections (Already Reusable)

| Section | File | Status |
|---|---|---|
| **alumni** | `ui/sections/alumni/index.hbs` | Already reusable with `headerVariant="paid"` |
| **gallery** | `ui/sections/gallery/index.hbs` | Already reusable with paid configuration props |

---

## 2. New Component APIs

### 2.1 `badge/paid_status` (L1)

```
Location: src/views/partials/components/ui/badge/paid_status/index.hbs
```

**Props:**
| Prop | Required | Default | Description |
|---|---|---|---|
| `text` | No | `"ENROLLMENT OPEN"` | Badge text |
| `icon` | No | diamond icon | FontAwesome class (e.g., `"fas fa-graduation-cap"`) |
| `size` | No | `"md"` | `sm` / `md` / `lg` |
| `class` | No | `""` | Extra classes |

**Size mappings:**
- `sm`: 188x30px, icon 18px, text 13px (mobile only)
- `md`: 188x30px mobile / 328x47px desktop
- `lg`: 328x47px, icon 20px, text 16-20px

**Usage examples:**
```hbs
{{!-- Mobile badge (small) --}}
{{> components/ui/badge/paid_status/index size="sm"}}

{{!-- Desktop badge with graduation cap icon --}}
{{> components/ui/badge/paid_status/index
    icon="fas fa-graduation-cap"
    size="lg"
    class="mb-4 lg:mb-6 xl:mb-8"
}}
```

### 2.2 `button/btn_action` - New `outline-white` Variant

```
Location: src/views/partials/components/ui/button/btn_action/index.hbs
```

**New variant:** `outline-white`
- Background: transparent
- Text: white
- Border: 1px solid white
- Hover: `bg-white/10`

**Usage example:**
```hbs
{{> components/ui/button/btn_action/index
    href="https://wa.me/628123456789"
    target="_blank"
    text="Consultation"
    icon="fas fa-headset"
    variant="outline-white"
    class="w-full sm:max-w-[370px] h-[52px] sm:h-[65px]"
    textClass="ml-2"
}}
```

---

## 3. i18n Keys Required

The following i18n keys need to be added to the translation files (`src/common/i18n/en.json`, `id.json`, `ja.json`):

```json
{
  "test.categoryPaidProgram.programs.titleAccent": "Choose",
  "test.categoryPaidProgram.programs.title": "Your Learning Path",
  "test.categoryPaidProgram.programs.description": "Select the program that aligns with your goals and passion.",
  "test.categoryPaidProgram.advantage.title": "Core Knowledge First",
  "test.categoryPaidProgram.advantage.description": "Learn from the ground up with a structured, mentor-guided approach...",
  "test.categoryPaidProgram.advantage.descriptionMobile": "Learn from the ground up with a structured, mentor-guided approach...",
  "test.categoryPaidProgram.flow.titleAccent": "Final Capstone",
  "test.categoryPaidProgram.flow.title": "Project",
  "test.categoryPaidProgram.flow.description": "Kesatria Academy Portfolio Showcase"
}
```

**Note:** Some keys may already exist. Check the translation files before adding duplicates.

---

## 4. Component Dependency Map

```
paid_program.hbs (L4)
  ├── sections/paid_hero (L2)
  │   ├── badge/paid_status (L1) ← NEW
  │   └── button/btn_action (L1) ← UPDATED (outline-white variant)
  ├── sections/paid_program (L2)
  │   ├── text/section_header (L1)
  │   └── card/category/paid (L1)
  ├── sections/paid_advantage (L2)
  │   ├── text/sub_title (L1)
  │   ├── text/description (L1)
  │   └── card/category/paid/advantage (L1)
  ├── sections/paid_flow (L2)
  │   └── text/section_header (L1)
  ├── sections/alumni (L2) ← UNCHANGED
  │   ├── text/section_header (L1)
  │   └── card/card_alumni (L1)
  ├── sections/gallery (L2) ← UNCHANGED
  │   ├── text/section_header (L1)
  │   └── card/gallery (L1)
  └── sections/paid_cta (L2)
      ├── text/sub_title (L1)
      ├── text/description (L1)
      └── button/btn_action (L1)
```

---

## 5. Verification Checklist

Before merging, verify:

- [ ] Run `npm run build` - must complete without errors
- [ ] Check `paid_program.hbs` renders correctly on mobile (< 640px)
- [ ] Check `paid_program.hbs` renders correctly on desktop (>= 640px)
- [ ] Verify all buttons are clickable and navigate correctly
- [ ] Verify the "ENROLLMENT OPEN" badge displays correctly on both mobile and desktop
- [ ] Verify the Consultation button opens WhatsApp correctly
- [ ] Verify the alumni carousel works with `headerVariant="paid"`
- [ ] Verify the gallery section displays correctly
- [ ] Add missing i18n keys to translation files

---

## 6. Known Issues / Technical Debt

1. **Hardcoded text in paid_hero:** Some text like "BOOTCAMP BATCH 6.2" and "Registration"/"Start Learning" dates are still hardcoded. These should be moved to i18n keys or backend data in a future ticket.

2. **Hardcoded text in paid_cta:** The desktop CTA still has hardcoded "Explore Learning Path" text instead of using the i18n key.

3. **Duplicate "Explore Learning Path" button in paid_hero:** There are two instances of this button in the hero section (one standalone, one in the buttons row). Consider consolidating.

4. **paid_flow portfolio cards:** The portfolio cards are still inline HTML. Consider extracting them into a reusable `card/paid_portfolio` component if they're used elsewhere.

---

## 7. File Changes Summary

| File | Action | Lines Changed |
|---|---|---|
| `ui/badge/paid_status/index.hbs` | CREATED | ~40 lines |
| `ui/button/btn_action/index.hbs` | MODIFIED | +8 lines (outline-white variant) |
| `ui/sections/paid_hero/index.hbs` | MODIFIED | ~60 lines replaced |
| `ui/sections/paid_program/index.hbs` | MODIFIED | ~10 lines replaced |
| `ui/sections/paid_advantage/index.hbs` | REWRITTEN | ~93 lines |
| `ui/sections/paid_flow/index.hbs` | REWRITTEN | ~100 lines |
| `ui/sections/paid_cta/index.hbs` | REWRITTEN | ~68 lines |

---

## 8. Next Steps for Next Ticket

1. **Add missing i18n keys** to `src/common/i18n/en.json`, `id.json`, `ja.json`
2. **Test the build** with `npm run build`
3. **Verify rendering** on both mobile and desktop
4. **Consider extracting** portfolio cards into a reusable component
5. **Consider moving** remaining hardcoded text to i18n keys

---

*End of hand-over notes. The AI handling the next ticket should read this document to understand the refactoring results and continue from here.*
