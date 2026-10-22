import type { Middleware } from '@floating-ui/dom';
import type { ModifierLike, WithBoundArgs } from '@glint/template';
import type {
  PanelAppearance,
  PanelIntent,
  PanelSize,
} from '@ember-schema-app/ember-schema/components/ui/panels/panel';
import type { PopoverSignature as FrontilePopoverSignature } from 'frontile';

import { hash } from '@ember/helper';
import { scheduleOnce } from '@ember/runloop';
import { size } from '@floating-ui/dom';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Panel from '@ember-schema-app/ember-schema/components/ui/panels/panel';
import { mergeClassStrings } from '@ember-schema-app/ember-schema/utils/merge-classes';
import { modifier } from 'ember-modifier';
import { Popover as FrontilePopover } from 'frontile';

import {
  FloatingHoverTree,
  FloatingHoverNode,
} from '@ember-schema-app/ember-schema/components/ui/floating-hover-tree/tree';
import FloatingSurface from '@ember-schema-app/ember-schema/components/ui/floating-surface/floating-surface';

const hoverTree = new FloatingHoverTree();

/**
 * Classes applied to Frontile's overlay div to neutralize its visual styling.
 * Frontile's popover theme applies: bg-surface-solid-1 rounded-sm border border-neutral-subtle w-64
 * Frontile's overlay base adds: will-change-transform overflow-auto (baked in, cannot be overridden).
 * We neutralize only the visual properties. Overflow is handled via the applyMaxHeight modifier on Panel.
 */
const FRONTILE_NEUTRALIZE_CLASSES = 'bg-transparent border-none rounded-none p-0 w-auto';

/**
 * Floating UI size middleware. Stores availableHeight on the floating element as a CSS custom
 * property (--popover-available-height) instead of setting maxHeight directly. This lets Panel
 * read the constraint via the applyMaxHeight modifier and be the actual scroll container,
 * keeping its border and rounded corners always fully visible.
 */
const SIZE_MIDDLEWARE: Middleware[] = [
  size({
    apply({ availableHeight, elements }) {
      elements.floating.style.setProperty('--popover-available-height', `${availableHeight - 16}px`);
    },
  }),
];

/**
 * Default shift options for smart positioning.
 * Adds padding from viewport edges so popover doesn't touch screen edges.
 * crossAxis: false prevents horizontal shifting which would break start/end alignment.
 */
const DEFAULT_SHIFT_OPTIONS: FrontilePopoverSignature['Args']['shiftOptions'] = {
  crossAxis: false,
  padding: 15,
};

/**
 * Default flip options for smart repositioning.
 * Maintains start alignment when flipping (e.g., top-start -> bottom-start, not bottom).
 */
const DEFAULT_FLIP_OPTIONS: FrontilePopoverSignature['Args']['flipOptions'] = {
  fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'],
};

type PopoverTriggerEventsProfile = 'hover';

type PopoverTriggerEventsModifier = ModifierLike<{
  Args: {
    Positional: [PopoverTriggerEventsProfile?];
  };
  Element: HTMLElement;
}>;

type FrontilePopoverBlockParams = FrontilePopoverSignature['Blocks']['default'][0];

export interface AppPopoverSignature {
  Args: {
    /** Structural treatment forwarded to Panel. @default 'default' */
    appearance?: PanelAppearance;
    /** When false, enables focus trap within the popover content. @default undefined (Frontile defaults true = focus trap disabled) */
    disableFocusTrap?: boolean;
    /**
     * Delay in ms before closing after mouse leaves (hover mode only).
     * Gives users time to move from trigger to content.
     * @default 50
     */
    closeDelay?: number;
    /** Debug/inspection mode: force the popover to remain open. */
    debugPinOpen?: boolean;
    /** Callback when the popover finishes closing */
    didClose?: FrontilePopoverSignature['Args']['didClose'];
    /** Flip middleware options. @see https://floating-ui.com/docs/flip */
    flipOptions?: FrontilePopoverSignature['Args']['flipOptions'];
    /** Color/semantic meaning forwarded to Panel. @default 'default' */
    intent?: PanelIntent;
    /** Controlled mode: whether the popover is open */
    isOpen?: boolean;
    /** Offset middleware options. @see https://floating-ui.com/docs/offset */
    offsetOptions?: FrontilePopoverSignature['Args']['offsetOptions'];
    /** Placement relative to trigger. Defaults to 'top-start' (hover) or 'bottom-start' (click). */
    placement?: PopoverPlacement;
    /** When true, suppresses the overlay div's auto-focus on open (e.g. for menus where keyboard nav should land on a child element). */
    preventAutoFocus?: boolean;
    /** Shift middleware options. @see https://floating-ui.com/docs/shift */
    shiftOptions?: FrontilePopoverSignature['Args']['shiftOptions'];
    /** Padding size forwarded to Panel. @default 'md' */
    size?: PanelSize;
    /** How the popover is triggered. @default 'click' */
    triggerMode?: PopoverTriggerMode;
    /** Interaction mode. 'internal' (default): full Frontile Popover with trigger/keyboard. 'external': FloatingSurface with positioning only — consumer owns all interaction. */
    interactionMode?: 'internal' | 'external';
    /** Controlled mode: callback when open state changes */
    onOpenChange?: (isOpen: boolean) => void;
  };
  Blocks: {
    default: [
      {
        /** Modifier to anchor popover positioning to the trigger element */
        anchor: FrontilePopoverBlockParams['anchor'];
        /** Content component — renders inside a Panel with shadow; inner wrapper scrolls */
        Content: WithBoundArgs<
          typeof AppPopoverContent,
          | 'FrontileContent'
          | 'hoverContentModifier'
          | 'panelAppearance'
          | 'panelIntent'
          | 'panelSize'
          | 'preventAutoFocus'
        >;
        /**
         * Modifier for trigger hover events (mouseenter/mouseleave).
         * Apply to the trigger element in hover mode. No-op in click mode.
         * Absent in external interaction mode — the consumer owns all interaction.
         */
        triggerEvents?: PopoverTriggerEventsModifier;
        /** Whether the popover is currently open */
        isOpen: boolean;
        /** Modifier for click-toggle behavior from Frontile.
         *  Absent in external interaction mode — the consumer owns all interaction. */
        trigger?: FrontilePopoverBlockParams['trigger'];
        /** Close the popover */
        close: () => void;
        /** Open the popover */
        open: () => void;
      },
    ];
  };
  Element: HTMLDivElement;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopoverTriggerMode = 'click' | 'hover';

// ---------------------------------------------------------------------------
// Internal: AppPopoverContent
// ---------------------------------------------------------------------------

interface AppPopoverContentSignature {
  Args: {
    /** Additional CSS classes merged onto the inner scroll wrapper (merged over size-derived padding) */
    class?: string;
    /** @internal — Frontile's pre-bound Content component, bound by AppPopover */
    FrontileContent: FrontilePopoverBlockParams['Content'];
    /** @internal — Modifier for hover content mouse events, bound by AppPopover */
    hoverContentModifier: ModifierLike<{ Element: HTMLElement }>;
    /** @internal — Forwarded to Panel */
    panelAppearance: PanelAppearance;
    /** @internal — Forwarded to Panel */
    panelIntent: PanelIntent;
    /** @internal — Forwarded to Panel */
    panelSize: PanelSize;
    /** @internal — When true, suppresses the overlay div's auto-focus on open. Forwarded from AppPopover. */
    preventAutoFocus?: boolean;
    /** @internal — When false, enables focus trap within the popover content. */
    disableFocusTrap?: boolean;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

type PopoverPlacement =
  | 'bottom'
  | 'bottom-end'
  | 'bottom-start'
  | 'left'
  | 'left-end'
  | 'left-start'
  | 'right'
  | 'right-end'
  | 'right-start'
  | 'top'
  | 'top-end'
  | 'top-start';

// ---------------------------------------------------------------------------
// AppPopover
// ---------------------------------------------------------------------------

/**
 * Internal Content wrapper that neutralizes Frontile's styling and renders
 * a Panel as the visual container. Not exported — consumers interact with it
 * via the yielded `pop.Content` from AppPopover.
 */
class AppPopoverContent extends Component<AppPopoverContentSignature> {
  /**
   * Reads --popover-available-height from the parent (overlay div) and applies it as
   * max-height + overflow-y:auto directly on Panel's element. This makes Panel the scroll
   * container so its border and rounded corners stay fully visible at all times.
   *
   * Uses a MutationObserver on the parent's style attribute so that when Floating UI's
   * autoUpdate re-runs computePosition on viewport resize and updates the custom property,
   * we re-apply the constraint to Panel immediately.
   *
   * Scoping: --popover-available-height is set as an inline style on each overlay div
   * individually, so multiple popovers and nested popovers are fully isolated.
   */
  applyMaxHeight = modifier((element: HTMLElement) => {
    const parent = element.parentElement;
    if (!parent) return;

    const apply = (): void => {
      const available = getComputedStyle(parent).getPropertyValue('--popover-available-height').trim();
      if (available) {
        element.style.maxHeight = available;
        element.style.overflowY = 'auto';
      }
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(parent, { attributeFilter: ['style'], attributes: true });

    return () => observer.disconnect();
  });

  get panelClasses(): string {
    return mergeClassStrings(['shadow-lg'], this.args.class);
  }

  <template>
    <@FrontileContent
      @class={{FRONTILE_NEUTRALIZE_CLASSES}}
      @disableFocusTrap={{@disableFocusTrap}}
      @preventAutoFocus={{@preventAutoFocus}}
      {{@hoverContentModifier}}
    >
      <Panel
        @appearance={{@panelAppearance}}
        @intent={{@panelIntent}}
        @size={{@panelSize}}
        @class={{this.panelClasses}}
        {{this.applyMaxHeight}}
        ...attributes
      >
        {{yield}}
      </Panel>
    </@FrontileContent>
  </template>
}

/**
 * Base popover primitive that wraps Frontile's Popover with consistent Panel-based
 * visual treatment. All internal popover components (InfoPopover, Tooltip,
 * DropdownMenu, ConfirmablePopover) should build on top of this.
 *
 * Supports two trigger modes:
 * - `click` (default): Standard click-to-toggle via Frontile's built-in trigger modifier
 * - `hover`: Mouse-driven open/close with delayed close to prevent flicker
 *
 * @example Click mode (default)
 * ```hbs
 * <AppPopover @placement="bottom-start" @intent="subtle" as |pop|>
 *   <Button {{pop.trigger}} {{pop.anchor}}>Open menu</Button>
 *   <pop.Content>Menu content here</pop.Content>
 * </AppPopover>
 * ```
 *
 * @example Hover mode
 * ```hbs
 * <AppPopover @triggerMode="hover" @size="xs" as |pop|>
 *   <span {{pop.anchor}} {{pop.triggerEvents "hover"}}>Hover me</span>
 *   <pop.Content>Tooltip content</pop.Content>
 * </AppPopover>
 * ```
 */
export default class AppPopover extends Component<AppPopoverSignature> {
  readonly hoverPopoverId = crypto.randomUUID();

  private _hoverNode: FloatingHoverNode | undefined;

  private get hoverNode(): FloatingHoverNode {
    if (this._hoverNode === undefined) {
      this._hoverNode = hoverTree.registerNode({ nodeId: this.hoverPopoverId });
    }
    return this._hoverNode;
  }

  private handleContentMouseEnter = (_event: MouseEvent): void => {
    console.debug('[debug:popover-content] enter', {
      id: this.hoverPopoverId,
      pointerOver: this.hoverNode.isPointerOverTrigger,
    });
    this.hoverNode.setPointerOverContent({ isOver: true });
  };
  private handleContentMouseLeave = (_event: MouseEvent): void => {
    console.debug('[debug:popover-content] leave', { id: this.hoverPopoverId });
    this.hoverNode.setPointerOverContent({ isOver: false });
  };
  /**
   * Modifier for content hover events (mouseenter/mouseleave).
   * Applied to Frontile's overlay div via AppPopoverContent.
   * Only active in hover mode; no-op in click mode.
   */
  hoverContentModifier = modifier((element: HTMLElement) => {
    const node = this.hoverNode;
    node.setContentOverlay({ element });

    if (this.isControlled) return;

    if (!this.isHoverMode) return;
    node.onCloseTimer(() => {
      console.debug('[debug:popover-closeTimer]', { id: this.hoverPopoverId, shouldStayOpen: node.shouldStayOpen });
      if (!node.shouldStayOpen) {
        this.setOpenState({ isOpen: false });
      }
    });

    const onEnter = this.handleContentMouseEnter;
    const onLeave = this.handleContentMouseLeave;

    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);

    return () => {
      hoverTree.unregisterNode({ nodeId: this.hoverPopoverId });
      element.removeEventListener('mouseenter', onEnter);
      element.removeEventListener('mouseleave', onLeave);
    };
  });

  private handleTriggerMouseEnter = (_event: MouseEvent): void => {
    console.debug('[debug:popover-trigger] enter', { id: this.hoverPopoverId, open: this._stateIsOpen });
    if (!this._stateIsOpen) {
      this.setOpenState({ isOpen: true });
    }
    this.hoverNode.setPointerOverTrigger({ isOver: true });
  };

  // ---- Resolved args ----

  private handleTriggerMouseLeave = (_event: MouseEvent): void => {
    console.debug('[debug:popover-trigger] leave', { id: this.hoverPopoverId });
    this.hoverNode.setPointerOverTrigger({ isOver: false });
  };

  /**
   * Trigger events for hover, keyboard, and parent-child coordination.
   * Composes with Frontile's `trigger` modifier (click/ARIA/width).
   */
  triggerEventsModifier = modifier((element: HTMLElement, [profile]: [PopoverTriggerEventsProfile?]) => {
    this.hoverNode.setTriggerElement({ element });

    if (this.isControlled) return;

    if (this.args.debugPinOpen === true) {
      scheduleOnce('afterRender', this, this.openDebugPinnedPopover);
    }

    const onEnter = this.handleTriggerMouseEnter;
    const onLeave = this.handleTriggerMouseLeave;

    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);

    const onKeydown = (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          event.preventDefault();
          event.stopImmediatePropagation();
          this.setOpenState({ isOpen: true });
          break;
        case 'ArrowLeft':
        case 'Escape':
          event.preventDefault();
          event.stopImmediatePropagation();
          this.setOpenState({ isOpen: false });
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          event.stopImmediatePropagation();
          break;
        default:
          break;
      }
    };

    if (profile !== 'hover') {
      element.addEventListener('keydown', onKeydown, true);
    }

    return () => {
      element.removeEventListener('mouseenter', onEnter);
      element.removeEventListener('mouseleave', onLeave);
      if (profile !== 'hover') {
        element.removeEventListener('keydown', onKeydown, true);
      }
    };
  });

  handleOpenChange = (isOpen: boolean): void => {
    this.setOpenState({ isOpen });
  };

  @tracked private _stateIsOpen = false;

  // ---- Frontile controlled state ----

  private get closeDelay(): number {
    return this.args.closeDelay ?? 50;
  }

  /**
   * True when the consumer explicitly provides @isOpen, indicating external control.
   * In controlled mode, the popover defers all state decisions to the caller via
   * @onOpenChange and bypasses internal hover/keyboard handlers.
   * In uncontrolled mode the popover uses its own tracked state (hover) or passes
   * through to Frontile (click).
   */
  private get isControlled(): boolean {
    return this.args.isOpen !== undefined;
  }

  private get frontileIsOpen(): boolean | undefined {
    if (this.isControlled) return this.args.isOpen;
    if (this.isHoverMode) return this._stateIsOpen;

    return undefined;
  }

  private openDebugPinnedPopover = (): void => {
    if (this.args.debugPinOpen !== true || !this.isHoverMode) {
      return;
    }

    this.setOpenState({ isOpen: true });
  };

  // ---- Hover mode handlers ----

  private get frontileOnOpenChange(): ((isOpen: boolean) => void) | undefined {
    if (this.isControlled) return this.args.onOpenChange;
    if (this.isHoverMode) return this.handleOpenChange;
    return this.args.onOpenChange;
  }

  private get isHoverMode(): boolean {
    return this.triggerMode === 'hover';
  }

  private get placement(): PopoverPlacement {
    const defaultPlacement: PopoverPlacement = this.isHoverMode ? 'top-start' : 'bottom-start';
    return this.args.placement ?? defaultPlacement;
  }

  private get resolvedAppearance(): PanelAppearance {
    return this.args.appearance ?? 'default';
  }

  private get resolvedIntent(): PanelIntent {
    return this.args.intent ?? 'default';
  }

  private get resolvedSize(): PanelSize {
    return this.args.size ?? 'md';
  }

  private get triggerMode(): PopoverTriggerMode {
    return this.args.triggerMode ?? 'click';
  }

  /**
   * Hover-mode popovers default to preventing auto-focus so the overlay
   * div does not receive a focus ring on open. This follows the W3C
   * Tooltip pattern: hover reveals supplementary content and focus stays
   * on the trigger. Consumers can override with {@code @preventAutoFocus}
   * when the popover contains interactive content that needs keyboard
   * access on open (e.g. a confirmable dialog).
   *
   * In click mode the default is undefined — Frontile decides.
   */
  private get resolvedPreventAutoFocus(): boolean | undefined {
    if (this.args.preventAutoFocus !== undefined) return this.args.preventAutoFocus;
    if (this.isHoverMode) return true;
    return undefined;
  }

  private get isExternalMode(): boolean {
    return this.args.interactionMode === 'external';
  }

  // ---- Modifiers ----

  private setOpenState({ isOpen }: { isOpen: boolean }): void {
    if (this._stateIsOpen === isOpen) {
      return;
    }

    console.debug('[debug:popover-setOpenState]', {
      id: this.hoverPopoverId,
      isOpen,
      hasParent: this.hoverNode.parentId !== undefined,
    });

    this._stateIsOpen = isOpen;

    if (isOpen) {
      this.hoverNode.registerWithParent();
    } else {
      this.hoverNode.unregisterFromParent();
    }

    this.args.onOpenChange?.(isOpen);
  }

  // ---- Template ----

  <template>
    {{#if this.isExternalMode}}
      <FloatingSurface
        @isOpen={{@isOpen}}
        @onOpenChange={{@onOpenChange}}
        @placement={{@placement}}
        @flipOptions={{@flipOptions}}
        @shiftOptions={{@shiftOptions}}
        @offsetOptions={{@offsetOptions}}
        as |surface|
      >
        {{yield
          (hash
            anchor=surface.anchor
            close=surface.close
            Content=(component
              AppPopoverContent
              FrontileContent=surface.Content
              hoverContentModifier=this.hoverContentModifier
              panelAppearance=this.resolvedAppearance
              panelIntent=this.resolvedIntent
              panelSize=this.resolvedSize
              preventAutoFocus=this.resolvedPreventAutoFocus
              disableFocusTrap=@disableFocusTrap
            )
            isOpen=surface.isOpen
            open=surface.open
          )
        }}
      </FloatingSurface>
    {{else}}
      <FrontilePopover
        @placement={{this.placement}}
        @isOpen={{this.frontileIsOpen}}
        @onOpenChange={{this.frontileOnOpenChange}}
        @didClose={{@didClose}}
        @flipOptions={{if @flipOptions @flipOptions DEFAULT_FLIP_OPTIONS}}
        @shiftOptions={{if @shiftOptions @shiftOptions DEFAULT_SHIFT_OPTIONS}}
        @offsetOptions={{@offsetOptions}}
        @middleware={{SIZE_MIDDLEWARE}}
        as |pop|
      >
        {{yield
          (hash
            anchor=pop.anchor
            close=pop.close
            Content=(component
              AppPopoverContent
              FrontileContent=pop.Content
              hoverContentModifier=this.hoverContentModifier
              panelAppearance=this.resolvedAppearance
              panelIntent=this.resolvedIntent
              panelSize=this.resolvedSize
              disableFocusTrap=@disableFocusTrap
              preventAutoFocus=this.resolvedPreventAutoFocus
            )
            triggerEvents=this.triggerEventsModifier
            isOpen=pop.isOpen
            open=pop.open
            trigger=pop.trigger
          )
        }}
      </FrontilePopover>
    {{/if}}
  </template>
}

export type { AppPopoverContentSignature, PanelAppearance, PanelIntent, PanelSize };
