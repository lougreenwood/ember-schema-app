import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type { FieldSetFieldSignature } from '@ember-schema-app/ember-schema/components/ui/field/types';
import type {
  SectionClasses,
  SectionFactorySignature,
} from '@ember-schema-app/ember-schema/components/ui/section/types';
import type { WarpDriveRecord } from '@ember-schema-app/ember-schema/components/ui/field-display/types';

/**
 * Contextual params yielded by FieldSet to its block consumers.
 *
 * ```hbs
 * <FieldSet @title="Market Info" as |fs|>
 *   <fs.Field @label="Domain">Blockchain</fs.Field>
 * </FieldSet>
 * ```
 */
export interface FieldSetContextualParams {
  /**
   * Field component pre-wired with the section level inherited from this FieldSet. Renders a compact label-value pair
   * at the correct heading level. Supports both descriptor mode (`@fieldDescriptor` + `@model`) and manual mode
   * (`@label` + block content).
   */
  Field: WithBoundArgs<ComponentLike<FieldSetFieldSignature>, 'classes' | 'section'>;
}

/**
 * Layout mode for FieldSet body content.
 *
 * - `'auto-grid'`: Auto-flowing equal-width columns driven by the widest child's intrinsic width. Uses the `auto-grid`
 *   modifier (ResizeObserver + MutationObserver) to compute column count. This is the default for detail/display
 *   contexts.
 * - `'stack'`: Single-column vertical layout. Intended for forms where inputs are stacked.
 */
export type FieldSetLayout = 'auto-grid' | 'stack';

export interface FieldSetSignature {
  Args: {
    /**
     * Visual appearance passed through to the underlying Section.
     */
    appearance?: 'default' | 'subtle';
    /**
     * Classes hash for styling internal Section elements. Mirrors `SectionClasses` on Section.
     */
    classes?: SectionClasses;
    /**
     * Classes hash pre-wired into every `fs.Field` yielded by this FieldSet.
     */
    fieldClasses?: SectionClasses;
    /**
     * A resolved WarpDrive record. When present, FieldSet auto-discovers displayable scalar fields from the schema and
     * renders them before yielding for manual additions.
     */
    fieldset?: WarpDriveRecord;
    /**
     * Layout mode for the FieldSet body.
     *
     * - `'auto-grid'` (default): Auto-flowing equal-width columns driven by child content widths.
     * - `'stack'`: Single-column vertical layout for forms.
     */
    layout?: FieldSetLayout;
    /**
     * A pre-wired Section component (from the parent Section's contextual params). When provided, FieldSet renders
     * using this Section to inherit the correct heading level. When omitted, FieldSet uses the root `<Section>`
     * component directly.
     */
    section?: ComponentLike<SectionFactorySignature>;
    /**
     * Optional subtitle displayed below the title in the FieldSet header.
     */
    subTitle?: string;
    /**
     * Optional title for the FieldSet. When omitted, the FieldSet renders without a header.
     */
    title?: string;
  };
  Blocks: {
    default: [FieldSetContextualParams];
  };
  Element: HTMLElement;
}
