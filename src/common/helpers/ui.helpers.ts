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
   * Return Tailwind text-size class
   * Shorthand: xs, sm, md, base, lg, xl, 2xl, 3xl, 4xl
   * Raw fallback: "text-[20px]", "text-[1rem]", dll
   */
  sizeClass: (size: string) => {
    const map: Record<string, string> = {
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
