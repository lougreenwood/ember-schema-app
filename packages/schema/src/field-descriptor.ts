import { Result } from 'true-myth';

import {
  schemaError,
  type AppErrorLike,
  type FieldDescriptorKind,
  type ResolvedFieldDisplayInfo,
  type SchemaResult,
} from './types.js';

export type DisplayFieldType =
  | 'app-error'
  | 'boolean'
  | 'currency-value'
  | 'date'
  | 'enum'
  | 'id'
  | 'identifier'
  | 'json'
  | 'number'
  | 'result'
  | 'tag-claims'
  | 'unknown'
  | 'url';

export interface FieldValueSource {
  readonly kind: 'path' | 'relationship' | 'root-record';
  readonly path?: string;
  readonly relatedResourceType?: string;
  readonly relationshipName?: string;
}

export interface FieldDisplaySpecification {
  readonly type: DisplayFieldType;
}

export interface FieldDescriptor {
  readonly displaySpecification: FieldDisplaySpecification;
  readonly id: string;
  readonly kind: FieldDescriptorKind;
  readonly label: string;
  readonly valueSource: FieldValueSource;
}

export interface DisplayTypeInferenceArgs {
  readonly fieldInfo: ResolvedFieldDisplayInfo;
  readonly fieldName: string;
  readonly fieldPath: string;
}

export type DisplayTypePredicate = (args: DisplayTypeInferenceArgs) => DisplayFieldType | undefined;

const BOOLEAN_PREFIX = /^(is|has|can|should|was|did)([A-Z_])/;
const BOOLEAN_NAMES = new Set(['readOnly', 'required']);
const URL_SUFFIX = /(url|uri|link|website|homepage)$/i;

export function inferDisplayFieldType({
  fieldInfo,
  fieldName,
  fieldPath,
  predicates = [],
}: DisplayTypeInferenceArgs & {
  readonly predicates?: readonly DisplayTypePredicate[];
}): SchemaResult<DisplayFieldType> {
  const customType = predicates.reduce<DisplayFieldType | undefined>(
    (matched, predicate) => matched ?? predicate({ fieldInfo, fieldName, fieldPath }),
    undefined,
  );

  if (customType !== undefined) return Result.ok(customType);

  if (fieldInfo.kind === 'has-many') {
    return Result.err(
      schemaError({
        errorCode: 'FIELD_IS_HAS_MANY_NOT_LEAF',
        message: 'HasMany fields cannot be rendered as a single display field',
      }),
    );
  }

  if (fieldInfo.kind === 'belongs-to' || fieldInfo.kind === 'id') return Result.ok('id');
  if (fieldInfo.kind === 'object') return Result.ok('json');
  if (fieldInfo.kind === 'schema-object') {
    if (fieldInfo.type === 'serialized-currency-value') return Result.ok('currency-value');
    if (fieldInfo.type === 'serialized-app-error') return Result.ok('app-error');
    if (fieldInfo.type === 'serialized-result') return Result.ok('result');

    return Result.err(
      schemaError({
        errorCode: 'FIELD_IS_SCHEMA_OBJECT_CONTAINER_NOT_LEAF',
        message: 'Schema-object container must be expanded into child fields',
      }),
    );
  }

  if (fieldInfo.type === 'date' || fieldInfo.type === 'optional-date') return Result.ok('date');
  if (fieldInfo.type === 'optional-number') return Result.ok('number');
  if (fieldInfo.type === 'enum') return Result.ok('enum');
  if (BOOLEAN_PREFIX.test(fieldName) || BOOLEAN_NAMES.has(fieldName)) return Result.ok('boolean');
  if (URL_SUFFIX.test(fieldName)) return Result.ok('url');
  if (/address/i.test(fieldName)) return Result.ok('identifier');

  return Result.ok('unknown');
}

export function buildFieldDescriptor({
  fieldInfo,
  fieldName,
  fieldPath,
  predicates = [],
}: DisplayTypeInferenceArgs & { readonly predicates?: readonly DisplayTypePredicate[] }): Result<
  FieldDescriptor,
  AppErrorLike
> {
  return inferDisplayFieldType({ fieldInfo, fieldName, fieldPath, predicates }).map((displayType) => ({
    displaySpecification: { type: displayType },
    id: fieldPath,
    kind: fieldInfo.kind,
    label: fieldInfo.label,
    valueSource: resolveFieldValueSource({ fieldInfo, fieldName }),
  }));
}

function resolveFieldValueSource({
  fieldInfo,
  fieldName,
}: {
  fieldInfo: ResolvedFieldDisplayInfo;
  fieldName: string;
}): FieldValueSource {
  if (fieldInfo.kind === 'belongs-to' || fieldInfo.kind === 'has-many') {
    return {
      kind: 'relationship',
      ...(fieldInfo.type === undefined ? {} : { relatedResourceType: fieldInfo.type }),
      relationshipName: fieldName,
    };
  }

  if (fieldInfo.kind === 'id') {
    return { kind: 'root-record' };
  }

  return { kind: 'path', path: fieldName };
}

export function buildFieldDescriptors({
  fields,
  predicates = [],
  parentPath,
}: {
  fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  parentPath?: string;
  predicates?: readonly DisplayTypePredicate[];
}): readonly FieldDescriptor[] {
  return Object.entries(fields).reduce<readonly FieldDescriptor[]>((descriptors, [fieldName, fieldInfo]) => {
    const fieldPath = parentPath === undefined ? fieldName : `${parentPath}.${fieldName}`;
    const descriptor = buildFieldDescriptor({ fieldInfo, fieldName, fieldPath, predicates });

    return descriptor.match({
      Ok: (built) => [...descriptors, built],
      Err: (error) => {
        if (error.errorCode !== 'FIELD_IS_SCHEMA_OBJECT_CONTAINER_NOT_LEAF') {
          return descriptors;
        }

        return [
          ...descriptors,
          ...buildFieldDescriptors({
            fields: fieldInfo.fields ?? {},
            parentPath: fieldPath,
            predicates,
          }),
        ];
      },
    });
  }, []);
}
