import type {
  ButtonClasses,
  ExtendButtonSignature,
} from '@ember-schema-app/ember-schema/components/ui/buttons/button/types';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import Button from '@ember-schema-app/ember-schema/components/ui/buttons/button';
import { mergeClasses } from '@ember-schema-app/ember-schema/utils/merge-classes';

/**
 * ExpandButton component signature.
 */
export type ExpandButtonSignature = ExtendButtonSignature<{
  Args: {
    /**
     * Whether the associated content is currently expanded.
     */
    isExpanded?: boolean;
    /**
     * Callback invoked when the button is pressed.
     */
    onToggle?: () => void;
    /**
     * Omit icon and onPress - this component provides its own.
     */
    icon?: never;
    onPress?: never;
  };
  Blocks: {
    /**
     * No blocks - this is an icon-only button.
     */
    default?: never;
    afterLabel?: never;
  };
}>;

/**
 * Expand/collapse disclosure button component.
 *
 * A button with a chevron icon that indicates and toggles expanded/collapsed state.
 * The chevron points down when expanded, right when collapsed (via CSS rotation).
 *
 * Features:
 * - Chevron icon with smooth rotation animation via CSS
 * - `aria-expanded` attribute for accessibility (disclosure pattern)
 * - Inherits all Button styling capabilities (size, appearance, intent)
 * - Use `@label` arg if a text label is needed alongside the icon
 *
 * @example Basic expand button (icon only)
 * ```hbs
 * <Ui::Buttons::ExpandButton
 *   @isExpanded={{this.isOpen}}
 *   @onToggle={{this.toggle}}
 * />
 * ```
 *
 * @example With label
 * ```hbs
 * <Ui::Buttons::ExpandButton
 *   @isExpanded={{this.isOpen}}
 *   @onToggle={{this.toggle}}
 *   @label="Settings"
 * />
 * ```
 *
 * @example Custom appearance and size
 * ```hbs
 * <Ui::Buttons::ExpandButton
 *   @appearance="minimal"
 *   @size="sm"
 *   @isExpanded={{this.isOpen}}
 *   @onToggle={{this.toggle}}
 * />
 * ```
 */
export default class ExpandButton extends Component<ExpandButtonSignature> {
  get isExpanded(): boolean {
    return this.args.isExpanded ?? false;
  }

  /**
   * Merged classes with icon rotation based on expanded state.
   * Icon points down when expanded, rotates -90deg (points right) when collapsed.
   * When icon-only (no label), applies compact square padding.
   */
  get classes(): ButtonClasses {
    const rotationClass = this.isExpanded ? '' : '-rotate-90';
    const isIconOnly = !this.args.label;

    return mergeClasses(
      {
        // For icon-only buttons, override Frontile's padding with compact square padding
        base: isIconOnly ? 'p-1!' : undefined,
        icon: `transition-transform duration-200 ${rotationClass}`,
      },
      this.args.classes,
    );
  }

  handlePress = (): void => {
    this.args.onToggle?.();
  };

  <template>
    <Button
      @appearance={{@appearance}}
      @intent={{@intent}}
      @size={{@size}}
      @icon={{faChevronDown}}
      @label={{@label}}
      @classes={{this.classes}}
      @isRenderless={{@isRenderless}}
      @isInGroup={{@isInGroup}}
      @onPress={{this.handlePress}}
      aria-expanded='{{this.isExpanded}}'
      ...attributes
    />
  </template>
}
