import type {
  DisplayFieldType,
  FieldDescriptor,
  FieldValueSource,
  SchemaResourceType,
  SchemaResourceTypeMap,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type {
  FieldIsHasManyNotLeafError,
  FieldIsSchemaObjectContainerNotLeafError,
} from '@ember-schema-app/ember-schema/components/ui/field-display/errors';
import type { ResolvedFieldDisplayInfo, ResolvedSchemaObjectFieldDisplayInfo } from '@ember-schema-app/schema';

import { EmptyResultError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/empty-result-error';
import { Result } from 'true-myth';

const BOOLEAN_FIELD_NAME_PREFIXES = /^(is|has|can|should|was|did)([A-Z_])/;
const BOOLEAN_FIELD_NAMES = new Set(['readOnly', 'required']);
const URL_FIELD_NAME_SUFFIXES = /(url|uri|link|website|homepage)$/i;

export function inferDisplayFieldType({
  fieldInfo,
  fieldName,
}: {
  fieldInfo: ResolvedFieldDisplayInfo;
  fieldName: string;
}): Result<DisplayFieldType, FieldIsHasManyNotLeafError | FieldIsSchemaObjectContainerNotLeafError> {
  if (fieldInfo.kind === 'hasMany') {
    return Result.err(
      EmptyResultError.of({
        errorCode: 'FIELD_IS_HASMANY_NOT_LEAF',
        message: 'HasMany fields cannot be rendered as a single display field',
        meta: { fieldName },
        emitLog: false,
      }),
    );
  }
  if (fieldInfo.kind === 'belongsTo') return Result.ok('unknown' as const);

  if (fieldInfo.kind === 'object') return Result.ok('json' as const);

  if (fieldInfo.kind === 'schema-object') {
    return Result.err(
      EmptyResultError.of({
        errorCode: 'FIELD_IS_SCHEMA_OBJECT_CONTAINER_NOT_LEAF',
        emitLog: false,
        message: 'Schema-object container must be expanded into child fields',
        meta: { fieldName, schemaObjectType: fieldInfo.type },
      }),
    );
  }

  if (fieldInfo.type === 'date' || fieldInfo.type === 'optional-date') return Result.ok('date' as const);
  if (fieldInfo.type === 'optional-number') return Result.ok('number' as const);
  if (fieldInfo.type === 'enum') return Result.ok('enum' as const);
  if (BOOLEAN_FIELD_NAME_PREFIXES.test(fieldName) || BOOLEAN_FIELD_NAMES.has(fieldName))
    return Result.ok('boolean' as const);
  if (URL_FIELD_NAME_SUFFIXES.test(fieldName)) return Result.ok('url' as const);
  if (/address/i.test(fieldName)) return Result.ok('identifier' as const);

  return Result.ok('unknown' as const);
}

export function buildFieldDescriptor<TResourceTypeToModel extends object = SchemaResourceTypeMap>({
  fieldInfo,
  fieldName,
}: {
  fieldInfo: ResolvedFieldDisplayInfo;
  fieldName: string;
}): Result<
  FieldDescriptor<TResourceTypeToModel>,
  FieldIsHasManyNotLeafError | FieldIsSchemaObjectContainerNotLeafError
> {
  return inferDisplayFieldType({ fieldInfo, fieldName }).map((displayType) => {
    const valueSource = resolveFieldValueSource<TResourceTypeToModel>({ fieldInfo, fieldName });

    return {
      id: fieldName,
      kind: fieldInfo.kind as FieldDescriptor<TResourceTypeToModel>['kind'],
      label: fieldInfo.name ?? fieldName,
      displaySpecification: { type: displayType } as FieldDescriptor<TResourceTypeToModel>['displaySpecification'],
      valueSource,
    };
  });
}

function resolveFieldValueSource<TResourceTypeToModel extends object = SchemaResourceTypeMap>({
  fieldInfo,
  fieldName,
}: {
  fieldInfo: ResolvedFieldDisplayInfo;
  fieldName: string;
}): FieldValueSource<TResourceTypeToModel> {
  if (fieldInfo.kind === 'belongsTo' || fieldInfo.kind === 'hasMany') {
    return {
      kind: 'relationship',
      relationshipName: fieldName,
      relatedResourceType: fieldInfo.type as SchemaResourceType<TResourceTypeToModel>,
    };
  }

  return { kind: 'path', path: fieldName };
}

export function buildFieldDescriptors<TResourceTypeToModel extends object = SchemaResourceTypeMap>({
  fields,
}: {
  fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
}): FieldDescriptor<TResourceTypeToModel>[] {
  return iterateFields<TResourceTypeToModel>({ fields });
}

function iterateFields<TResourceTypeToModel extends object = SchemaResourceTypeMap>({
  fields,
  prefix,
}: {
  fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  prefix?: string;
}): FieldDescriptor<TResourceTypeToModel>[] {
  const descriptors: FieldDescriptor<TResourceTypeToModel>[] = [];

  for (const [fieldName, fieldInfo] of Object.entries(fields)) {
    const prefixedName = prefix !== undefined ? `${prefix}.${fieldName}` : fieldName;

    buildFieldDescriptor<TResourceTypeToModel>({ fieldInfo, fieldName: prefixedName }).match({
      Ok: (descriptor) => {
        descriptors.push(descriptor);
      },
      Err: (error) => {
        switch (error.errorCode) {
          case 'FIELD_IS_HASMANY_NOT_LEAF':
            break;
          case 'FIELD_IS_SCHEMA_OBJECT_CONTAINER_NOT_LEAF':
            descriptors.push(
              ...iterateFields<TResourceTypeToModel>({
                fields: (fieldInfo as ResolvedSchemaObjectFieldDisplayInfo).fields,
                prefix: prefixedName,
              }),
            );
            break;
        }
      },
    });
  }

  return descriptors;
}
