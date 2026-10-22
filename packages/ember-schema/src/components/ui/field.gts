import type { ComponentLike } from '@glint/template';
import type { FieldSignature } from '@ember-schema-app/ember-schema/components/ui/field/types';
import type {
  SectionClasses,
  SectionFactorySignature,
} from '@ember-schema-app/ember-schema/components/ui/section/types';

import Component from '@glimmer/component';
import Section from '@ember-schema-app/ember-schema/components/ui/section';
import { mergeClasses } from '@ember-schema-app/ember-schema/utils/merge-classes';

export default class Field extends Component<FieldSignature> {
  get sectionClasses(): SectionClasses {
    const { body: _body, ...rest } = this.args.classes ?? {};
    return mergeClasses<SectionClasses>({ header: { title: 'text-neutral-medium' } }, rest);
  }

  get SectionComponent(): ComponentLike<SectionFactorySignature> {
    return this.args.section ?? Section;
  }

  <template>
    {{#let this.SectionComponent as |SectionToUse|}}
      <SectionToUse
        @layout='compact'
        @title={{@label}}
        @appearance={{@appearance}}
        @classes={{this.sectionClasses}}
        ...attributes
      >
        <:body>
          {{yield}}
        </:body>
      </SectionToUse>
    {{/let}}
  </template>
}
