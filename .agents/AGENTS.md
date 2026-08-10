# Project Rules & Style Guidelines

## Font Size Mapping Rules
When specifying font sizes in Tailwind CSS, use standard Tailwind classes according to the following mapping table:

| Tailwind Class | Pixel Size |
| -------------- | ---------- |
| `text-xs`      | 12px       |
| `text-sm`      | 14px       |
| `text-base`    | 16px       |
| `text-lg`      | 18px       |
| `text-xl`      | 20px       |
| `text-2xl`     | 24px       |
| `text-3xl`     | 30px       |
| `text-4xl`     | 36px       |
| `text-5xl`     | 48px       |
| `text-6xl`     | 60px       |
| `text-7xl`     | 72px       |
| `text-8xl`     | 96px       |
| `text-9xl`     | 128px      |

## Font Weight Mapping Rules
When specifying font weights in Tailwind CSS, use standard Tailwind classes according to the following mapping table:

| Tailwind Class   | CSS Property       | Weight Value |
| ---------------- | ------------------ | ------------ |
| `font-thin`       | `font-weight: 100` | 100          |
| `font-extralight` | `font-weight: 200` | 200          |
| `font-light`      | `font-weight: 300` | 300          |
| `font-normal`     | `font-weight: 400` | 400          |
| `font-medium`     | `font-weight: 500` | 500          |
| `font-semibold`   | `font-weight: 600` | 600          |
| `font-bold`       | `font-weight: 700` | 700          |
| `font-extrabold`  | `font-weight: 800` | 800          |
| `font-black`      | `font-weight: 900` | 900          |

## Line Height (Leading) Mapping Rules
When specifying line heights in Tailwind CSS, use standard Tailwind classes according to the following mapping table:

| Tailwind Class   | Value / Pixel Size |
| ---------------- | ------------------ |
| `leading-none`    | 1                  |
| `leading-tight`   | 1.25               |
| `leading-snug`    | 1.375              |
| `leading-normal`  | 1.5                |
| `leading-relaxed` | 1.625              |
| `leading-loose`   | 2                  |
| `leading-3`       | 12px               |
| `leading-4`       | 16px               |
| `leading-5`       | 20px               |
| `leading-6`       | 24px               |
| `leading-7`       | 28px               |
| `leading-8`       | 32px               |
| `leading-9`       | 36px               |
| `leading-10`      | 40px               |

## Arbitrary Custom Brackets Rule
- Prioritize standard Tailwind classes from the tables above whenever a value is present in the table.
- Use arbitrary custom bracket syntax `[...]` (e.g. `text-[42px]`, `leading-[45px]`, `w-[327px]`) **ONLY** when the specific value/pixel size is **NOT** present in the tables above.
