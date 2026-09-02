# MPP Partials UI Pattern Analysis

## Overview
Analyzed Handlebars partials in `src/views/partials/mpp/` to identify repeated UI patterns suitable for extraction into reusable components.

## Files Examined
- background.hbs
- benefit.hbs
- daftar.hbs
- definition.hbs
- faq.hbs
- flow_program.hbs
- hitung_komisi.hbs (not in original list but present)
- kit_marketing.hbs
- peran_tanggung_jawab.hbs
- program_overview.hbs
- purpose.hbs
- ruang_lingkup.hbs
- skema_komisi.hbs
- target.hbs
- hero_section.hbs

## Identified Patterns

### 1. Benefit/Feature Item List
**Description**: List items with a visual marker (dot/circle) followed by text. Commonly used for presenting features, benefits, or steps.
**Variations**:
- Marker size: large (h-[25px] w-[25px]) or small (h-2 w-2)
- Marker background: gradient (linear-gradient) or solid color (bg-[#003060])
- Layout: `flex items-start gap-4` (or gap-3)
**Files Found**:
- benefit.hbs (benefit items)
- kit_marketing.hbs (kit items)
- target.hbs (target criteria)
- peran_tanggung_jawab.hbs (responsibility lists)
- flow_program.hbs (step descriptions)
- faq.hbs (not exactly, but similar dot markers in some lists)
**Recommended Component**: `<ListItem marker={{ size: 'large'|'small', type: 'gradient'|'solid', color?: string }} />`
**Usage Example**:
```handlebars
<ListItem marker={{ size: 'large', type: 'gradient' }}>
  Sertifikat pengalaman sebagai Marketing Partner
</ListItem>
```

### 2. Card with Icon, Title, Description
**Description**: A card component featuring an icon, title heading, and description text, often with hover effects.
**Variations**:
- Sizes: fixed dimensions (purpose.hbs) or flexible (program_overview.hbs)
- Effects: hover lift (purpose.hbs), hover shadow (program_overview.hbs), or none
- Background: translucent white (purpose.hbs) or solid white (program_overview.hbs)
**Files Found**:
- program_overview.hbs (feature cards)
- purpose.hbs (benefit cards)
**Recommended Component**: `<FeatureIconTitleText icon={{ name: string, size?: string, color?: string }} title={string} description={string} variant={{ 'default' | 'lift' | 'shadow' }} />`
**Usage Example**:
```handlebars
<FeatureIconTitleText 
  icon={{ name: 'bolt', size: '96px', color: '#003060' }}
  title="Efisien"
  description="Akuisisi peserta dilakukan dengan biaya yang lebih optimal dan efektif."
  variant="lift"
/>
```

### 3. Accordion / Toggle Section
**Description**: A section where clicking a header toggles the visibility of associated content, often with an icon rotation indicator.
**Files Found**:
- faq.hbs (Alpine.js-based accordion with multiple items)
- background.hbs (simple toggle for extra content)
**Recommended Component**: `<Accordion items={{ question: string, answer: string }} />` or `<ToggleButton>{label}</ToggleButton>` with collapsible content.
**Usage Example** (for FAQ):
```handlebars
<Accordion 
  items={{ 
    question: 'Apakah mitra harus mengikuti training terlebih dahulu?', 
    answer: 'Tidak. Mitra hanya perlu mengikuti sesi onboarding produk singkat...'
  }} 
/>
```

### 4. Section Header
**Description**: A reusable component for section headers with optional badge, title, and description.
**Files Found**:
- target.hbs (uses `{{> components/ui/section_header }}`)
- skema_komisi.hbs (uses `{{> components/ui/section_header }}`)
- hero_section.hbs (uses `{{> components/ui/section_header }}`)
**Note**: This pattern is already partially componentized but could be standardized further.
**Recommended Component**: Already exists as `components/ui/section_header`; ensure consistent usage and documentation.

### 5. Button Variants
**Description**: Multiple button styles observed across files.
**Variations**:
- Primary: `bg-[#003060] text-white hover:bg-[#001f3f]` (daftar.hbs)
- Outline: `border border-[#003060] text-[#003060] hover:bg-[#6EB6E5]/10` (faq.hbs WhatsApp button)
- Text: `text-[#6EB6E5] font-semibold underline` (background.hbs toggle button)
**Files Found**:
- daftar.hbs (primary button)
- faq.hbs (WhatsApp button)
- background.hbs (toggle button)
- purpose.hbs & hero_section.hbs (via `components/ui/btn_action`)
**Recommended Component**: `<Button variant={{ 'primary' | 'outline' | 'text' }} size={{ 'sm' | 'md' | 'lg' }}>{content}</Button>`
**Usage Example**:
```handlebars
<Button variant="primary" size="md">Daftar Sekarang</Button>
```

### 6. Grid Layout
**Description**: Responsive grid layouts using Tailwind's grid system.
**Files Found**:
- purpose.hbs (`lg:grid-cols-3`)
- peran_tanggung_jawab.hbs (`lg:grid-cols-3`)
- ruang_lingkup.hbs (`lg:grid-cols-2`)
- program_overview.hbs (`lg:grid-cols-5`)
**Note**: This is a utility pattern; extraction may not be necessary unless complex variations exist.
**Recommended**: Consider creating a `<GridLayout cols={{ sm: number, lg: number }} gap={string}>...</GridLayout>` wrapper if grid patterns become complex.

### 7. Badge
**Description**: A small label/badge often used to categorize or highlight a section.
**Files Found**:
- benefit.hbs (non-financial incentive badge)
- kit_marketing.hbs (marketing kit badge)
- background.hbs (section title badge)
**Recommended Component**: `<Badge variant={{ 'gradient' | 'solid' | 'outline' }}>{content}</Badge>`
**Usage Example**:
```handlebars
<Badge variant="gradient">Insentif Non-Finansial</Badge>
```

### 8. Step Indicator (Circular Number)
**Description**: A circled number used to indicate steps in a process.
**Files Found**:
- flow_program.hbs (each step: 1, 2, 3, 4, 5)
**Recommended Component**: `<StepIndicator number={number} />`
**Usage Example**:
```handlebars
<StepIndicator number={3} />
```

### 9. Card with Header and Content List
**Description**: A card divided into a header section (often with background color) and a body containing a list of items.
**Files Found**:
- peran_tanggung_jawab.hbs (each responsibility column)
- ruang_lingkup.hbs (TERMASUK/TIDAK TERMASUK cards)
- flow_program.hbs (each step card)
- skema_komisi.hbs (each column: TINGKATAN, SYARAT, KOMISI, BENEFIT)
**Recommended Component**: `<CardWithHeader headerTitle={string} headerVariant={{ 'gradient' | 'solid' }}>{content}</CardWithHeader>`
**Usage Example**:
```handlebars
<CardWithHeader headerTitle="Tanggung Jawab Mitra" headerVariant="gradient">
  <ListItem marker={{ size: 'small', type: 'solid' }}>
    Membagikan referral secara etis
  </ListItem>
  {/* ... more items ... */}
</CardWithHeader>
```

### 10. Two-Column Layout (Text/Image or Text/Card)
**Description**: A layout where content is split into two columns, typically image/media on one side and text/content on the other, stacking vertically on mobile.
**Files Found**:
- definition.hbs (text on left, card on right)
- background.hbs (text on left, image on right)
- benefit.hbs (image on left, text on right)
- kit_marketing.hbs (text on left, image on right)
**Recommended Component**: `<TwoColumnLayout reverseOnLg={{ boolean }}>{content}</TwoColumnLayout>`
**Usage Example**:
```handlebars
<TwoColumnLayout reverseOnLg={{ false }}>
  <div> {/* Image column */} </div>
  <div> {/* Text column */} </div>
</TwoColumnLayout>
```

## Recommendations
1. **Prioritize Extraction**: Start with the most frequently occurring patterns:
   - Benefit/Feature Item List (appears in 6+ files)
   - Card with Icon, Title, Description (appears in 3+ files)
   - Section Header (already exists but ensure consistency)
   - Button Variants (appears in multiple files)

2. **Component Library**: Consider creating a dedicated `components/ui/` directory for these extracted components if not already present.

3. **Consistency**: Standardize props and variants across components to ensure predictable usage.

4. **Documentation**: Create a storybook or documentation page for each component showing variants and usage.

## Conclusion
The MPP partials contain several repeated UI patterns that can be extracted into reusable components, reducing duplication and improving maintainability. The most beneficial extractions would be the list item marker pattern, feature card pattern, and section/button components.