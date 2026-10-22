import type { EmptyResultError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/empty-result-error';
import type { ValidationError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/validation-error';

export type FieldIsHasManyNotLeafError = EmptyResultError<{
  errorCode: 'FIELD_IS_HASMANY_NOT_LEAF';
  message: string;
  meta: { fieldName: string };
}>;

export type FieldIsSchemaObjectContainerNotLeafError = EmptyResultError<{
  errorCode: 'FIELD_IS_SCHEMA_OBJECT_CONTAINER_NOT_LEAF';
  message: string;
  meta: { fieldName: string; schemaObjectType: string };
}>;

export type FieldValuePathReadFailedError = ValidationError<{
  errorCode: 'FIELD_VALUE_PATH_READ_FAILED';
  message: string;
  meta: { fieldId: string; path: string };
}>;

export type FieldValueComputedResolutionFailedError = ValidationError<{
  errorCode: 'FIELD_VALUE_COMPUTED_RESOLUTION_FAILED';
  message: string;
  meta: { fieldId: string };
}>;

export type FieldValueSourceUnsupportedValidationError = ValidationError<{
  errorCode: 'FIELD_VALUE_SOURCE_UNSUPPORTED';
  message: string;
  meta: { fieldId: string };
}>;

export type FieldValueAbsentEmptyResultError = EmptyResultError<{
  errorCode: 'FIELD_VALUE_ABSENT';
  message: string;
  meta: { fieldId: string };
}>;

export type FieldValueNotLoadedEmptyResultError = EmptyResultError<{
  errorCode: 'FIELD_VALUE_NOT_LOADED';
  message: string;
  meta: { fieldId: string };
}>;

export type CurrencyValueFormatUnrecognizedError = ValidationError<{
  errorCode: 'CURRENCY_VALUE_FORMAT_UNRECOGNIZED';
  message: string;
  meta: { fieldId: string };
}>;

export type CurrencyValueAssetNotFoundError = ValidationError<{
  errorCode: 'CURRENCY_VALUE_ASSET_NOT_FOUND';
  message: string;
  meta: { fieldId: string; assetId: string };
}>;

export type CurrencyValueWithChangeTypeMismatchValidationError = ValidationError<{
  errorCode: 'CURRENCY_VALUE_WITH_CHANGE_TYPE_MISMATCH';
  message: string;
  meta: { fieldId: string };
}>;

export type NumberFieldValueTypeMismatchValidationError = ValidationError<{
  errorCode: 'NUMBER_FIELD_VALUE_TYPE_MISMATCH';
  message: string;
  meta: { fieldId: string };
}>;

export type MarketDataStreamNotFoundError = EmptyResultError<{
  errorCode: 'MARKET_DATA_STREAM_NOT_FOUND';
  message: string;
  meta: { fieldId: string; windowSizeMs: number };
}>;

export type MarketDataSampleNotFoundError = EmptyResultError<{
  errorCode: 'MARKET_DATA_SAMPLE_NOT_FOUND';
  message: string;
  meta: { fieldId: string; windowSizeMs: number };
}>;

export type MarketDataInsufficientCompleteSamplesError = EmptyResultError<{
  errorCode: 'MARKET_DATA_INSUFFICIENT_COMPLETE_SAMPLES';
  message: string;
  meta: { fieldId: string; windowSizeMs: number };
}>;

export type MarketDataPercentageDenominatorZeroError = EmptyResultError<{
  errorCode: 'MARKET_DATA_PERCENTAGE_DENOMINATOR_ZERO';
  message: string;
  meta: { fieldId: string };
}>;
