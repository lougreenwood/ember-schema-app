import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type {
  FieldDescriptor,
  WarpDriveRecord,
  DescriptorValue,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type {
  FieldValueAbsentEmptyResultError,
  FieldValueComputedResolutionFailedError,
  FieldValuePathReadFailedError,
  FieldValueSourceUnsupportedValidationError,
} from '@ember-schema-app/ember-schema/components/ui/field-display/errors';

import get from 'lodash-es/get';
import { EmptyResultError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/empty-result-error';
import { ValidationError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/validation-error';
import { Result } from 'true-myth';

export function readFieldValue<TField extends FieldDescriptor, TModel extends WarpDriveRecord | undefined>({
  fieldDescriptor,
  model,
}: {
  fieldDescriptor: TField;
  model: TModel;
}): Result<
  DescriptorValue<TField, TModel>,
  | AppError
  | FieldValueAbsentEmptyResultError
  | FieldValueComputedResolutionFailedError
  | FieldValuePathReadFailedError
  | FieldValueSourceUnsupportedValidationError
> {
  switch (fieldDescriptor.valueSource.kind) {
    case 'path': {
      let value: unknown;
      try {
        value = get(model as object, fieldDescriptor.valueSource.path);
      } catch {
        return Result.err(
          ValidationError.of({
            errorCode: 'FIELD_VALUE_PATH_READ_FAILED',
            message: `Failed to read field at path '${fieldDescriptor.valueSource.path}'`,
            meta: { fieldId: fieldDescriptor.id, path: fieldDescriptor.valueSource.path },
          }),
        );
      }

      if (value === null || value === undefined || value === '') {
        return Result.err(
          EmptyResultError.of({
            errorCode: 'FIELD_VALUE_ABSENT',
            message: `Field '${fieldDescriptor.id}' has no value`,
            meta: { fieldId: fieldDescriptor.id },
            emitLog: false,
          }),
        );
      }

      return Result.ok(value) as Result<DescriptorValue<TField, TModel>, never>;
    }

    case 'rootRecord':
      return Result.ok(model as DescriptorValue<TField, TModel>);

    case 'computed':
      return fieldDescriptor.valueSource.resolveValue({ model }) as Result<DescriptorValue<TField, TModel>, AppError>;

    case 'relationship': {
      const value = get(model as object, fieldDescriptor.valueSource.relationshipName);

      if (value === null || value === undefined) {
        return Result.err(
          EmptyResultError.of({
            errorCode: 'FIELD_VALUE_ABSENT',
            message: `Field '${fieldDescriptor.id}' has no value`,
            meta: { fieldId: fieldDescriptor.id },
            emitLog: false,
          }),
        );
      }

      return Result.ok(value) as Result<DescriptorValue<TField, TModel>, never>;
    }

    default:
      return Result.err(
        ValidationError.of({
          errorCode: 'FIELD_VALUE_SOURCE_UNSUPPORTED',
          message: `Field '${fieldDescriptor.id}' has an unsupported value source`,
          meta: { fieldId: fieldDescriptor.id },
        }),
      );
  }
}
