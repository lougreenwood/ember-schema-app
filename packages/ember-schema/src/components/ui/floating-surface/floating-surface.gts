import type { Middleware } from '@floating-ui/dom';
import type { WithBoundArgs } from '@glint/template';
import type { PopoverSignature as FrontilePopoverSignature } from 'frontile';

import { hash } from '@ember/helper';
import { size } from '@floating-ui/dom';
import Component from '@glimmer/component';
import Panel from '@ember-schema-app/ember-schema/components/ui/panels/panel';
import { mergeClassStrings } from '@ember-schema-app/ember-schema/utils/merge-classes';
import { modifier } from 'ember-modifier';
import { Popover as FrontilePopover } from 'frontile';

const FRONTILE_NEUTRALIZE_CLASSES = 'bg-transparent border-none rounded-none p-0 w-auto';

type FrontilePopoverBlockParams = FrontilePopoverSignature['Blocks']['default'][0];

const SIZE_MIDDLEWARE: Middleware[] = [
  size({
    apply({ availableHeight, elements }) {
      elements.floating.style.setProperty('--popover-available-height', `${availableHeight - 16}px`);
    },
  }),
];

const DEFAULT_SHIFT_OPTIONS: FrontilePopoverSignature['Args']['shiftOptions'] = {
  crossAxis: false,
  padding: 15,
};

const DEFAULT_FLIP_OPTIONS: FrontilePopoverSignature['Args']['flipOptions'] = {
  fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'],
};

type FloatingSurfacePlacement =
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

interface FloatingSurfaceContentSignature {
  Args: {
    class?: string;
    disableFocusTrap?: boolean;
    preventAutoFocus?: boolean;
    FrontileContent: FrontilePopoverBlockParams['Content'];
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

class FloatingSurfaceContent extends Component<FloatingSurfaceContentSignature> {
  get resolvedDisableFocusTrap(): boolean {
    return this.args.disableFocusTrap ?? true;
  }

  get resolvedPreventAutoFocus(): boolean {
    return this.args.preventAutoFocus ?? true;
  }

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
      @disableFocusTrap={{this.resolvedDisableFocusTrap}}
      @preventAutoFocus={{this.resolvedPreventAutoFocus}}
      @closeOnEscapeKey={{false}}
    >
      <Panel @class={{this.panelClasses}} {{this.applyMaxHeight}} ...attributes>
        {{yield}}
      </Panel>
    </@FrontileContent>
  </template>
}

export interface FloatingSurfaceSignature {
  Args: {
    isOpen?: boolean;
    placement?: FloatingSurfacePlacement;
    flipOptions?: FrontilePopoverSignature['Args']['flipOptions'];
    shiftOptions?: FrontilePopoverSignature['Args']['shiftOptions'];
    offsetOptions?: FrontilePopoverSignature['Args']['offsetOptions'];
    middleware?: Middleware[];
    onOpenChange?: (isOpen: boolean) => void;
    transitionDuration?: number;
  };
  Blocks: {
    default: [
      {
        anchor: FrontilePopoverBlockParams['anchor'];
        Content: WithBoundArgs<typeof FloatingSurfaceContent, 'FrontileContent'>;
        isOpen: boolean;
        open: () => void;
        close: () => void;
      },
    ];
  };
  Element: HTMLDivElement;
}

class FloatingSurface extends Component<FloatingSurfaceSignature> {
  private get placement(): FloatingSurfacePlacement {
    return this.args.placement ?? 'bottom-start';
  }

  private handleClose = (): void => {
    this.args.onOpenChange?.(false);
  };

  private open = (): void => {
    this.args.onOpenChange?.(true);
  };

  private close = (): void => {
    this.args.onOpenChange?.(false);
  };

  <template>
    <FrontilePopover
      @placement={{this.placement}}
      @isOpen={{@isOpen}}
      @onOpenChange={{this.handleClose}}
      @flipOptions={{if @flipOptions @flipOptions DEFAULT_FLIP_OPTIONS}}
      @shiftOptions={{if @shiftOptions @shiftOptions DEFAULT_SHIFT_OPTIONS}}
      @offsetOptions={{@offsetOptions}}
      @middleware={{SIZE_MIDDLEWARE}}
      as |pop|
    >
      {{yield
        (hash
          anchor=pop.anchor
          Content=(component FloatingSurfaceContent FrontileContent=pop.Content)
          isOpen=pop.isOpen
          open=this.open
          close=this.close
        )
      }}
    </FrontilePopover>
  </template>
}

export default FloatingSurface;
