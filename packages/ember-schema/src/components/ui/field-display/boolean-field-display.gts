import type { TOC } from '@ember/component/template-only';
import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';

import { readFieldValue } from '@ember-schema-app/ember-schema/components/ui/field-display/read-field-value';
import ErrorPopover from '@ember-schema-app/ember-schema/components/ui/popovers/error-popover';
import ResultHandler from '@ember-schema-app/ember-schema/components/result-handler';
import { Chip } from 'frontile';
import { eq } from 'ember-truth-helpers';
import { hash } from '@ember/helper';

const BooleanFieldDisplay: TOC<{
  Args: { fieldDescriptor: FieldDescriptor; model: WarpDriveRecord | undefined };
  Element: HTMLElement;
}> = <template>
  <ResultHandler @result={{readFieldValue (hash fieldDescriptor=@fieldDescriptor model=@model)}}>
    <:ok as |value|>
      {{#if (eq value true)}}
        <Chip @size='sm' @intent='success'>Yes</Chip>
      {{else if (eq value false)}}
        <Chip @size='sm' @intent='default'>No</Chip>
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

export default BooleanFieldDisplay;
