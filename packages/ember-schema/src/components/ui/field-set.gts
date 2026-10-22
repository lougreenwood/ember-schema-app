import type { ComponentLike } from '@glint/template';
import type { FieldSetSignature } from '@ember-schema-app/ember-schema/components/ui/field-set/types';
import type { FieldDescriptor } from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type { SectionFactorySignature } from '@ember-schema-app/ember-schema/components/ui/section/types';
import type FieldDisplayEngineService from '@ember-schema-app/ember-schema/services/field-display-engine';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';

import Component from '@glimmer/component';
import FieldSetField from '@ember-schema-app/ember-schema/components/ui/field-set-field';
import Section from '@ember-schema-app/ember-schema/components/ui/section';
import autoGrid from '@ember-schema-app/ember-schema/modifiers/auto-grid';
import { hash } from '@ember/helper';
import { service } from '@ember/service';
import { Result } from 'true-myth';

export default class FieldSet extends Component<FieldSetSignature> {
  @service('field-display-engine') declare fieldDisplayEngine: FieldDisplayEngineService;

  get SectionComponent(): ComponentLike<SectionFactorySignature> {
    return this.args.section ?? Section;
  }

  get isAutoGrid(): boolean {
    return (this.args.layout ?? 'auto-grid') === 'auto-grid';
  }

  get autoFieldDescriptors(): readonly Result<FieldDescriptor, AppError>[] {
    if (this.args.fieldset === undefined) return [];
    return this.fieldDisplayEngine
      .buildFieldDescriptors({ record: this.args.fieldset })
      .map((fieldDescriptor) => Result.ok(fieldDescriptor));
  }

  get hasAutoFields(): boolean {
    return this.autoFieldDescriptors.length > 0;
  }

  <template>
    {{#let this.SectionComponent as |SectionToUse|}}
      <SectionToUse
        @title={{@title}}
        @subTitle={{@subTitle}}
        @appearance={{@appearance}}
        @classes={{@classes}}
        ...attributes
      >
        <:body as |s|>
          {{#let
            (component FieldSetField section=(component Section parentSection=s) classes=@fieldClasses)
            as |FieldComponent|
          }}

            {{#if this.hasAutoFields}}
              <div {{autoGrid}}>
                {{#each this.autoFieldDescriptors as |fieldDescriptor|}}
                  <FieldComponent @model={{@fieldset}} @fieldDescriptor={{fieldDescriptor}} />
                {{/each}}
              </div>
            {{/if}}

            {{yield (hash Field=FieldComponent)}}

          {{/let}}
        </:body>
      </SectionToUse>
    {{/let}}
  </template>
}
