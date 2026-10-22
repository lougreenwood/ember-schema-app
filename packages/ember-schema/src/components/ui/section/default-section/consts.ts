export type SectionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Increment a section level, capping at the maximum level 7.
 */
export function nextSectionLevel(currentLevel: SectionLevel): SectionLevel {
  return Math.min(currentLevel + 1, 7) as SectionLevel;
}

/**
 * Map section levels to Frontile semantic typography classes. Uses Frontile's header typography scale for consistent
 * styling.
 *
 * Note: Scale is shifted down one level from semantic H tags to reduce header prominence (e.g., section level 1 uses
 * text-header-xl instead of text-header-2xl). Each level maps to a distinct smaller size so nested sections are always
 * visually subordinate to their parent.
 */
export const FONT_SIZE_MAP = new Map<SectionLevel, string>([
  [1, 'text-header-xl'],
  [2, 'text-header-lg'],
  [3, 'text-header-md'],
  [4, 'text-header-sm'],
  [5, 'text-header-xs'],
  [6, 'text-header-xs'],
  [7, 'text-header-xs'],
]);

/**
 * Map section levels to font weight for subtitles. All levels use normal weight so the subtitle reads as supporting
 * text rather than a competing heading.
 */
export const SUBTITLE_FONT_WEIGHT_MAP = new Map<SectionLevel, string>([
  [1, 'font-normal'],
  [2, 'font-normal'],
  [3, 'font-normal'],
  [4, 'font-normal'],
  [5, 'font-normal'],
  [6, 'font-normal'],
  [7, 'font-normal'],
]);

/**
 * Map section levels to the default font weight for titles. All levels use bold weight as the baseline; appearance
 * variants (e.g. subtle) override this via _appearanceClasses.
 */
export const TITLE_FONT_WEIGHT_MAP = new Map<SectionLevel, string>([
  [1, 'font-bold'],
  [2, 'font-bold'],
  [3, 'font-bold'],
  [4, 'font-bold'],
  [5, 'font-bold'],
  [6, 'font-bold'],
  [7, 'font-bold'],
]);

/**
 * Map section levels to the gap between the aboveTitle block (e.g., breadcrumbs) and the title row. Larger headings
 * need more breathing room to separate page-level navigation from the main heading.
 */
export const ABOVE_TITLE_GAP_MAP = new Map<SectionLevel, string>([
  [1, 'gap-6'],
  [2, 'gap-5'],
  [3, 'gap-4'],
  [4, 'gap-3'],
  [5, 'gap-2'],
  [6, 'gap-2'],
  [7, 'gap-2'],
]);

/**
 * Map section levels to gap between the title row and subtitle. Tightens as heading size decreases so the spacing stays
 * proportional to the text. Bottoms out at gap-0.5 (2px) for the smallest levels.
 */
export const TITLE_GROUP_GAP_MAP = new Map<SectionLevel, string>([
  [1, 'gap-1'],
  [2, 'gap-1'],
  [3, 'gap-1'],
  [4, 'gap-0'],
  [5, 'gap-0'],
  [6, 'gap-0'],
  [7, 'gap-0'],
]);

/**
 * Map section levels to Frontile semantic typography classes for subtitles. At levels 1–3 each subtitle steps two sizes
 * below the title so it reads as clearly supporting text rather than a competing label; at levels 4+ it also steps two
 * sizes below (bottoming out at text-header-nano).
 */
export const SUBTITLE_FONT_SIZE_MAP = new Map<SectionLevel, string>([
  [1, 'text-header-lg'],
  [2, 'text-header-md'],
  [3, 'text-header-sm'],
  [4, 'text-header-xs'],
  [5, 'text-header-xs'],
  [6, 'text-header-xs'],
  [7, 'text-header-xs'],
]);

/**
 * Map section levels to Tailwind v4 CSS variable expressions for the vertical gap between header and content. Values
 * reference Tailwind's --spacing custom property (e.g. calc(var(--spacing) * 8)) so spacing stays coupled to the
 * Tailwind/Frontile design system. Set as --section-gap on the section element and used as a flex gap
 * (gap-y-[var(--section-gap)]) or halved for symmetric divider padding (calc(var(--section-gap) / 2)).
 */
export const ROW_GAP_SIZE_MAP = new Map<SectionLevel, string>([
  [1, 'calc(var(--spacing) * 10)'],
  [2, 'calc(var(--spacing) * 8)'],
  [3, 'calc(var(--spacing) * 4)'],
  [4, 'calc(var(--spacing) * 2)'],
  [5, 'calc(var(--spacing) * 1)'],
  [6, 'calc(var(--spacing) * 1)'],
  [7, 'calc(var(--spacing) * 1)'],
]);

/**
 * Map section levels to Frontile icon size classes. Uses the upper bound of Frontile's recommended pairings (see
 * Frontile docs: theming/design-tokens/icons.md → Recommended Pairings) to give icons enough visual presence alongside
 * section headings. text-header-xs has no official pairing; size-icon-sm is the natural extension.
 */
export const ICON_SIZE_MAP = new Map<SectionLevel, string>([
  [1, 'size-icon-md!'],
  [2, 'size-icon-sm!'],
  [3, 'size-icon-xs!'],
  [4, 'size-icon-xs!'],
  [5, 'size-icon-xs!'],
  [6, 'size-icon-xs!'],
  [7, 'size-icon-xs!'],
]);

/**
 * Map section levels to Tailwind v4 CSS variable expressions for the gap between child elements in SectionBody. Set as
 * --body-gap on the section element and consumed as gap-[var(--body-gap)] by SectionBody. Values match the py-X values
 * in DIVIDER_SPACING_MAP so spacing feels consistent with or without dividers.
 */
export const BODY_GAP_SIZE_MAP = new Map<SectionLevel, string>([
  [1, 'calc(var(--spacing) * 4)'],
  [2, 'calc(var(--spacing) * 4)'],
  [3, 'calc(var(--spacing) * 4)'],
  [4, 'calc(var(--spacing) * 4)'],
  [5, 'calc(var(--spacing) * 3)'],
  [6, 'calc(var(--spacing) * 2)'],
  [7, 'calc(var(--spacing) * 2)'],
]);
