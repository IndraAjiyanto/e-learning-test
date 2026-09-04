# MPP Page Modularity Improvement Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Improve the modularity and maintainability of the MPP page by extracting repeated UI patterns into reusable Handlebars components.

**Architecture:** Identify repeated patterns in existing MPP partials (cards, tables, benefit items, accordions) and create generic components that can be reused across the MPP page and potentially other pages. Refactor existing partials to use these components, reducing duplication and improving consistency.

**Tech Stack:** Handlebars, HTML, CSS (Tailwind)

---

### Task 1: Analyze MPP partials for repeated patterns

**Objective:** Identify UI patterns that appear multiple times across MPP partials and document them for component extraction.

**Files:**
- Read: `src/views/partials/mpp/flow_program.hbs`
- Read: `src/views/partials/mpp/skema_komisi.hbs`
- Read: `src/views/partials/mpp/benefit.hbs`
- Read: `src/views/partials/mpp/kit_marketing.hbs`
- Read: `src/views/partials/mpp/faq.hbs`
- Read: `src/views/partials/mpp/daftar.hbs`
- Read: `src/views/partials/mpp/peran_tanggung_jawab.hbs`
- Read: `src/views/partials/mpp/target.hbs`
- Read: `src/views/partials/mpp/ruang_lingkup.hbs`
- Read: `src/views/partials/mpp/program_overview.hbs`
- Read: `src/views/partials/mpp/background.hbs`
- Read: `src/views/partials/mpp/purpose.hbs`
- Read: `src/views/partials/mpp/definition.hbs`
- Read: `src/views/partials/mpp/hero_section.hbs`

**Step 1: Examine each partial for repeated patterns**

```bash
# We'll do this manually by reading the files, but for the plan we note:
# - flow_program.hbs: repeated card structure with number, title, content
# - skema_komisi.hbs: table with headers and rows
# - benefit.hbs: repeated items with icon and text
# - kit_marketing.hbs: similar to benefit.hbs but different icons
# - faq.hbs: accordion with questions and answers
# - peran_tanggung_jawab.hbs: likely has sections or lists
# - target.hbs: may have lists or cards
# - etc.
```

**Step 2: Document patterns**

| Pattern | Description | Files where found |
|---------|-------------|-------------------|
| Card with number and title | A card showing a step number, title, and content blocks | flow_program.hbs |
| Table with headers and rows | A table comparing tiers, requirements, commissions, benefits | skema_komisi.hbs |
| Icon-text item | An item with an icon (circle or gradient) and descriptive text | benefit.hbs, kit_marketing.hbs |
| Accordion | A vertically stacked list of items that can be expanded/collapsed | faq.hbs |
| Section header | A heading with optional description (already partially componentized via `components/ui/text/section_header/index/`) | Multiple files |

**Step 3: Decide on components to create**

Based on analysis, we will create:
1. `mpp-card`: A reusable card for steps/features (with optional number, title, content)
2. `mpp-table`: A responsive table for comparing data
3. `mpp-benefit-item`: An item with icon and text for benefit lists
4. `mpp-accordion`: A reusable accordion for FAQs or similar content
5. (Optional) `mpp-section`: A wrapper for sections with background, padding, etc.

**Step 4: Verify no conflicts**

Ensure the new component names do not conflict with existing partials.

**Step 5: Commit analysis**

```bash
git add .hermes/plans/2026-08-28_102300-mpp-modularity-improvement.md
git commit -m "docs: add plan for MPP modularity improvement"
```

---

### Task 2: Create reusable component partials

**Objective:** Create new Handlebars partials for the identified reusable components.

**Files:**
- Create: `src/views/partials/components/mpp/card.hbs`
- Create: `src/views/partials/components/mpp/table.hbs`
- Create: `src/views/partials/components/mpp/benefit-item.hbs`
- Create: `src/views/partials/components/mpp/accordion.hbs`
- Create: `src/views/partials/components/mpp/section.hbs` (optional)

**Step 1: Create mpp-card.hbs**

```handlebars
{{!-- src/views/partials/components/mpp/card.hbs --}}
<div class="h-full min-h-[356px] w-full rounded-3xl border border-gray-300 bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(110,182,229,0.8)_100%)] px-6 pb-8 pt-10 shadow-xs">
    <!-- Card Title -->
    <div class="text-center">
        <h2 class="text-lg font-bold leading-7 text-[#003060]">
            {{title}}
        </h2>
    </div>

    <!-- Content -->
    <div class="mt-8 space-y-5">
        {{{content}}}
    </div>
</div>
```

Note: The above is based on the card structure in flow_program.hbs. We may need to make it more flexible to accommodate variations.

**Step 2: Create mpp-table.hbs**

```handlebars
{{!-- src/views/partials/components/mpp/table.hbs --}}
<div class="mx-auto mt-12 flex h-[481px] overflow-hidden rounded-xl border border-gray-300 shadow-lg">
    <!-- TINGKATAN -->
    <div class="flex w-[22%] flex-col ">
        <!-- Header -->
        <div class="flex h-[75px] shrink-0 items-center justify-center bg-[#003060] px-4 text-center font-sans text-[25px] font-semibold text-white">
            <h2>{{leftHeader}}</h2>
        </div>
        <!-- Content -->
        <div class="flex flex-1 flex-col bg-white font-sans text-[20px] border-r border-gray-300 text-gray-900">
            {{#each leftRows}}
            <div class="flex flex-1 items-center justify-center border-gray-200 px-6">
                <p>{{this}}</p>
            </div>
            {{/each}}
        </div>
    </div>

    <!-- SYARAT -->
    <div class="flex w-[25%] flex-col ">
        <!-- Header -->
        <div class="flex h-[75px] shrink-0 items-center justify-center bg-[#003060] px-4 text-center font-sans text-[25px] font-semibold text-white">
            <h2>{{middleHeader}}</h2>
        </div>
        <!-- Content -->
        <div class="flex flex-1 flex-col bg-white font-sans text-[20px] border-r border-gray-300 text-gray-900">
            {{#each middleRows}}
            <div class="flex flex-1 items-center justify-center border-gray-200 px-6">
                <p>{{this}}</p>
            </div>
            {{/each}}
        </div>
    </div>

    <!-- KOMISI -->
    <div class="flex w-[28%] flex-col ">
        <!-- Header -->
        <div class="flex h-[75px] shrink-0 items-center justify-center bg-[#003060] px-4 text-center font-sans text-[25px] font-semibold leading-7 text-white">
            <h2>{{rightHeader}}</h2>
        </div>
        <!-- Content -->
        <div class="flex flex-1 flex-col bg-white font-sans border-r border-gray-300 text-[20px] text-gray-900">
            {{#each rightRows}}
            <div class="flex flex-1 items-center border-gray-200 px-28">
                <p>{{this}}</p>
            </div>
            {{/each}}
        </div>
    </div>

    <!-- BENEFIT -->
    <div class="flex min-w-0 flex-1 flex-col">
        <!-- Header -->
        <div class="flex h-[75px] shrink-0 items-center justify-center bg-[#003060] px-4 text-center font-sans text-[25px] font-semibold leading-7 text-white">
            <h2>{{benefitHeader}}</h2>
        </div>
        <!-- Content -->
        <div class="flex flex-col mt-10 bg-white font-sans border-r border-gray-300 text-[20px] text-gray-900">
            {{#each benefitRows}}
            <div class="flex flex-1 items-center gap-4 mb-2 px-6">
                <i class="fa-solid fa-circle-check text-[#003060]"></i>
                <p>{{this}}</p>
            </div>
            {{/each}}
        </div>
    </div>
</div>
```

Note: This is very specific to the skema_komisi table. We might want to make it more generic, but for simplicity we'll create a component tailored to this table first, then generalize if needed.

**Step 3: Create mpp-benefit-item.hbs**

```handlebars
{{!-- src/views/partials/components/mpp/benefit-item.hbs --}}
<div class="flex items-start gap-4">
    <span class="mt-1.5 h-[25px] w-[25px] shrink-0 rounded-full bg-[linear-gradient(160.09deg,#6EB6E5_-2.7%,#FFED00_145.39%)]"></span>
    <p class="text-[20px] leading-7 text-gray-900">
        {{text}}
    </p>
</div>
```

Note: The background gradient may need to be parameterized.

**Step 4: Create mpp-accordion.hbs**

```handlebars
{{!-- src/views/partials/components/mpp/accordion.hbs --}}
<section
    x-data="{ activeIndex: null, faqs: {{faqs}}}"
    class="w-full bg-[url('/public/image/mpp/faq.png')] bg-cover bg-center py-16 lg:py-24"
>
    <div class="mx-auto max-w-[1728px] px-6 lg:px-12">
        <div class="mb-14 text-center">
            <h2 class=" text-[36px] font-bold leading-tight text-[#003060]">
                {{title}}
            </h2>
        </div>
        <div class="mx-auto max-w-[1406px] space-y-4">
            <template x-for="(faq, index) in faqs" :key="index">
                <div class="overflow-hidden rounded-xl bg-white shadow-lg">
                    <button
                        type="button"
                        @click="activeIndex = activeIndex === index ? null : index"
                        :aria-expanded="activeIndex === index"
                        :aria-controls="'faq-answer-' + index"
                        class="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-300 hover:bg-[#6EB6E5]/10 sm:px-8 sm:py-6"
                    >
                        <h3
                            class="font-sans text-[25px] font-semibold leading-7 text-[#003060] sm:text-[20px] sm:leading-8 lg:text-[25px]"
                            x-text="(index + 1) + '. ' + faq.question"
                        ></h3>

                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                        >
                            <i
                                class="fas fa-chevron-down text-[16px] text-[#003060] transition-transform duration-300"
                                :class="activeIndex === index ? 'rotate-180' : ''"
                            ></i>
                        </span>
                    </button>
                    <div
                        x-cloak
                        x-show="activeIndex === index"
                        x-collapse
                        :id="'faq-answer-' + index"
                        class="border-t border-gray-200"
                    >
                        <div class="px-6 py-5 sm:px-8 sm:py-6">
                            <p
                                class="font-sans text-[25px] leading-7 text-gray-900 sm:text-[18px] sm:leading-8 lg:text-[25px]"
                                x-text="faq.answer"
                            ></p>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <div class="mx-auto mt-12 max-w-[1406px]">
            <div class="rounded-2xl px-6 py-8 text-center sm:px-10">
                <p class="font-sans text-[20px] text-gray-900 sm:text-[20px]">
                    {{ctaText}}
                </p>
                <p class="mt-2 font-sans text-[20px] text-gray-900 sm:text-[20px]">
                    {{ctaSubtext}}
                </p>
                <a
                    href="{{ctaUrl}}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mx-auto mt-5 flex w-fit items-center gap-3 rounded-full px-5 py-3 transition-colors duration-300 hover:bg-green-100"
                >
                    <i class="fa-brands fa-whatsapp text-[28px] text-green-500"></i>
                    <span class="font-sans text-[20px] font-semibold text-gray-900">
                        {{ctaPhone}}
                    </span>
                </a>
            </div>
        </div>
    </div>
</section>
```

Note: This is quite specific to the current FAQ. We may want to make it more generic by allowing custom CTA.

**Step 5: Create mpp-section.hbs (optional)**

```handlebars
{{!-- src/views/partials/components/mpp/section.hbs --}}
<section class="{{class}}">
    <div class="mx-auto max-w-[1728px] px-6 lg:px-12">
        {{{content}}}
    </div>
</section>
```

**Step 6: Commit new components**

```bash
git add src/views/partials/components/mpp/card.hbs src/views/partials/components/mpp/table.hbs src/views/partials/components/mpp/benefit-item.hbs src/views/partials/components/mpp/accordion.hbs src/views/partials/components/mpp/section.hbs
git commit -m "feat: create reusable MPP components (card, table, benefit-item, accordion, section)"
```

---

### Task 3: Refactor flow_program.hbs to use mpp-card

**Objective:** Replace the hardcoded card structure in flow_program.hbs with the reusable mpp-card component.

**Files:**
- Modify: `src/views/partials/mpp/flow_program.hbs`
- Create: (none, we're modifying existing)

**Step 1: Update flow_program.hbs to use mpp-card**

We'll replace each card with an invocation of the mpp-card component, passing title and content as parameters.

```handlebars
{{!-- Before: each card is hardcoded --}}
{{!-- After: --}}
{{> mpp/components/mpp/card
    title="Perekrutan & Pendaftaran"
    content="
        <div class=\"mt-8 space-y-5\">
            <div class=\"flex items-start gap-3\">
                <span class=\"mt-2 h-2 w-2 shrink-0 rounded-full bg-[#003060]\"></span>
                <p class=\"text-sm leading-6 text-gray-700\">
                    Publikasi program melalui media sosial dan job board.
                </p>
            </div>
            <div class=\"flex items-start gap-3\">
                <span class=\"mt-2 h-2 w-2 shrink-0 rounded-full bg-[#003060]\"></span>
                <p class=\"text-sm leading-6 text-gray-700\">
                    Calon mitra mengisi formulir pendaftaran online.
                </p>
            </div>
            <div class=\"flex items-start gap-3\">
                <span class=\"mt-2 h-2 w-2 shrink-0 rounded-full bg-[#003060]\"></span>
                <p class=\"text-sm leading-6 text-gray-700\">
                    Tim MPP memverifikasi data calon mitra.
                </p>
            </div>
        </div>"
}}
```

We'll do this for each of the five cards.

**Step 2: Adjust the outer structure if needed**

The outer structure of flow_program.hbs includes the section title, description, and the container for the cards. We'll keep that and only replace the card items.

**Step 3: Verify the output matches**

We'll need to check that the generated HTML is identical (or visually identical) to the original.

**Step 4: Commit changes**

```bash
git add src/views/partials/mpp/flow_program.hbs
git commit -m "refactor: use mpp-card component in flow_program.hbs"
```

---

### Task 4: Refactor skema_komisi.hbs to use mpp-table

**Objective:** Replace the hardcoded table in skema_komisi.hbs with the reusable mpp-table component.

**Files:**
- Modify: `src/views/partials/mpp/skema_komisi.hbs`

**Step 1: Prepare data for the table**

We'll need to pass the headers and rows as parameters to the mpp-table component.

**Step 2: Replace the table with mpp-table invocation**

```handlebars
{{> mpp/components/mpp/table
    leftHeader="TINGKATAN"
    leftRows='["Partner Starter","Partner Active","Partner Lead"]'
    middleHeader="SYARAT"
    middleRows='["Baru bergabung","≥ 3 closing per bulan","≥ 10 closing per bulan"]'
    rightHeader="KOMISI PER PENDAFTAR"
    rightRows='["<p><span class=\"text-[30px]\">7%</span> per closing</p>","<p><span class=\"text-[30px]\">7%</span> per closing<br><span class=\"text-[30px]\">+5%</span> revenue per batch</p>","<p><span class=\"text-[30px]\">7%</span> per closing<br><span class=\"text-[30px]\">+5%</span> revenue per batch</p>"]'
    benefitHeader="BENEFIT TAMBAHAN"
    benefitRows='["Akses campaign eksklusif","Mentoring karir"]'
}}
```

Note: We'll need to escape the content properly for Handlebars. Alternatively, we can pass the data as JSON objects from the backend, but since we're only changing the frontend, we'll keep it as strings and hope the HTML is safe.

Alternatively, we can break the table into smaller components (like a row component) but for simplicity we'll do it this way.

**Step 3: Verify the output**

Check that the table looks the same.

**Step 4: Commit changes**

```bash
git add src/views/partials/mpp/skema_komisi.hbs
git commit -m "refactor: use mpp-table component in skema_komisi.hbs"
```

---

### Task 5: Refactor benefit.hbs and kit_marketing.hbs to use mpp-benefit-item

**Objective:** Replace the repeated benefit items in benefit.hbs and kit_marketing.hbs with the reusable mpp-benefit-item component.

**Files:**
- Modify: `src/views/partials/mpp/benefit.hbs`
- Modify: `src/views/partials/mpp/kit_marketing.hbs`

**Step 1: Refactor benefit.hbs**

Each benefit item in benefit.hbs looks like:

```handlebars
<div class="flex items-start gap-4">
    <span class="mt-1.5 h-[25px] w-[25px] shrink-0 rounded-full bg-[linear-gradient(160.09deg,#6EB6E5_-2.7%,#FFED00_145.39%)]"></span>
    <p class="text-[20px] leading-7 text-gray-900">
        Sertifikat pengalaman sebagai Marketing Partner untuk pengembangan portofolio/CV.
    </p>
</div>
```

We'll replace each with:

```handlebars
{{> mpp/components/mpp/benefit-item text="Sertifikat pengalaman sebagai Marketing Partner untuk pengembangan portofolio/CV."}}
```

But note: the background gradient might be different for each item? In benefit.hbs, all items use the same gradient. In kit_marketing.hbs, they use a different gradient.

We'll need to make the gradient parameterizable in the benefit-item component, or create separate components. For now, we'll assume the gradient is the same for all items in a given partial, and we can pass it as a parameter or override via CSS.

Alternatively, we can create two components: one for benefit and one for kit_marketing, but let's try to make the benefit-item component accept a background class.

Let's update mpp-benefit-item.hbs to accept a backgroundClass parameter:

```handlebars
{{!-- src/views/partials/components/mpp/benefit-item.hbs --}}
<div class="flex items-start gap-4">
    <span class="mt-1.5 h-[25px] w-[25px] shrink-0 rounded-full {{backgroundClass}}"></span>
    <p class="text-[20px] leading-7 text-gray-900">
        {{text}}
    </p>
</div>
```

Then in benefit.hbs, we'll pass:

```handlebars
{{> mpp/components/mpp/benefit-item
    text="Sertifikat pengalaman sebagai Marketing Partner untuk pengembangan portofolio/CV."
    backgroundClass="bg-[linear-gradient(160.09deg,#6EB6E5_-2.7%,#FFED00_145.39%)]"
}}
```

And in kit_marketing.hbs, we'll pass a different gradient.

**Step 2: Update the component**

```bash
# Update mpp-benefit-item.hbs to use backgroundClass
```

**Step 3: Refactor benefit.hbs**

Replace all four items.

**Step 4: Refactor kit_marketing.hbs**

Replace all five items with the appropriate gradient (from the original: bg-[linear-gradient(168.85deg,#FFED00_6.31%,#003060_109%)]).

**Step 5: Commit changes**

```bash
git add src/views/partials/components/mpp/benefit-item.hbs src/views/partials/mpp/benefit.hbssrc/views/partials/mpp/kit_marketing.hbs
git commit -m "refactor: use mpp-benefit-item component in benefit.hbs and kit_marketing.hbs"
```

---

### Task 6: Refactor faq.hbs to use mpp-accordion

**Objective:** Replace the hardcoded accordion in faq.hbs with the reusable mpp-accordion component.

**Files:**
- Modify: `src/views/partials/mpp/faq.hbs`

**Step 1: Prepare the data for the accordion**

We'll need to pass the faqs array, title, and CTA text as parameters.

**Step 2: Replace the accordion with mpp-accordion invocation**

```handlebars
{{> mpp/components/mpp/accordion
    title="FAQ"
    faqs='[{"question":"Apakah mitra harus mengikuti training terlebih dahulu sebelum mulai promosi?","answer":"Tidak. Mitra hanya perlu mengikuti sesi onboarding produk singkat (±1–2 jam), setelah itu dapat langsung memulai aktivitas pemasaran."},{"question":"Apakah mitra bertanggung jawab menyelesaikan proses closing?","answer":"Tidak. Tugas mitra adalah membawa calon peserta hingga tahap konsultasi/minat serius. Proses closing dan administrasi ditangani oleh tim admisi bootcamp."},{"question":"Apakah status mitra adalah karyawan tetap?","answer":"Bukan. Status mitra bersifat kemitraan lepas (freelance partner), bukan hubungan kerja formal, sehingga sesuai untuk mahasiswa aktif."},{"question":"Kapan komisi dicairkan?","answer":"Komisi dicairkan pada periode yang ditentukan (misalnya setiap tanggal 10 untuk closing bulan sebelumnya) melalui transfer bank atau e-wallet."},{"question":"Apakah ada target minimum yang wajib dipenuhi?","answer":"Tidak ada target wajib. Namun performa mitra menentukan tingkatan dan besaran komisi yang dapat diperoleh."},{"question":"Apakah mitra bisa dikeluarkan dari program?","answer":"Ya, apabila mitra terbukti melanggar kode etik pemasaran seperti spam atau memberikan informasi menyesatkan, tim pusat berhak memberi peringatan hingga memutus kemitraan."},{"question":"Bagaimana jika dua mitra membawa calon peserta yang sama?","answer":"Sistem tracking mencatat referral berdasarkan klik/kode pertama yang digunakan calon peserta (first-click attribution), sehingga komisi diberikan kepada mitra yang tercatat lebih dulu pada sistem."}]'
    ctaText="Punya pertanyaan lain? Gas tanya aja! 🚀"
    ctaSubtext="Jangan ragu buat hubungi tim kita kapan pun di:"
    ctaUrl="https://wa.me/6289646834607"
    ctaPhone="+62 896 4683 4607"
}}
```

**Step 3: Commit changes**

```bash
git add src/views/partials/mpp/faq.hbs
git commit -m "refactor: use mpp-accordion component in faq.hbs"
```

---

### Task 7: Refactor other partials as applicable

**Objective:** Check other MPP partials (peran_tanggung_jawab, target, ruang_lingkup, program_overview, background, purpose, definition, hero_section, daftar) for opportunities to use the new components.

**Files:**
- Read: each of the remaining MPP partials
- Modify: where applicable

**Step 1: Check peran_tanggung_jawab.hbs**

This file likely contains sections about responsibilities. It might benefit from using mpp-card or mpp-section.

**Step 2: Check target.hbs**

This file might contain lists or cards.

**Step 3: Check ruang_lingkup.hbs**

This file might contain a list of scopes.

**Step 4: Check program_overview.hbs**

This file might contain cards or lists.

**Step 5: Check background.hbs, purpose.hbs, definition.hbs, hero_section.hbs, daftar.hbs**

These might be less likely to benefit from the new components, but we'll review.

**Step 6: Apply refactoring where it makes sense**

For example, if any partial has repeated card-like structures, use mpp-card. If it has benefit-like items, use mpp-benefit-item.

**Step 7: Commit changes**

```bash
git add src/views/partials/mpp/peran_tanggung_jawab.hbs src/views/partials/mpp/target.hbs src/views/partials/mpp/ruang_lingkup.hbs src/views/partials/mpp/program_overview.hbs src/views/partials/mpp/background.hbs src/views/partials/mpp/purpose.hbs src/views/partials/mpp/definition.hbs src/views/partials/mpp/hero_section.hbs src/views/partials/mpp/daftar.hbs
git commit -m "refactor: apply reusable components to other MPP partials where applicable"
```

---

### Task 8: Verify the entire MPP page renders correctly

**Objective:** Ensure that after all refactoring, the MPP page looks and functions exactly as before.

**Files:**
- Run: the application (if possible) or check the generated HTML

**Step 1: Start the development environment**

```bash
npm run start:dev
```

**Step 2: Navigate to the MPP page**

Check that all sections are present and styled correctly.

**Step 3: Check for any console errors**

Ensure there are no JavaScript errors (especially for the FAQ accordion which uses Alpine.js).

**Step 4: Compare with original**

If possible, compare the HTML output before and after refactoring to ensure no visual differences.

**Step 5: Commit if successful**

```bash
git commit -m "chore: verify MPP page renders correctly after refactoring"
```

If there are issues, we'll need to debug and fix.

---

### Task 9: Cleanup and final commit

**Objective:** Remove any unused files or code and finalize the changes.

**Files:**
- Check for any leftover temporary code

**Step 1: Ensure all changes are committed**

**Step 2: Update documentation if needed**

**Step 3: Final commit**

```bash
git commit -m "docs: finalize MPP modularity improvement plan"
```

---

## Files Likely to Change

- src/views/partials/mpp/flow_program.hbs
- src/views/partials/mpp/skema_komisi.hbs
- src/views/partials/mpp/benefit.hbs
- src/views/partials/mpp/kit_marketing.hbs
- src/views/partials/mpp/faq.hbs
- src/views/partials/mpp/peran_tanggung_jawab.hbs
- src/views/partials/mpp/target.hbs
- src/views/partials/mpp/ruang_lingkup.hbs
- src/views/partials/mpp/program_overview.hbs
- src/views/partials/mpp/background.hbs
- src/views/partials/mpp/purpose.hbs
- src/views/partials/mpp/definition.hbs
- src/views/partials/mpp/hero_section.hbs
- src/views/partials/mpp/daftar.hbs
- src/views/partials/components/mpp/card.hbs (new)
- src/views/partials/components/mpp/table.hbs (new)
- src/views/partials/components/mpp/benefit-item.hbs (new)
- src/views/partials/components/mpp/accordion.hbs (new)
- src/views/partials/components/mpp/section.hbs (new, optional)

## Tests / Validation

- Visual verification: Ensure the MPP page looks identical to before.
- Check for any broken links or missing images.
- Test the FAQ accordion to ensure it still works (Alpine.js functionality).
- Ensure responsive design still works (check on different screen sizes).
- Run existing tests if any (though the project may not have frontend tests).

## Risks, Tradeoffs, and Open Questions

**Risks:**
- Introducing bugs during refactoring that alter the visual appearance or functionality.
- Over-engineering: creating components that are too generic and end up being harder to use than the original.
- Inconsistency: if not all similar patterns are converted, the codebase might become inconsistent.

**Tradeoffs:**
- Increased number of files (more partials) but each file is simpler and more focused.
- Slight indirection: to understand a section, one might need to look at the component and its usage.
- Build time: negligible impact.

**Open Questions:**
- Should we create a generic table component that can handle any table, or keep the table component specific to the skema_komisi table? (We started specific; we may generalize later if needed.)
- Should the benefit-item component allow for custom icons, or just background color? Currently we use a background gradient to represent the icon; we might want to switch to actual icon components (like FontAwesome) for better accessibility.
- How to handle data passing: currently we're passing strings of HTML for content; in a more robust setup, we might pass data objects and let the component handle the looping, but that would require changes to how the partials are called (possibly needing backend support). Since we're only changing the frontend, we'll keep it as is for now.

## References

- Existing MPP partials: `src/views/partials/mpp/*.hbs`
- Existing UI components: `src/views/partials/components/ui/` (e.g., section_header.hbs)
- Alpine.js documentation for the accordion: https://alpinejs.dev/