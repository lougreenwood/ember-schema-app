import type { WithLegacy } from '@warp-drive/legacy/model/migration-support';
import type { TypedRecordInstance } from '@warp-drive/core/types/record';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { Result } from 'true-myth';

export type WarpDriveRecord = WithLegacy<TypedRecordInstance>;

export type SchemaResourceTypeMap = Record<string, WithLegacy<TypedRecordInstance>>;

export type SchemaResourceType<TResourceTypeToModel extends object = SchemaResourceTypeMap> =
  keyof TResourceTypeToModel & string;

export type DisplayFieldType = 'date' | 'number' | 'boolean' | 'url' | 'identifier' | 'enum' | 'json' | 'unknown';

export type FieldDescriptorKind =
  'attribute' | 'belongsTo' | 'computed' | 'derived' | 'field' | 'hasMany' | 'id' | 'object' | 'schemaObject';

export type FieldValueSource<TResourceTypeToModel extends object = SchemaResourceTypeMap> =
  | { readonly kind: 'path'; readonly path: string }
  | { readonly kind: 'rootRecord' }
  | {
      readonly kind: 'relationship';
      readonly relationshipName: string;
      readonly relatedResourceType: SchemaResourceType<TResourceTypeToModel>;
    }
  | {
      readonly kind: 'computed';
      readonly resolveValue: (args: { model: WarpDriveRecord | undefined }) => Result<unknown, AppError>;
    };

export interface FieldDescriptor<TResourceTypeToModel extends object = SchemaResourceTypeMap> {
  readonly displaySpecification: FieldDisplaySpecification;
  readonly id: string;
  readonly kind: FieldDescriptorKind;
  readonly label: string;
  readonly valueSource: FieldValueSource<TResourceTypeToModel>;
}

export type FieldDisplaySpecification =
  | {
      readonly type: 'number';
      readonly displayType?: 'duration' | 'number' | 'percentage';
      readonly formatOptions?: Intl.NumberFormatOptions;
    }
  | {
      readonly type: 'boolean' | 'date' | 'enum' | 'identifier' | 'json' | 'unknown' | 'url';
    };

export type DescriptorValue<
  TField extends FieldDescriptor,
  TModel extends WarpDriveRecord | undefined,
> = TField extends {
  valueSource: { kind: 'rootRecord' };
}
  ? TModel
  : unknown;

/**
 * Result of computing a price with directional change.
 */
export type PriceWithChange = {
  change: number | undefined;
  direction: 'down' | 'neutral' | 'up';
  formatted: string;
};
