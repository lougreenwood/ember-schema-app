import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type { FieldSetSignature } from '@ember-schema-app/ember-schema/components/ui/field-set/types';
import type { SectionLevel } from '@ember-schema-app/ember-schema/components/ui/section/default-section/consts';

// ---- Shared sub-types -------------------------------------------------------

/**
 * The common signature shared by all Section renderer implementations.
 *
 * Every renderer (DefaultSection, CollapsibleSectionRenderer) extends this interface, adding only the fields specific
 * to their type variant.
 */
export interface BaseSectionRendererSignature {
  Args: {
    appearance?: 'default' | 'subtle';
    classes?: SectionClasses;
    fillHeight?: boolean;
    hasDivider?: boolean;
    headerDisplayLevel?: SectionLevel;
    layout?: SectionLayout;
    sectionLevel?: SectionLevel;
    subTitle?: string;
    title?: string;
    titleIcon?: IconDefinition;
  };
  Blocks: {
    default: [RendererContextualParams];
  };
  Element: HTMLElement;
}

export interface CollapsibleSectionContextualParams extends SectionContextualParamsBase {
  type: 'collapsible';
}

/**
 * Args specific to the collapsible Section type.
 */
export interface CollapsibleSectionTypeArgs {
  /**
   * Initial open state when uncontrolled. Defaults to true (open).
   */
  defaultOpen?: boolean;
  /**
   * When false, the body spans full width (no col-start-2 indent). Defaults to true. Set to false when rendering inside
   * a Panel where the chevron indent is unwanted.
   */
  indentBody?: boolean;
  /**
   * Controls whether the section is expanded. When provided, the component is in "controlled" mode.
   */
  isOpen?: boolean;
  type: 'collapsible';
  /**
   * Callback fired when the section is toggled.
   */
  onToggle?: (isOpen: boolean) => void;
}

export interface DefaultSectionContextualParams extends SectionContextualParamsBase {
  type: 'default';
}

/**
 * Args specific to the default Section type.
 */
export interface DefaultSectionTypeArgs {
  type?: 'default';
  /**
   * When true, the section takes full parent height and the body becomes the scrollable area. Used by PageSection.
   */
  sticky?: boolean;
}

// ---- Factory type system ----------------------------------------------------

/**
 * @deprecated Use SectionContextualParams instead.
 */
export type ExtendSectionSignature<_TExtension> = SectionFactorySignature;

/**
 * The contextual params that renderers yield internally. The factory assembles the public-facing
 * SectionContextualParams from this by adding `Section` and `type`.
 *
 * @internal
 */
export interface RendererContextualParams {
  Body: ComponentLike<SectionBodySignature>;
  Header: WithBoundArgs<
    ComponentLike<SectionHeaderSignature>,
    | 'aboveTitleGap'
    | 'appearance'
    | 'classes'
    | 'fontSize'
    | 'headingTag'
    | 'iconSize'
    | 'subTitle'
    | 'subTitleFontSize'
    | 'subTitleFontWeight'
    | 'title'
    | 'titleFontWeight'
    | 'titleGroupGap'
    | 'titleIcon'
  >;
  headerDisplayLevel: SectionLevel;
  nextHeaderDisplayLevel: SectionLevel;
  nextSectionLevel: SectionLevel;
  sectionLevel: SectionLevel;
}

/**
 * Base args shared by all Section type variants.
 */
export interface SectionBaseArgs {
  appearance?: 'default' | 'subtle';
  classes?: SectionClasses;
  fillHeight?: boolean;
  hasDivider?: boolean;
  headerDisplayLevel?: SectionLevel;
  layout?: SectionLayout;
  /**
   * Parent section context yielded by a parent Section factory (via `r.nextSectionLevel` / `r.nextHeaderDisplayLevel`).
   * When provided, the Section resolves its effective levels from the parent context rather than from `@sectionLevel` /
   * `@headerDisplayLevel`. This arg uses a separate name so it cannot be accidentally clobbered when a caller passes
   * `@sectionLevel={{undefined}}`.
   */
  parentSection?: SectionParentableContext;
  sectionLevel?: SectionLevel;
  subTitle?: string;
  title?: string;
  titleIcon?: IconDefinition;
}

/**
 * The context object that a Section factory yields to allow nested Sections to inherit their effective level without
 * being clobbered by invocation args.
 *
 * The parent Section passes its own `sectionLevel` and `headerDisplayLevel` (i.e. "this is me"). The consuming child
 * Section factory increments these to compute its own effective levels. This keeps the increment logic in one place
 * (the factory) and lets the parent stay self-describing.
 *
 * Passed via `@parentSection` on a `<Section>` invocation.
 */
export interface SectionParentContext {
  headerDisplayLevel: SectionLevel;
  sectionLevel: SectionLevel;
}

/**
 * Any yielded section context object that can serve as a valid parent for nested sections.
 *
 * Panels and wrappers often receive the richer yielded `body` / `s` context object, but nested `Section` only needs the
 * two level fields in order to derive child levels correctly.
 */
export type SectionParentableContext = SectionBodyContextualParams | SectionContextualParams | SectionParentContext;

/**
 * The contextual params yielded within the body context — by the `<:body>` named block (Mode 2) and by the `Body`
 * contextual component (Mode 3).
 *
 * Contains only body-appropriate components: FieldSet, child Section, and level metadata. Does NOT include Header or
 * Body — those are structural concerns handled by the Section itself.
 */
export interface SectionBodyContextualParams {
  FieldSet: WithBoundArgs<ComponentLike<FieldSetSignature>, 'section'>;
  headerDisplayLevel: SectionLevel;
  nextHeaderDisplayLevel: SectionLevel;
  nextSectionLevel: SectionLevel;
  Section: ComponentLike<SectionFactorySignature>;
  sectionLevel: SectionLevel;
}

export interface SectionBodyClasses {
  base?: string;
}

export interface SectionBodySignature {
  Args: {
    /**
     * Classes applied directly to the body wrapper element. Bound by the renderer so body styling always follows the
     * resolved Section classes.
     */
    class?: string;
    /**
     * Classes for the body wrapper
     */
    classes?: SectionBodyClasses;
    /**
     * Whether to show dividers between child elements. Uses level-relative spacing from the parent Section via
     * `--body-gap` CSS variable.
     */
    hasDividers?: boolean;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

/**
 * Classes hash for styling internal Section elements.
 *
 * Supports Frontile-style nested class overrides with Tailwind Merge. Use this to customize Section's layout (e.g.,
 * convert to grid for CollapsibleSection).
 */
export interface SectionClasses {
  /**
   * Classes for the outer <section> element. Default: 'flex flex-col {rowGapSize}'
   */
  base?: string;
  /**
   * Classes for the body wrapper div
   */
  body?: string;
  /**
   * Nested classes for header elements
   */
  header?: SectionHeaderClasses;
}

// ---- Base renderer signature ------------------------------------------------

/**
 * The contextual params yielded by the Section factory to consumers.
 *
 * Yielded as `s` in `<Section as |s|>`. Discriminate on `s.type` to access type-specific fields when needed.
 */
export type SectionContextualParams = CollapsibleSectionContextualParams | DefaultSectionContextualParams;

// ---- Renderer internal contract ---------------------------------------------

export interface SectionFactorySignature {
  Args: SectionTypeArgs;
  Blocks: {
    body: [SectionBodyContextualParams];
    default: [SectionContextualParams];
  };
  Element: HTMLElement;
}

// ---- Public factory contextual params ---------------------------------------

/**
 * Classes hash for styling SectionHeader elements.
 */
export interface SectionHeaderClasses {
  /**
   * Classes for the afterTitle wrapper
   */
  afterTitle?: string;
  /**
   * Classes for the header container. Default: 'flex flex-col gap-3'
   */
  base?: string;
  /**
   * Classes for the beforeTitle wrapper
   */
  beforeTitle?: string;
  /**
   * Classes for the subTitle row
   */
  subTitle?: string;
  /**
   * Classes for the title heading element
   */
  title?: string;
  /**
   * Classes for the title + subtitle group (contains titleRow + subTitle). Default: 'flex flex-col gap-1'
   */
  titleGroup?: string;
  /**
   * Classes for the title row (contains beforeTitle, icon, title, afterTitle)
   */
  titleRow?: string;
}

export interface SectionHeaderSignature {
  Args: {
    aboveTitleGap: string;
    appearance?: 'default' | 'subtle';
    /**
     * Classes for header elements
     */
    classes?: SectionHeaderClasses;
    fontSize: string;
    headingTag: string;
    iconSize: string;
    subTitle?: string;
    subTitleFontSize: string;
    subTitleFontWeight: string;
    title?: string;
    titleFontWeight: string;
    titleGroupGap: string;
    titleIcon?: IconDefinition;
  };
  Blocks: {
    aboveTitle: [];
    afterTitle: [];
    beforeTitle: [];
    default: [];
    subTitle: [];
  };
  Element: HTMLElement;
}

/**
 * Layout mode for Section component.
 *
 * - 'default': Standard spacing between header and body based on section level
 * - 'compact': No gap between header and body, useful with @hasDivider for tight layouts
 */
export type SectionLayout = 'compact' | 'default';

/**
 * @deprecated Use SectionFactorySignature instead.
 */
export type SectionSignature = SectionFactorySignature;

/**
 * @deprecated Use SectionFactorySignature instead.
 */
export type SectionSignatureLike = SectionFactorySignature;

export type SectionType = 'collapsible' | 'default';

// ---- Factory signature ------------------------------------------------------

/**
 * The discriminated union of all Section type arg shapes.
 */
export type SectionTypeArgs =
  (CollapsibleSectionTypeArgs & SectionBaseArgs) | (DefaultSectionTypeArgs & SectionBaseArgs);

// ---- Legacy aliases (deprecated, for incremental consumer migration) ---------

/**
 * Signature for the Body wrapper yielded by the Section factory (Mode 3).
 *
 * Wraps the renderer's SectionBody and yields body-appropriate contextual params (FieldSet, child Section, level
 * metadata). Defined separately from SectionBodySignature because the renderer's Body is a plain div wrapper that knows
 * nothing about factory-level concerns.
 *
 * @internal
 */
export interface SectionBodyWithParamsSignature {
  Args: {
    hasDividers?: boolean;
  };
  Blocks: {
    default: [SectionBodyContextualParams];
  };
  Element: HTMLDivElement;
}

interface SectionContextualParamsBase {
  Body: ComponentLike<SectionBodyWithParamsSignature>;
  Header: RendererContextualParams['Header'];
  headerDisplayLevel: SectionLevel;
  nextHeaderDisplayLevel: SectionLevel;
  nextSectionLevel: SectionLevel;
  Section: ComponentLike<SectionFactorySignature>;
  sectionLevel: SectionLevel;
}
