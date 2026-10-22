import type { SectionLevel } from '@ember-schema-app/ember-schema/components/ui/section/default-section/consts';

/**
 * Map section levels to ExpandButton sizes. Derived from ICON_SIZE_MAP to keep expand buttons visually aligned with
 * header text.
 */
export const BUTTON_SIZE_MAP = new Map<SectionLevel, '2xs' | 'lg' | 'md' | 'sm' | 'xl' | 'xs'>([
  [1, 'lg'],
  [2, 'md'],
  [3, 'sm'],
  [4, 'xs'],
  [5, 'xs'],
  [6, '2xs'],
  [7, '2xs'],
]);

/**
 * Column gap between chevron/beforeTitle area and content. Used by CollapsibleSection's grid layout. Kept small and
 * consistent across levels.
 */
export const COL_GAP = 'gap-x-2';
