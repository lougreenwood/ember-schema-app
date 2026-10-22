import type {
  BaseSectionRendererSignature,
  SectionClasses,
} from '@ember-schema-app/ember-schema/components/ui/section/types';

import { hash } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ExpandButton from '@ember-schema-app/ember-schema/components/ui/buttons/expand-button';
import Collapsible from '@ember-schema-app/ember-schema/components/ui/collapsible';
import {
  BUTTON_SIZE_MAP,
  COL_GAP,
} from '@ember-schema-app/ember-schema/components/ui/section/collapsible-section/consts';
import DefaultSection from '@ember-schema-app/ember-schema/components/ui/section/default-section';
import { ROW_GAP_SIZE_MAP } from '@ember-schema-app/ember-schema/components/ui/section/default-section/consts';
import { mergeClasses } from '@ember-schema-app/ember-schema/utils/merge-classes';
import { and } from 'ember-truth-helpers';

export interface CollapsibleSectionRendererSignature extends BaseSectionRendererSignature {
  Args: BaseSectionRendererSignature['Args'] & {
    /**
     * Initial open state when uncontrolled. Defaults to true (open).
     */
    defaultOpen?: boolean;
    /**
     * When false, the body spans full width (no col-start-2 indent). Defaults to true.
     * Set to false when rendering inside a Panel where the chevron indent is unwanted.
     */
    indentBody?: boolean;
    /**
     * Controls whether the section is expanded. When provided, the component is in "controlled" mode.
     */
    isOpen?: boolean;
    /**
     * Callback fired when the section is toggled.
     */
    onToggle?: (isOpen: boolean) => void;
  };
}

/**
 * Collapsible section renderer. Internal renderer used by the Section factory for @type="collapsible".
 *
 * Do not use directly — use `<Section @type="collapsible">` instead.
 *
 * Yields RendererContextualParams (Header, Body, Footer, nextSectionLevel, nextHeaderDisplayLevel).
 * The factory adds the `Section` entry before forwarding to consumers.
 */
export default class CollapsibleSectionRenderer extends Component<CollapsibleSectionRendererSignature> {
  get classes(): SectionClasses {
    return mergeClasses(this.internalClasses, this.args.classes);
  }

  get collapsibleClass(): string {
    return this.args.indentBody !== false ? '[grid-column:content]' : '[grid-column:chevron_/_span_2]';
  }

  get expandButtonSize(): '2xs' | 'lg' | 'md' | 'sm' | 'xl' | 'xs' {
    return BUTTON_SIZE_MAP.get(this.args.headerDisplayLevel ?? 1)!;
  }

  get internalClasses(): SectionClasses {
    const rowGap = this.isOpen ? ROW_GAP_SIZE_MAP.get(this.args.headerDisplayLevel ?? 1)! : 'gap-y-0';
    return {
      base: `grid [grid-template-columns:[chevron]_auto_[content]_1fr] ${COL_GAP} ${rowGap}`,
      header: {
        base: '[grid-column:content]',
      },
    };
  }

  get isOpen(): boolean {
    return this.args.isOpen ?? this._isOpen;
  }

  toggle = (): void => {
    const newState = !this.isOpen;
    this._isOpen = newState;
    this.args.onToggle?.(newState);
  };

  @tracked private _isOpen: boolean = this.args.defaultOpen ?? true;

  <template>
    <DefaultSection
      @sectionLevel={{@sectionLevel}}
      @headerDisplayLevel={{@headerDisplayLevel}}
      @title={{@title}}
      @subTitle={{@subTitle}}
      @appearance={{@appearance}}
      @titleIcon={{@titleIcon}}
      @hasDivider={{and this.isOpen @hasDivider}}
      @classes={{this.classes}}
      ...attributes
      as |r|
    >
      {{! Row 1: Chevron + Header side by side, spanning both named columns }}
      <div class='flex flex-row gap-2 w-full [grid-column:chevron_/_span_2]'>
        <div class='self-center'>
          <ExpandButton
            @appearance='minimal'
            @size={{this.expandButtonSize}}
            @isExpanded={{this.isOpen}}
            @onToggle={{this.toggle}}
          />
        </div>

        <r.Header />
      </div>

      {{! Row 2: Body in content column only }}
      <Collapsible @isOpen={{this.isOpen}} class={{this.collapsibleClass}}>
        <r.Body>
          {{yield
            (hash
              Header=r.Header
              Body=r.Body
              nextHeaderDisplayLevel=r.nextHeaderDisplayLevel
              nextSectionLevel=r.nextSectionLevel
              sectionLevel=r.sectionLevel
              headerDisplayLevel=r.headerDisplayLevel
            )
          }}
        </r.Body>
      </Collapsible>
    </DefaultSection>
  </template>
}
