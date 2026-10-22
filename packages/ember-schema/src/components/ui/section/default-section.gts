import { concat, hash } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { element } from 'ember-element-helper';
import { or } from 'ember-truth-helpers';
import { mergeClasses } from '@ember-schema-app/ember-schema/utils/merge-classes';
import {
  ABOVE_TITLE_GAP_MAP,
  BODY_GAP_SIZE_MAP,
  FONT_SIZE_MAP,
  ICON_SIZE_MAP,
  ROW_GAP_SIZE_MAP,
  SUBTITLE_FONT_SIZE_MAP,
  SUBTITLE_FONT_WEIGHT_MAP,
  TITLE_FONT_WEIGHT_MAP,
  TITLE_GROUP_GAP_MAP,
  nextSectionLevel,
  type SectionLevel,
} from '@ember-schema-app/ember-schema/components/ui/section/default-section/consts';
import type {
  BaseSectionRendererSignature,
  SectionBodySignature,
  SectionClasses,
  SectionHeaderClasses,
  SectionHeaderSignature,
} from '@ember-schema-app/ember-schema/components/ui/section/types';

/**
 * SectionHeader - Renders title, optional icon, afterTitle content, and subTitle.
 *
 * Used internally by DefaultSection and also yielded as a contextual component.
 * Supports both @title arg and default block for title content.
 *
 * Layout: Flex column with gap-3 between aboveTitle and the title group.
 * - aboveTitle (optional): Content above the title group (e.g., breadcrumbs)
 * - Title group (gap-1): Tight spacing between title row and subtitle
 *   - Title row: beforeTitle (optional) + icon (if present) + heading + afterTitle content
 *   - SubTitle row (if present): muted text below title
 *
 * Slots:
 * - aboveTitle: Content above the title group (e.g., breadcrumbs) — separated by a larger gap
 * - beforeTitle: Content before the title (e.g., chevron for CollapsibleSection)
 * - default: Custom title content (replaces @title arg)
 * - afterTitle: Content after the title (e.g., badges, actions)
 * - subTitle: Custom subtitle content (replaces @subTitle arg)
 */
export class SectionHeader extends Component<SectionHeaderSignature> {
  get _classes(): SectionHeaderClasses {
    return {
      base: `flex flex-col ${this.args.aboveTitleGap}`,
      titleGroup: `flex flex-col ${this.args.titleGroupGap}`,
      titleRow: 'flex flex-row gap-2 items-center',
      title: `${this.args.fontSize} ${this.args.titleFontWeight} min-w-0`,
      afterTitle: 'grow flex items-center gap-2 min-w-0',
      subTitle: `${this.args.subTitleFontSize} ${this.args.subTitleFontWeight} text-neutral-soft empty:contents`,
    };
  }

  get _appearanceClasses(): Partial<SectionHeaderClasses> | undefined {
    switch (this.args.appearance) {
      case 'subtle':
        return { title: 'font-medium' };
      default:
        return undefined;
    }
  }

  get classes(): SectionHeaderClasses {
    return mergeClasses(mergeClasses(this._classes, this._appearanceClasses), this.args.classes);
  }

  <template>
    <header class={{this.classes.base}} ...attributes>
      {{! Above title: breadcrumbs or other content above the title row }}
      {{#if (has-block 'aboveTitle')}}
        <div class='empty:contents'>{{yield to='aboveTitle'}}</div>
      {{/if}}

      {{! Title group: title row + subtitle with tight spacing }}
      <div class={{this.classes.titleGroup}}>
        {{! Title row: beforeTitle + icon + heading + afterTitle }}
        <div class={{this.classes.titleRow}}>
          {{#if (has-block 'beforeTitle')}}
            {{! Single-line to prevent whitespace from making empty:contents ineffective }}
            <div class='empty:contents {{this.classes.beforeTitle}}'>{{yield to='beforeTitle'}}</div>
          {{/if}}

          {{#if @titleIcon}}
            <FaIcon @icon={{@titleIcon}} class={{@iconSize}} />
          {{/if}}

          {{#let (element @headingTag) as |HeadingTag|}}
            <HeadingTag class={{this.classes.title}}>
              {{#if (has-block)}}
                {{yield}}
              {{else}}
                {{@title}}
              {{/if}}
            </HeadingTag>
          {{/let}}

          {{#if (has-block 'afterTitle')}}
            <div class={{this.classes.afterTitle}}>
              {{yield to='afterTitle'}}
            </div>
          {{/if}}
        </div>

        {{! SubTitle row — single-line so empty:contents suppresses flex gap when no content }}
        {{#if (or @subTitle (has-block 'subTitle'))}}
          <div class={{this.classes.subTitle}}>{{#if @subTitle}}{{@subTitle}}{{else}}{{yield
                to='subTitle'
              }}{{/if}}</div>
        {{/if}}
      </div>
    </header>
  </template>
}

export class SectionBody extends Component<SectionBodySignature> {
  get bodyClass(): string {
    return this.args.hasDividers
      ? '[&>*]:py-[calc(var(--body-gap)/2)] [&>*:first-child]:pt-0 [&>*:last-child]:pb-0'
      : 'gap-[var(--body-gap)]';
  }

  <template>
    <div class='flex flex-col {{this.bodyClass}} {{@class}}' ...attributes>
      {{yield}}
    </div>
  </template>
}

export interface DefaultSectionSignature extends BaseSectionRendererSignature {
  Args: BaseSectionRendererSignature['Args'] & {
    /**
     * When true, the section takes full parent height and the body becomes the scrollable area.
     * Used by PageSection.
     */
    sticky?: boolean;
  };
}

/**
 * Default section renderer. Renders a `<section>` element with header and body.
 *
 * This is an internal renderer used by the Section factory. Do not use directly — use
 * `<Section>` or `<Section @type="default">` instead.
 *
 * Yields RendererContextualParams (Header, Body, nextSectionLevel, nextHeaderDisplayLevel).
 * The factory adds `Section` and `type` before forwarding to consumers.
 */
export default class DefaultSection extends Component<DefaultSectionSignature> {
  get dividerHeaderPaddingClass(): string {
    return this.args.hasDivider ? '[&>*:not(:last-child)]:pb-[calc(var(--section-gap)/2)]' : '';
  }

  get _classes(): SectionClasses {
    // When hasDivider is true, CSS `divide-y` inserts a border between children but contributes no
    // spacing of its own — the visual gap either side of the line comes entirely from padding/margin
    // on the elements. To achieve a total gap of `--section-gap` with the divider line centred in
    // that space, we split the gap in two:
    //   • The header gets `pb-[calc(var(--section-gap)/2)]` (via the `[&>*:not(:last-child)]`
    //     selector in dividerClasses below) — this is the space above the divider line.
    //   • The flex container gets `gap-y-[calc(var(--section-gap)/2)]` here — this is the space
    //     below the divider line (i.e. above the body).
    // Together they sum to the full `--section-gap`, with the divider sitting in the middle.
    const gapClass = this.isCompact
      ? ''
      : this.args.hasDivider
        ? this.isSticky
          ? ''
          : 'gap-y-[calc(var(--section-gap)/2)]'
        : 'gap-y-[var(--section-gap)]';

    const fillHeightBase = this.isFillHeight ? 'flex-1' : '';
    const stickyBase = this.isSticky ? 'h-full' : '';
    const stickyBody = this.isSticky
      ? this.args.hasDivider
        ? 'flex-1 min-h-0 overflow-auto overscroll-none pt-[calc(var(--section-gap)/2)] pb-[calc(var(--section-gap)/2)]'
        : 'flex-1 min-h-0 overflow-auto overscroll-none'
      : '';

    const dividerClasses = this.args.hasDivider ? `divide-y divide-divider ${this.dividerHeaderPaddingClass}` : '';

    const base = `flex flex-col ${gapClass} ${dividerClasses} ${fillHeightBase} ${stickyBase}`.trim();

    return {
      base,
      body: stickyBody || (this.isFillHeight ? 'flex-1' : undefined),
      header: undefined,
    };
  }

  get classes(): SectionClasses {
    return mergeClasses(this._classes, this.args.classes);
  }

  get childLevel(): SectionLevel {
    return nextSectionLevel(this.sectionLevel);
  }

  get childHeaderDisplayLevel(): SectionLevel {
    return nextSectionLevel(this.headerDisplayLevel);
  }

  get sectionGapValue(): string {
    return ROW_GAP_SIZE_MAP.get(this.headerDisplayLevel)!;
  }

  get isCompact(): boolean {
    return this.args.layout === 'compact';
  }

  get isSticky(): boolean {
    return this.args.sticky === true;
  }

  get isFillHeight(): boolean {
    return this.args.fillHeight === true;
  }

  get fontSize(): string {
    return FONT_SIZE_MAP.get(this.headerDisplayLevel)!;
  }

  get subTitleFontSize(): string {
    return SUBTITLE_FONT_SIZE_MAP.get(this.headerDisplayLevel)!;
  }

  get subTitleFontWeight(): string {
    return SUBTITLE_FONT_WEIGHT_MAP.get(this.headerDisplayLevel)!;
  }

  get titleGroupGap(): string {
    return TITLE_GROUP_GAP_MAP.get(this.headerDisplayLevel)!;
  }

  get titleFontWeight(): string {
    return TITLE_FONT_WEIGHT_MAP.get(this.headerDisplayLevel)!;
  }

  get aboveTitleGap(): string {
    return ABOVE_TITLE_GAP_MAP.get(this.headerDisplayLevel)!;
  }

  get headerDisplayLevel(): SectionLevel {
    return this.args.headerDisplayLevel ?? this.sectionLevel;
  }

  get headingTag(): string {
    return `h${this.sectionLevel}`;
  }

  get iconSize(): string {
    return ICON_SIZE_MAP.get(this.headerDisplayLevel)!;
  }

  get bodyGapValue(): string {
    return BODY_GAP_SIZE_MAP.get(this.headerDisplayLevel)!;
  }

  get sectionLevel(): SectionLevel {
    return this.args.sectionLevel ?? 1;
  }

  <template>
    <section
      class={{this.classes.base}}
      style={{concat '--section-gap: ' this.sectionGapValue '; --body-gap: ' this.bodyGapValue}}
      ...attributes
    >
      {{yield
        (hash
          Header=(component
            SectionHeader
            headingTag=this.headingTag
            fontSize=this.fontSize
            titleFontWeight=this.titleFontWeight
            subTitleFontSize=this.subTitleFontSize
            subTitleFontWeight=this.subTitleFontWeight
            titleGroupGap=this.titleGroupGap
            aboveTitleGap=this.aboveTitleGap
            iconSize=this.iconSize
            classes=this.classes.header
            title=@title
            subTitle=@subTitle
            appearance=@appearance
            titleIcon=@titleIcon
          )
          Body=(component SectionBody class=this.classes.body)
          nextHeaderDisplayLevel=this.childHeaderDisplayLevel
          nextSectionLevel=this.childLevel
          sectionLevel=this.sectionLevel
          headerDisplayLevel=this.headerDisplayLevel
        )
      }}
    </section>
  </template>
}
