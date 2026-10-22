import type { TOC } from '@ember/component/template-only';
import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';

import Copyable from '@ember-schema-app/ember-schema/components/ui/copyable';
import InfoPopover from '@ember-schema-app/ember-schema/components/ui/popovers/info-popover';
import JsonFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/json-field-display';
import { readFieldValue } from '@ember-schema-app/ember-schema/components/ui/field-display/read-field-value';
import { toDisplayText } from '@ember-schema-app/ember-schema/components/ui/field-display/display-value';
import ErrorPopover from '@ember-schema-app/ember-schema/components/ui/popovers/error-popover';
import ResultHandler from '@ember-schema-app/ember-schema/components/result-handler';
import { hash } from '@ember/helper';
import { eq } from 'ember-truth-helpers';

function isObjectValue(value: unknown): boolean {
  return value !== undefined && (Array.isArray(value) || (typeof value === 'object' && value !== null));
}

const DefaultFieldDisplay: TOC<{
  Args: { fieldDescriptor: FieldDescriptor; model: WarpDriveRecord | undefined };
  Element: HTMLElement;
}> = <template>
  <ResultHandler @result={{readFieldValue (hash fieldDescriptor=@fieldDescriptor model=@model)}}>
    <:ok as |value|>
      {{#if (isObjectValue value)}}
        <JsonFieldDisplay @model={{@model}} @fieldDescriptor={{@fieldDescriptor}} />
      {{else}}
        {{toDisplayText value}}
      {{/if}}
    </:ok>
    <:error as |error|>
      {{#if (eq error.errorCode 'FIELD_VALUE_ABSENT')}}
        <span class='text-neutral-soft'>—</span>
      {{else}}
        <ErrorPopover @error={{error}} />
      {{/if}}
    </:error>
  </ResultHandler>
</template>;

export default DefaultFieldDisplay;
