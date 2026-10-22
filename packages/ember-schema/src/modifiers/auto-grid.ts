import { modifier } from 'ember-modifier';

interface AutoGridSignature {
  Args: {
    Named: {
      /**
       * Gap between grid cells. Accepts any valid CSS gap value (e.g., '1rem', '16px'). Defaults to the inherited
       * `--body-gap` CSS variable when omitted, which is set by Section's level-relative spacing system.
       */
      gap?: string;
    };
  };
  Element: HTMLElement;
}

/**
 * Modifier that creates an auto-flowing equal-width grid layout driven by child content widths.
 *
 * Measures the natural (intrinsic) width of each child element, finds the widest one, and computes how many equal-width
 * columns fit in the container. All columns are `1fr` so they stretch equally.
 *
 * Uses ResizeObserver (container resizes) and MutationObserver (children added/removed) to stay in sync automatically.
 * No configuration is required for the column count — it adapts to both container width and child content.
 *
 * Designed for FieldSet but usable anywhere an auto-flowing equal-width grid is needed.
 *
 * Usage:
 *
 * ```hbs
 * <div {{auto-grid}}>
 *   <Field @label="Name">Alice</Field>
 *   <Field @label="Email">alice@example.com</Field>
 *   <Field @label="Role">Admin</Field>
 * </div>
 * ```
 *
 * With custom gap:
 *
 * ```hbs
 * <div {{auto-grid gap="1.5rem"}}>
 *   ...children...
 * </div>
 * ```
 */
export default modifier<AutoGridSignature>((element, _positional, { gap }) => {
  // Apply base grid styles
  element.style.display = 'grid';

  if (gap !== undefined) {
    element.style.gap = gap;
  } else {
    // Fall back to the section body gap CSS variable when no explicit gap is provided.
    // This keeps FieldSet spacing consistent with the surrounding section level.
    element.style.gap = 'var(--body-gap, 1rem)';
  }

  /**
   * Measure the maximum natural width of direct children by temporarily removing the grid constraint so each child can
   * size to its intrinsic width.
   */
  function measureMaxChildWidth(): number {
    const children = element.children;
    if (children.length === 0) return 0;

    // Temporarily switch to single-column to let children size naturally
    const previousColumns = element.style.gridTemplateColumns;
    element.style.gridTemplateColumns = 'max-content';

    let maxWidth = 0;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child instanceof HTMLElement) {
        maxWidth = Math.max(maxWidth, child.scrollWidth);
      }
    }

    // Restore the grid columns (will be recalculated below)
    element.style.gridTemplateColumns = previousColumns;

    return maxWidth;
  }

  function updateColumns(): void {
    const containerWidth = element.clientWidth;
    const maxChildWidth = measureMaxChildWidth();

    if (maxChildWidth === 0 || containerWidth === 0) {
      element.style.gridTemplateColumns = '1fr';
      return;
    }

    // Account for gap when computing how many columns fit.
    // Parse the computed gap to get the pixel value.
    const computedGap = parseFloat(getComputedStyle(element).columnGap) || 0;
    const columnCount = Math.max(
      1,
      Math.min(element.children.length, Math.floor((containerWidth + computedGap) / (maxChildWidth + computedGap))),
    );

    element.style.gridTemplateColumns = `repeat(${String(columnCount)}, 1fr)`;
  }

  // Initial layout
  updateColumns();

  // Re-layout when container resizes
  const resizeObserver = new ResizeObserver(() => {
    updateColumns();
  });
  resizeObserver.observe(element);

  // Re-layout when children are added or removed
  const mutationObserver = new MutationObserver(() => {
    updateColumns();
  });
  mutationObserver.observe(element, { childList: true });

  return (): void => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
});
