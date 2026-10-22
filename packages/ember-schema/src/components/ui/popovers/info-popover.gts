import type { ModifierLike, WithBoundArgs } from '@glint/template';
import type {
  PanelAppearance,
  PanelIntent,
  PanelSize,
} from '@ember-schema-app/ember-schema/components/ui/panels/panel';
import type { AppPopoverSignature } from '@ember-schema-app/ember-schema/components/ui/popovers/popover';

import { action } from '@ember/object';
import { hash } from '@ember/helper';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import AppPopover from '@ember-schema-app/ember-schema/components/ui/popovers/popover';
import Button from '@ember-schema-app/ember-schema/components/ui/buttons/button';
import { mergeClassStrings } from '@ember-schema-app/ember-schema/utils/merge-classes';

/**
 * Info-layer content classes applied to the Panel via @class.
 * These are presentation concerns specific to informational popovers:
 * - outline-none: hover popovers don't need focus ring indication
 * - max-w-xs: sensible default max width (20rem/320px), overridable by consumer
 * - text-xs: compact text for info/tooltip content
 */
const INFO_CONTENT_CLASSES = 'outline-none max-w-xs text-xs';

type InfoPopoverPlacement = AppPopoverSignature['Args']['placement'];

interface InfoPopoverContentYield {
  /** Whether the popover is currently open */
  isOpen: boolean;
  /** Close the popover programmatically */
  close: () => void;
}

export interface InfoPopoverSignature {
  Args: {
    /** Structural treatment forwarded to Panel. @default 'default' */
    appearance?: PanelAppearance;
    /** Additional CSS classes for the content Panel (merged with info defaults) */
    class?: string;
    /**
     * Delay in ms before closing after mouse leaves (hover mode only).
     * @default 50
     */
    closeDelay?: number;
    /**
     * Text to copy to clipboard when copy button is clicked.
     * Required when @enableCopy is true.
     */
    copyText?: string;
    /**
     * Enable copy-to-clipboard button in the top-right corner of the content.
     * @default false
     */
    enableCopy?: boolean;
    /** Flip middleware options. @see https://floating-ui.com/docs/flip */
    flipOptions?: AppPopoverSignature['Args']['flipOptions'];
    /** Color/semantic meaning forwarded to Panel. @default 'default' */
    intent?: PanelIntent;
    /** Offset middleware options. @see https://floating-ui.com/docs/offset */
    offsetOptions?: AppPopoverSignature['Args']['offsetOptions'];
    /** Callback when the popover closes */
    onClose?: (() => void) | undefined;
    /** Callback when the popover opens */
    onOpen?: (() => void) | undefined;
    /**
     * Placement relative to trigger.
     * @default 'top-start'
     */
    placement?: InfoPopoverPlacement;
    /** Shift middleware options. @see https://floating-ui.com/docs/shift */
    shiftOptions?: AppPopoverSignature['Args']['shiftOptions'];
    /** Padding size forwarded to Panel. @default 'xs' */
    size?: PanelSize;
  };
  Blocks: {
    /**
     * Contextual component mode — yields anchor, triggerEvents modifier, Content, and controls.
     * Consumer has full control over trigger rendering.
     *
     * @example
     * ```hbs
     * <InfoPopover @placement="bottom" as |p|>
     *   <Button {{p.anchor}} {{p.triggerEvents "hover"}}>Trigger</Button>
     *   <p.Content>
     *     Interactive info content
     *   </p.Content>
     * </InfoPopover>
     * ```
     */
    default: [
      {
        /** Modifier from Frontile to anchor popover positioning */
        anchor: ModifierLike<{ Element: HTMLElement }>;
        /** Close the popover programmatically */
        close: () => void;
        /** Contextual Content component for rendering popover content */
        Content: WithBoundArgs<
          typeof InfoPopoverContentContextual,
          'classes' | 'copied' | 'enableCopy' | 'onCopy' | 'PopContent'
        >;
        /** Modifier for hover trigger events (mouseenter/mouseleave). */
        triggerEvents: AppPopoverSignature['Blocks']['default'][0]['triggerEvents'];
        /** Whether the popover is currently open */
        isOpen: boolean;
        /** Open the popover programmatically */
        open: () => void;
      },
    ];
    /**
     * Named blocks mode — the content to show inside the popover.
     * Receives close action and isOpen state.
     */
    content: [InfoPopoverContentYield];
    /**
     * Named blocks mode — the trigger element that activates the popover on hover.
     * InfoPopover wraps this in a span with hover events attached.
     */
    trigger: [
      {
        anchor: ModifierLike<{ Element: HTMLElement }>;
        close: () => void;
        isOpen: boolean;
        open: () => void;
      },
    ];
  };
  Element: HTMLDivElement;
}

interface InfoPopoverContentContextualSignature {
  Args: {
    /** @internal — Merged info + consumer classes */
    classes: string | undefined;
    /** @internal — Whether content was recently copied */
    copied: boolean;
    /** @internal — Whether to show the copy button */
    enableCopy: boolean;
    /** @internal — Copy action handler */
    onCopy: () => void;
    /** @internal — The underlying AppPopover Content component */
    PopContent: AppPopoverSignature['Blocks']['default'][0]['Content'];
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

/**
 * Internal Content wrapper for contextual component mode.
 * Adds info-layer styling and copy button to AppPopover's Content.
 */
class InfoPopoverContentContextual extends Component<InfoPopoverContentContextualSignature> {
  <template>
    <@PopContent @class={{@classes}} ...attributes>
      <div class='relative'>
        <div class={{if @enableCopy 'pr-8'}}>
          {{yield}}
        </div>
        {{#if @enableCopy}}
          <Button
            @appearance='surface'
            @intent='default'
            @size='2xs'
            @icon={{if @copied faCheck faCopy}}
            @onPress={{@onCopy}}
            @classes={{hash base='absolute top-0 right-0'}}
            class={{if @copied 'text-success'}}
            title='Copy to clipboard'
          />
        {{/if}}
      </div>
    </@PopContent>
  </template>
}

/**
 * Informational popover for passive, presentational content.
 *
 * Named for its purpose — displaying supplementary information — not its trigger
 * method. Defaults to hover triggering with delayed close, but the trigger mode
 * is inherited from AppPopover and can be overridden.
 *
 * Extends AppPopover with:
 * - Default hover trigger with delayed close (prevents flicker)
 * - Built-in copy-to-clipboard capability
 * - Two usage modes: named blocks and contextual component API
 * - Info-specific content styling (compact text, max-width, no focus ring)
 *
 * Supports two usage modes:
 *
 * 1. **Named blocks mode** — Simple, wrapped trigger with automatic hover handling
 * 2. **Contextual component mode** — Full control, apply modifiers directly
 *
 * @example Named blocks mode
 * ```hbs
 * <InfoPopover @enableCopy={{true}} @copyText="some text">
 *   <:trigger as |t|>
 *     <span {{t.anchor}}>Hover me</span>
 *   </:trigger>
 *   <:content>
 *     Copyable content here
 *   </:content>
 * </InfoPopover>
 * ```
 *
 * @example Contextual component mode
 * ```hbs
 * <InfoPopover @placement="bottom" as |p|>
 *   <Button {{p.anchor}} {{p.triggerEvents "hover"}}>Trigger</Button>
 *   <p.Content @class="p-4">
 *     Interactive info content
 *   </p.Content>
 * </InfoPopover>
 * ```
 */
export default class InfoPopover extends Component<InfoPopoverSignature> {
  @tracked copied = false;

  #copiedTimeout: number | undefined;

  // ---- Resolved args ----

  private get resolvedSize(): PanelSize {
    return this.args.size ?? 'xs';
  }

  private get contentClasses(): string | undefined {
    return mergeClassStrings([INFO_CONTENT_CLASSES], this.args.class);
  }

  // ---- Copy handling ----

  @action
  async copyToClipboard(): Promise<void> {
    const textToCopy = this.args.copyText;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.copied = true;

      if (this.#copiedTimeout) {
        clearTimeout(this.#copiedTimeout);
      }

      this.#copiedTimeout = window.setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch {
      // Silent fail — clipboard may not be available
    }
  }

  // ---- Open/close callbacks ----

  handleOpenChange = (isOpen: boolean): void => {
    if (isOpen) {
      this.args.onOpen?.();
    } else {
      this.args.onClose?.();
    }
  };

  // ---- Template ----

  <template>
    <AppPopover
      @triggerMode='hover'
      @appearance={{@appearance}}
      @intent={{@intent}}
      @size={{this.resolvedSize}}
      @closeDelay={{@closeDelay}}
      @placement={{@placement}}
      @flipOptions={{@flipOptions}}
      @shiftOptions={{@shiftOptions}}
      @offsetOptions={{@offsetOptions}}
      @onOpenChange={{this.handleOpenChange}}
      as |pop|
    >
      {{#if (has-block 'trigger')}}
        {{! Named blocks mode: wrap trigger in a span with hover events.
            pop.triggerEvents wires into AppPopover's delayed-close state management. }}
        <span class='contents' {{pop.triggerEvents 'hover'}}>
          {{yield (hash anchor=pop.anchor close=pop.close isOpen=pop.isOpen open=pop.open) to='trigger'}}
        </span>

        <pop.Content @class={{this.contentClasses}}>
          <div class='relative'>
            <div class={{if @enableCopy 'pr-8'}}>
              {{yield (hash isOpen=pop.isOpen close=pop.close) to='content'}}
            </div>
            {{#if @enableCopy}}
              <Button
                @appearance='surface'
                @intent='default'
                @size='2xs'
                @icon={{if this.copied faCheck faCopy}}
                @onPress={{this.copyToClipboard}}
                @classes={{hash base='absolute top-0 right-0'}}
                class={{if this.copied 'text-success'}}
                title='Copy to clipboard'
              />
            {{/if}}
          </div>
        </pop.Content>
      {{else}}
        {{! Contextual component mode: yield controls and Content }}
        {{yield
          (hash
            anchor=pop.anchor
            close=pop.close
            Content=(component
              InfoPopoverContentContextual
              PopContent=pop.Content
              classes=this.contentClasses
              enableCopy=(if @enableCopy true false)
              copied=this.copied
              onCopy=this.copyToClipboard
            )
            triggerEvents=pop.triggerEvents
            isOpen=pop.isOpen
            open=pop.open
          )
        }}
      {{/if}}
    </AppPopover>
  </template>
}

export { type InfoPopoverContentYield, type InfoPopoverPlacement };
