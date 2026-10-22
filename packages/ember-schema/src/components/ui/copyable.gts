import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type { PressEvent } from '@frontile/utilities';
import type {
  ButtonAppearance,
  ButtonIntent,
  ButtonSize,
} from '@ember-schema-app/ember-schema/components/ui/buttons/button/types';

import { action } from '@ember/object';
import { hash } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Button from '@ember-schema-app/ember-schema/components/ui/buttons/button';
import { or } from 'ember-truth-helpers';

interface CopyButtonSignature {
  Args: {
    /**
     * Whether the content was recently copied (shows check icon).
     * @internal - Provided by Copyable
     */
    copied: boolean;
    /**
     * Handler to trigger copy action.
     * @internal - Provided by Copyable
     */
    onCopy: () => void;

    appearance?: ButtonAppearance;
    intent?: ButtonIntent;
    /**
     * Optional label text for the button.
     * When provided, renders as icon + label button instead of icon-only.
     */
    label?: string;
    size?: ButtonSize;
  };
  Element: HTMLButtonElement;
}

/**
 * Internal CopyButton component yielded by Copyable.
 * Displays a copy icon that changes to a check mark on success.
 * PressEvent stops propagation by default, preventing parent click handlers from firing.
 */
class CopyButton extends Component<CopyButtonSignature> {
  @action
  handlePress(_event: PressEvent): void {
    // PressEvent stops propagation by default (no need to call stopPropagation)
    this.args.onCopy();
  }

  /**
   * Apply success color only for minimal/subtle appearance buttons (inline copy icons).
   * Styled buttons (default, surface, etc.) already have their own visual language;
   * the icon change alone provides sufficient feedback.
   */
  private get copiedClass(): string {
    const appearance = this.args.appearance;
    const isStyledAppearance = appearance !== undefined && appearance !== 'minimal';
    return this.args.copied && !isStyledAppearance ? 'text-success' : '';
  }

  <template>
    <Button
      @appearance={{or @appearance 'minimal'}}
      @intent={{or @intent 'subtle'}}
      @size={{or @size '2xs'}}
      @icon={{if @copied faCheck faCopy}}
      @label={{@label}}
      @onPress={{this.handlePress}}
      class={{this.copiedClass}}
      title='Copy to clipboard'
      ...attributes
    />
  </template>
}

interface CopyableSignature {
  Args: {
    /**
     * The text to copy to clipboard.
     */
    text: string;
  };
  Blocks: {
    /**
     * When used with block params, yields the CopyButton component for manual placement.
     * When used without block params, renders content with copy button after it.
     */
    default: [
      {
        /** Whether the text was recently copied to clipboard */
        copied: boolean;
        /** The CopyButton component for manual placement */
        CopyButton: WithBoundArgs<ComponentLike<CopyButtonSignature>, 'copied' | 'onCopy'>;
      },
    ];
  };
  Element: HTMLSpanElement;
}

/**
 * Copyable component - A primitive for making content copyable with a button.
 *
 * Supports two usage modes:
 *
 * 1. **Without block params** - Renders content with copy button automatically placed after it
 * 2. **With block params** - Yields `CopyButton` component for manual placement
 *
 * @example Without block params (automatic button placement)
 * ```hbs
 * <Copyable @text="TEXT_TO_COPY">
 *   Some visible content
 * </Copyable>
 * ```
 *
 * @example With block params (manual button placement)
 * ```hbs
 * <Copyable @text="TEXT_TO_COPY" as |c|>
 *   <div class="flex items-center gap-2">
 *     <span>Some content</span>
 *     <c.CopyButton />
 *   </div>
 * </Copyable>
 * ```
 *
 * @example Access copied state
 * ```hbs
 * <Copyable @text="TEXT_TO_COPY" as |c|>
 *   <span class={{if c.copied "text-success"}}>Content</span>
 *   <c.CopyButton />
 * </Copyable>
 * ```
 */
export default class Copyable extends Component<CopyableSignature> {
  @tracked copied = false;

  #copiedTimeout: number | undefined;

  @action
  async copyToClipboard(): Promise<void> {
    const textToCopy = this.args.text;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.copied = true;

      // Clear any existing timeout
      if (this.#copiedTimeout) {
        clearTimeout(this.#copiedTimeout);
      }

      // Reset copied state after 2 seconds
      this.#copiedTimeout = window.setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch {
      // Silent fail - clipboard may not be available
    }
  }

  <template>
    {{#if (has-block-params)}}
      <span ...attributes>
        {{yield
          (hash copied=this.copied CopyButton=(component CopyButton copied=this.copied onCopy=this.copyToClipboard))
        }}
      </span>
    {{else}}
      <span class='inline-flex items-center gap-1' ...attributes>
        {{yield
          (hash copied=this.copied CopyButton=(component CopyButton copied=this.copied onCopy=this.copyToClipboard))
        }}
        <CopyButton @copied={{this.copied}} @onCopy={{this.copyToClipboard}} />
      </span>
    {{/if}}
  </template>
}

export { CopyButton, type CopyableSignature, type CopyButtonSignature };
