import type { TOC } from '@ember/component/template-only';
import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';

import Copyable from '@ember-schema-app/ember-schema/components/ui/copyable';
import InfoPopover from '@ember-schema-app/ember-schema/components/ui/popovers/info-popover';
import { readFieldValue } from '@ember-schema-app/ember-schema/components/ui/field-display/read-field-value';
import ResultHandler from '@ember-schema-app/ember-schema/components/result-handler';
import { eq } from 'ember-truth-helpers';
import { hash } from '@ember/helper';

interface JsonFieldDisplaySignature {
  Args: { fieldDescriptor: FieldDescriptor; model: WarpDriveRecord | undefined };
  Element: HTMLElement;
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function triggerLabel(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length > 0 ? '…' : ''}]`;
  if (typeof value === 'object' && value !== undefined) return '{…}';
  return '{…}';
}

const JsonFieldDisplay: TOC<JsonFieldDisplaySignature> = <template>
  <ResultHandler @result={{readFieldValue (hash fieldDescriptor=@fieldDescriptor model=@model)}}>
    <:ok as |value|>
      <InfoPopover @placement='top' @enableCopy={{true}} @copyText={{formatJson value}}>
        <:trigger as |t|>
          <span
            {{t.anchor}}
            class='text-neutral-soft font-mono text-xs cursor-help hover:text-neutral-medium'
            ...attributes
          >{{triggerLabel value}}</span>
        </:trigger>
        <:content>
          <div class='max-w-xs'>
            <pre class='max-h-40 overflow-auto text-2xs text-neutral-strong font-mono whitespace-pre-wrap'>{{formatJson
                value
              }}</pre>
          </div>
        </:content>
      </InfoPopover>
    </:ok>
    <:error as |error|>
      {{#if (eq error.errorCode 'FIELD_VALUE_ABSENT')}}
        <span class='text-neutral-soft'>—</span>
      {{else}}
        {{! Absence-only for JSON fields; unexpected errors surface through the outer FieldDisplay handler }}
      {{/if}}
    </:error>
  </ResultHandler>
</template>;

export default JsonFieldDisplay;
