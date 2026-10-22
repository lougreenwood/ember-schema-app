import type { TOC } from '@ember/component/template-only';
import type { InfoPopoverPlacement } from '@ember-schema-app/ember-schema/components/ui/popovers/info-popover';

import InfoPopover from '@ember-schema-app/ember-schema/components/ui/popovers/info-popover';

export interface TooltipSignature {
  Args: {
    /**
     * Custom CSS classes to apply to the tooltip content.
     * Merged with default info-popover styles via twMerge.
     */
    class?: string | undefined;
    /**
     * Text to copy to clipboard when copy button is clicked.
     * Required when @enableCopy is true.
     */
    copyText?: string | undefined;
    /**
     * Enable copy-to-clipboard button inside the tooltip.
     * @default false
     */
    enableCopy?: boolean | undefined;
    /**
     * Placement of the tooltip relative to the trigger.
     * @default 'top-start'
     */
    placement?: InfoPopoverPlacement | undefined;
  };
  Blocks: {
    /**
     * The content to show inside the tooltip popup.
     */
    content: [];
    /**
     * The trigger element that activates the tooltip on hover.
     */
    default: [];
  };
  Element: HTMLSpanElement;
}

/**
 * Tooltip component for consistent hover tooltip styling.
 *
 * Provides a dark-themed tooltip that appears on hover with consistent
 * styling across the application. Built on InfoPopover, allowing users
 * to hover into the tooltip content to select/copy text.
 *
 * @example
 * ```hbs
 * <Tooltip>
 *   <:default>
 *     <span>Hover me</span>
 *   </:default>
 *   <:content>
 *     Tooltip content here
 *   </:content>
 * </Tooltip>
 * ```
 *
 * @example With copy enabled
 * ```hbs
 * <Tooltip @enableCopy={{true}} @copyText="specific text to copy">
 *   <:default>
 *     <span>Hover me</span>
 *   </:default>
 *   <:content>
 *     Displayed content (different from copied text)
 *   </:content>
 * </Tooltip>
 * ```
 *
 * @example With placement
 * ```hbs
 * <Tooltip @placement="bottom">
 *   <:default>
 *     <span>Hover me</span>
 *   </:default>
 *   <:content>
 *     Appears below
 *   </:content>
 * </Tooltip>
 * ```
 */
const Tooltip: TOC<TooltipSignature> = <template>
  <InfoPopover @placement={{@placement}} @enableCopy={{@enableCopy}} @copyText={{@copyText}} @class={{@class}}>
    <:trigger as |t|>
      <span {{t.anchor}} ...attributes>
        {{yield}}
      </span>
    </:trigger>

    <:content>
      {{yield to='content'}}
    </:content>
  </InfoPopover>
</template>;

export default Tooltip;
