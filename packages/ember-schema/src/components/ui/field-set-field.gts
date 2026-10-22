import type { FieldSetFieldSignature } from '@ember-schema-app/ember-schema/components/ui/field/types';

import Component from '@glimmer/component';
import Field from '@ember-schema-app/ember-schema/components/ui/field';
import FieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/field-display';
import ResultHandler from '@ember-schema-app/ember-schema/components/result-handler';

export type { FieldSetFieldSignature };

export default class FieldSetField extends Component<FieldSetFieldSignature> {
  <template>
    {{#if @fieldDescriptor}}
      <ResultHandler @result={{@fieldDescriptor}}>
        <:ok as |descriptor|>
          <Field @label={{descriptor.label}} @appearance={{@appearance}} @classes={{@classes}} @section={{@section}}>
            <FieldDisplay @model={{@model}} @fieldDescriptor={{descriptor}} />
          </Field>
        </:ok>
      </ResultHandler>
    {{else}}
      <Field @label={{@label}} @appearance={{@appearance}} @classes={{@classes}} @section={{@section}}>
        {{yield}}
      </Field>
    {{/if}}
  </template>
}
