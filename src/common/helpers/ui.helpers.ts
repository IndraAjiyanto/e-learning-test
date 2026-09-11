/**
 * UI-related Handlebars helpers untuk text components
 * Lokasi: src/common/helpers/ui.helpers.ts
 *
 * Helpers:
 * - sizeClass(size)  → return Tailwind text-size class
 * - colorClass(color) → return Tailwind text-color class
 * - alignClass(align) → return Tailwind text-align class
 * - fontClass(font)   → return Tailwind font-family class
 *
 * Semua helper mendukung:
 * 1. Shorthand (contoh: "md" → "text-base")
 * 2. Raw value fallback (contoh: "text-[#FF5733]" → pass through)
 */

export const uiHelpers = {
  /**
   * Return Tailwind text-size class.
   *
   * Semantic keys (responsive, mobile -> desktop) — use these for new work:
   *   display, h1, h2, h3, eyebrow, lead, body, body-sm
   * A Figma px value maps to a key, never to a literal `text-[NNpx]`:
   *   56/48 -> display | 32-40 -> h1/h2 | 20-24 -> h3 | 22 -> lead | 16 -> body | <=14 -> body-sm
   *
   * Legacy shorthand (single breakpoint, kept for back-compat): xs, sm, md, base, lg, xl, 2xl, 3xl, 4xl
   * Raw fallback: "text-[20px]", "text-[1rem]", dll
   */
  sizeClass: (size: string) => {
    const map: Record<string, string> = {
      // semantic responsive scale — base + lg only, named Tailwind sizes.
      // Tuned for a 16in laptop, not the 1728px Figma frame.
      display: 'text-2xl leading-tight lg:text-4xl lg:leading-[1.15]',
      h1: 'text-xl leading-tight lg:text-3xl',
      h2: 'text-lg leading-snug lg:text-2xl',
      h3: 'text-base leading-snug lg:text-lg',
      eyebrow: 'text-xs tracking-[0.15em] uppercase',
      lead: 'text-sm leading-relaxed lg:text-base',
      body: 'text-sm leading-relaxed',
      'body-sm': 'text-xs leading-relaxed',
      // legacy shorthand
      xs: 'text-xs',
      sm: 'text-xs sm:text-sm',
      md: 'text-base',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-[25px]',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    };
    return map[size] || size || 'text-base';
  },

  /**
   * Return Tailwind text-color class
   * Shorthand: primary, secondary, dark, muted, gray, white
   * Raw fallback: "text-[#FF5733]", "text-gray-500", dll
   */
  colorClass: (color: string) => {
    const map: Record<string, string> = {
      primary: 'text-[#003060]',
      secondary: 'text-[#6EB6E5]',
      dark: 'text-[#0B1F3B]',
      muted: 'text-[#2D2D2D]',
      gray: 'text-gray-900',
      white: 'text-white',
    };
    return map[color] || color || 'text-[#2D2D2D]';
  },

  /**
   * Return Tailwind text-align class
   * Shorthand: left, center, right, justify
   */
  alignClass: (align: string) => {
    const map: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };
    return map[align] || 'text-center';
  },

  /**
   * Return Tailwind font-family class
   * Shorthand: sans, montserrat, inter, opensans
   * Raw fallback: "font-serif", "font-['Open_Sans']", dll
   */
  fontClass: (font: string) => {
    const map: Record<string, string> = {
      sans: 'font-sans',
      montserrat: 'font-montserrat',
      inter: 'font-inter',
      opensans: 'font-open-sans',
    };
    return map[font] || font || 'font-sans';
  },
};
