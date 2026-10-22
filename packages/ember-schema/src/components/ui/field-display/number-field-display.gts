import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type {
  FieldValueAbsentEmptyResultError,
  FieldValueComputedResolutionFailedError,
  FieldValuePathReadFailedError,
  FieldValueSourceUnsupportedValidationError,
  NumberFieldValueTypeMismatchValidationError,
} from '@ember-schema-app/ember-schema/components/ui/field-display/errors';

import { readFieldValue } from '@ember-schema-app/ember-schema/components/ui/field-display/read-field-value';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import Component from '@glimmer/component';
import ErrorPopover from '@ember-schema-app/ember-schema/components/ui/popovers/error-popover';
import ResultHandler from '@ember-schema-app/ember-schema/components/result-handler';
import { eq } from 'ember-truth-helpers';
import { Result } from 'true-myth';
import { ValidationError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/validation-error';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';

interface NumberFieldDisplaySignature {
  Args: { fieldDescriptor: FieldDescriptor; model: WarpDriveRecord | undefined };
  Element: HTMLElement;
}

export default class NumberFieldDisplay extends Component<NumberFieldDisplaySignature> {
  @service declare intl: IntlService;

  get formattedValue(): Result<
    string,
    | AppError
    | FieldValueAbsentEmptyResultError
    | FieldValueComputedResolutionFailedError
    | FieldValuePathReadFailedError
    | FieldValueSourceUnsupportedValidationError
    | NumberFieldValueTypeMismatchValidationError
  > {
    return readFieldValue({ model: this.args.model, fieldDescriptor: this.args.fieldDescriptor }).andThen((raw) => {
      if (typeof raw !== 'number') {
        return Result.err(
          ValidationError.of({
            errorCode: 'NUMBER_FIELD_VALUE_TYPE_MISMATCH',
            message: 'Field value is not a number',
            meta: { fieldId: this.args.fieldDescriptor.id },
          }),
        );
      }

      const spec = this.args.fieldDescriptor.displaySpecification;
      const options: Intl.NumberFormatOptions = {};

      if (spec.type === 'number' && spec.displayType === 'percentage') {
        options.style = 'percent';
      }
      if (spec.type === 'number' && spec.formatOptions !== undefined) {
        Object.assign(options, spec.formatOptions);
      }

      const locale = this.intl.primaryLocale;
      const formatted = new Intl.NumberFormat(locale, options).format(raw);
      return Result.ok(formatted);
    });
  }

  <template>
    <ResultHandler @result={{this.formattedValue}}>
      <:ok as |value|><span class='font-mono'>{{value}}</span></:ok>
      <:error as |error|>
        {{#if (eq error.errorCode 'FIELD_VALUE_ABSENT')}}
          <span class='text-neutral-soft'>—</span>
        {{else}}
          <ErrorPopover @error={{error}} />
        {{/if}}
      </:error>
    </ResultHandler>
  </template>
}
