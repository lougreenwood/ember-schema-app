import type { ComponentLike } from '@glint/template';
import type { TOC } from '@ember/component/template-only';

import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { or } from 'ember-truth-helpers';
import FieldSet from '@ember-schema-app/ember-schema/components/ui/field-set';
import CollapsibleSectionRenderer from '@ember-schema-app/ember-schema/components/ui/section/collapsible-section';
import DefaultSection from '@ember-schema-app/ember-schema/components/ui/section/default-section';
import { nextSectionLevel } from '@ember-schema-app/ember-schema/components/ui/section/default-section/consts';
import type { CollapsibleSectionRendererSignature } from '@ember-schema-app/ember-schema/components/ui/section/collapsible-section';
import type { DefaultSectionSignature } from '@ember-schema-app/ember-schema/components/ui/section/default-section';
import type {
  SectionBodyContextualParams,
  SectionBodySignature,
  SectionBodyWithParamsSignature,
  SectionFactorySignature,
  SectionType,
} from '@ember-schema-app/ember-schema/components/ui/section/types';
import type { SectionLevel } from '@ember-schema-app/ember-schema/components/ui/section/default-section/consts';

type RendererSignature = CollapsibleSectionRendererSignature | DefaultSectionSignature;

const SectionBodyWithParams: TOC<{
  Args: SectionBodyWithParamsSignature['Args'] & {
    body: ComponentLike<SectionBodySignature>;
    params: SectionBodyContextualParams;
  };
  Blocks: SectionBodyWithParamsSignature['Blocks'];
  Element: SectionBodyWithParamsSignature['Element'];
}> = <template>
  <@body @hasDividers={{@hasDividers}} ...attributes>
    {{yield @params}}
  </@body>
</template>;

/**
 * Section factory component. The single public API for all section variants.
 *
 * Use `@type` to select the rendering variant:
 * - `@type="default"` (or omit) — standard Section with header and body
 * - `@type="collapsible"` — collapsible section with expand/collapse toggle
 * Three usage modes with progressive disclosure:
 *
 * Mode 1 — Simple (no blocks):
 * ```hbs
 * <Section @title="Foo">Content</Section>
 * ```
 *
 * Mode 2 — Body named block (auto-header, yields body components):
 * ```hbs
 * <Section @title="Foo">
 *   <:body as |body|>
 *     <body.FieldSet @title="Details" as |fs|>
 *       <fs.Field @label="Name">Bar</fs.Field>
 *     </body.FieldSet>
 *   </:body>
 * </Section>
 * ```
 *
 * Mode 3 — Full control (contextual components, consumer renders header):
 * ```hbs
 * <Section @title="Foo" as |s|>
 *   <s.Header>
 *     <:afterTitle>badge</:afterTitle>
 *   </s.Header>
 *   <s.Body as |body|>
 *     <body.FieldSet as |fs|>...</body.FieldSet>
 *   </s.Body>
 * </Section>
 * ```
 */
export default class Section extends Component<SectionFactorySignature> {
  get type(): SectionType {
    return this.args.type ?? 'default';
  }

  get isDefault(): boolean {
    return this.type === 'default';
  }

  get isCollapsible(): boolean {
    return this.type === 'collapsible';
  }

  /**
   * Type-specific args resolved per variant. Reading them here keeps the union on `this.args` narrowed, while the
   * template passes every renderer arg explicitly.
   */
  get defaultOpen(): boolean | undefined {
    return this.args.type === 'collapsible' ? this.args.defaultOpen : undefined;
  }

  get indentBody(): boolean | undefined {
    return this.args.type === 'collapsible' ? this.args.indentBody : undefined;
  }

  get isOpen(): boolean | undefined {
    return this.args.type === 'collapsible' ? this.args.isOpen : undefined;
  }

  get onToggle(): ((isOpen: boolean) => void) | undefined {
    return this.args.type === 'collapsible' ? this.args.onToggle : undefined;
  }

  get sticky(): boolean | undefined {
    return this.args.type === 'collapsible' ? undefined : this.args.sticky;
  }

  /**
   * Resolves the effective section level.
   *
   * Priority:
   * 1. Explicit `@sectionLevel` arg — the caller fully overrides.
   * 2. `@parentSection.sectionLevel` incremented by one — the parent says "this is me", the child
   *    increments. This channel uses a separate arg name so it cannot be clobbered when a caller
   *    passes `@sectionLevel={{undefined}}`.
   * 3. Root default: 1.
   */
  get effectiveSectionLevel(): SectionLevel {
    if (this.args.sectionLevel !== undefined) {
      return this.args.sectionLevel;
    }
    if (this.args.parentSection !== undefined) {
      return nextSectionLevel(this.args.parentSection.sectionLevel);
    }
    return 1;
  }

  /**
   * Resolves the effective header display level.
   *
   * Priority:
   * 1. Explicit `@headerDisplayLevel` arg.
   * 2. `@parentSection.headerDisplayLevel` incremented by one.
   * 3. `effectiveSectionLevel` (header display tracks section level by default).
   */
  get effectiveHeaderDisplayLevel(): SectionLevel {
    if (this.args.headerDisplayLevel !== undefined) {
      return this.args.headerDisplayLevel;
    }
    if (this.args.parentSection !== undefined) {
      return nextSectionLevel(this.args.parentSection.headerDisplayLevel);
    }
    return this.effectiveSectionLevel;
  }

  get renderer(): ComponentLike<RendererSignature> {
    switch (this.type) {
      case 'collapsible':
        return CollapsibleSectionRenderer;
      default:
        return DefaultSection;
    }
  }

  <template>
    {{#let
      (component
        this.renderer
        sectionLevel=this.effectiveSectionLevel
        headerDisplayLevel=this.effectiveHeaderDisplayLevel
        appearance=@appearance
        classes=@classes
        fillHeight=@fillHeight
        hasDivider=@hasDivider
        layout=@layout
        title=@title
        titleIcon=@titleIcon
        subTitle=@subTitle
        sticky=this.sticky
        defaultOpen=this.defaultOpen
        isOpen=this.isOpen
        indentBody=this.indentBody
        onToggle=this.onToggle
      )
      as |BoundRenderer|
    }}
      <BoundRenderer ...attributes as |r|>
        {{#let
          (hash
            FieldSet=(component FieldSet section=(component Section parentSection=r))
            Section=(component Section parentSection=r appearance=@appearance)
            nextSectionLevel=r.nextSectionLevel
            nextHeaderDisplayLevel=r.nextHeaderDisplayLevel
            sectionLevel=r.sectionLevel
            headerDisplayLevel=r.headerDisplayLevel
          )
          as |bodyParams|
        }}
          {{#if (has-block-params)}}
            {{yield
              (hash
                Header=r.Header
                Body=(component SectionBodyWithParams body=r.Body params=bodyParams)
                Section=bodyParams.Section
                sectionLevel=r.sectionLevel
                headerDisplayLevel=r.headerDisplayLevel
                nextSectionLevel=r.nextSectionLevel
                nextHeaderDisplayLevel=r.nextHeaderDisplayLevel
                type=this.type
              )
            }}
          {{else if (has-block 'body')}}
            {{#if (or @title @titleIcon @subTitle)}}
              <r.Header />
            {{/if}}

            <r.Body>
              {{yield bodyParams to='body'}}
            </r.Body>
          {{/if}}
        {{/let}}
      </BoundRenderer>
    {{/let}}
  </template>
}
