import type {
  DisplayInfo,
  FieldDisplayOverride,
  ResolvedFieldDisplayInfo,
  SchemaRegistry,
  SchemaResult,
  SchemaSource,
  SourceField,
} from './types.js';

export interface ResolveDisplayInfoArgs<TResourceType extends string, TIcon> {
  readonly registry: SchemaRegistry<TResourceType, TIcon>;
  readonly resourceLabels?: Readonly<Record<string, string>>;
  readonly resourceType: TResourceType;
  readonly source: SchemaSource;
}

export function resolveDisplayInfo<TResourceType extends string, TIcon>({
  registry,
  resourceLabels,
  resourceType,
  source,
}: ResolveDisplayInfoArgs<TResourceType, TIcon>): SchemaResult<DisplayInfo<TIcon>> {
  const registryResult = registry.get({ resourceType });

  return registryResult.andThen((entry) =>
    source.fieldsFor({ resourceType }).map((sourceFields) => {
      const resourceLabel = resourceLabels?.[resourceType] ?? humanize({ value: resourceType });
      const fields = resolveFields({
        fieldOverrides: entry.fields,
        fields: sourceFields,
        parentPath: undefined,
      });

      return {
        ...(entry.description === undefined ? {} : { description: entry.description }),
        ...(entry.detailSubtitle === undefined ? {} : { detailSubtitle: entry.detailSubtitle }),
        fields,
        ...(entry.icon === undefined ? {} : { icon: entry.icon }),
        ...(entry.labelField === undefined ? {} : { labelField: entry.labelField }),
        ...(entry.recordLabel === undefined ? {} : { recordLabel: entry.recordLabel }),
        pluralLabel: pluralize({ label: resourceLabel }),
        resourceLabel,
      };
    }),
  );
}

function resolveFields({
  fieldOverrides,
  fields,
  parentPath,
}: {
  fieldOverrides: Readonly<Record<string, FieldDisplayOverride>> | undefined;
  fields: ReadonlyMap<string, SourceField>;
  parentPath: string | undefined;
}): Readonly<Record<string, ResolvedFieldDisplayInfo>> {
  return Array.from(fields.entries()).reduce<Record<string, ResolvedFieldDisplayInfo>>(
    (resolved, [fieldName, field]) => {
      const fieldPath = parentPath === undefined ? fieldName : `${parentPath}.${fieldName}`;
      const override = fieldOverrides?.[fieldPath];
      const label = override?.label ?? humanize({ value: fieldName });

      resolved[fieldName] = {
        ...(field.as === undefined ? {} : { as: field.as }),
        ...(field.fields === undefined
          ? {}
          : {
              fields: resolveFields({ fieldOverrides, fields: toMap({ fields: field.fields }), parentPath: fieldPath }),
            }),
        kind: field.kind,
        label,
        ...(field.type === undefined ? {} : { type: field.type }),
      };

      return resolved;
    },
    {},
  );
}

function toMap({ fields }: { fields: Readonly<Record<string, SourceField>> }): ReadonlyMap<string, SourceField> {
  return Object.entries(fields).reduce(
    (map, [name, nestedField]) => map.set(name, nestedField),
    new Map<string, SourceField>(),
  );
}

export function humanize({ value }: { value: string }): string {
  let name = value;

  if (name.endsWith('Id') && name.length > 2) {
    name = name.slice(0, -2);
  }

  if (name.startsWith('is') && name.length > 2 && name[2] === name[2]?.toUpperCase()) {
    name = name.slice(2);
  }

  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function pluralize({ label }: { label: string }): string {
  if (label.endsWith('s')) return label;
  return `${label}s`;
}

// Keeps the nested-field construction explicit without relying on a second mutable accumulator.
export function flattenFieldNames({
  fields,
  parentPath,
}: {
  fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  parentPath?: string;
}): readonly string[] {
  return Object.entries(fields).reduce<readonly string[]>((names, [fieldName, field]) => {
    const fieldPath = parentPath === undefined ? fieldName : `${parentPath}.${fieldName}`;

    if (field.fields === undefined) {
      return [...names, fieldPath];
    }

    return [...names, ...flattenFieldNames({ fields: field.fields, parentPath: fieldPath })];
  }, []);
}
