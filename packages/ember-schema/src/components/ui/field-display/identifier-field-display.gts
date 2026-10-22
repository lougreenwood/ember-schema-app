import type { TOC } from '@ember/component/template-only';
import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';

import { readFieldValue } from '@ember-schema-app/ember-schema/components/ui/field-display/read-field-value';
import { toDisplayText } from '@ember-schema-app/ember-schema/components/ui/field-display/display-value';
import ErrorPopover from '@ember-schema-app/ember-schema/components/ui/popovers/error-popover';
import ResultHandler from '@ember-schema-app/ember-schema/components/result-handler';
import truncate from '@ember-schema-app/ember-schema/helpers/truncate';
import { eq } from 'ember-truth-helpers';
import { hash } from '@ember/helper';

const IdentifierFieldDisplay: TOC<{
  Args: { fieldDescriptor: FieldDescriptor; model: WarpDriveRecord | undefined };
  Element: HTMLElement;
}> = <template>
  <ResultHandler @result={{readFieldValue (hash fieldDescriptor=@fieldDescriptor model=@model)}}>
    <:ok as |value|>
      <span class='font-mono text-neutral-strong'>{{truncate (toDisplayText value)}}</span>
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

export default IdentifierFieldDisplay;
