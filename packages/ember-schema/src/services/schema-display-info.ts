import type {
  ResolvedBelongsToFieldDisplayInfo,
  ResolvedDisplayInfo,
  ResolvedFieldDisplayInfo,
  ResolvedHasManyFieldDisplayInfo,
  ResolvedRecordDisplayInfo,
  ResolvedSchemaObjectFieldDisplayInfo,
  ResolvedSchemaTaxonomyGroup,
  ResolvedSchemaTaxonomyItem,
  SchemaRegistryEntry,
  SchemaTaxonomyGroupDefinition,
} from '@ember-schema-app/schema';
import type { RoutableSchema } from '@ember-schema-app/ember-schema/services/schema-display-info/types';
import type { FieldSchema } from '@warp-drive/core/types/schema/fields';
import type { Store } from '@warp-drive/core';
import type { TypedRecordInstance } from '@warp-drive/core/types/record';
import type { WithLegacy } from '@warp-drive/legacy/model/migration-support';

import Service, { service } from '@ember/service';
import { recordIdentifierFor } from '@warp-drive/core';
import { pluralize, singularize } from 'ember-inflector';
import camelCase from 'lodash-es/camelCase';
import startCase from 'lodash-es/startCase';

/** Supply data and register store schemas before the first lookup; results are cached for the service lifetime. */
export default abstract class SchemaDisplayInfoService<
  TResourceTypeToModel extends object,
  TIcon = unknown,
> extends Service {
  @service('store') declare store: InstanceType<typeof Store>;

  protected abstract readonly schemaRegistry: ReadonlyMap<
    string,
    SchemaRegistryEntry<TResourceTypeToModel[keyof TResourceTypeToModel & string], TIcon>
  >;

  protected abstract readonly resourceTypeLabels: ReadonlyMap<string, string>;

  protected abstract readonly schemaTaxonomy: Readonly<Record<string, SchemaTaxonomyGroupDefinition<TIcon>>>;

  protected abstract readonly routableSchemas: readonly RoutableSchema[];

  buildExploreTaxonomy(): readonly ResolvedSchemaTaxonomyGroup<keyof TResourceTypeToModel & string, TIcon>[] {
    const itemsByPath = new Map<string, ResolvedSchemaTaxonomyItem<keyof TResourceTypeToModel & string, TIcon>[]>();
    const unknownItems: ResolvedSchemaTaxonomyItem<keyof TResourceTypeToModel & string, TIcon>[] = [];

    for (const { resourceType, routing } of this.routableSchemas) {
      if (!this.isRegisteredResourceType(resourceType)) continue;

      const item = this.#buildResolvedSchemaTaxonomyItem({ resourceType, route: routing.indexRoute });
      const taxonomyPath = this.lookupTaxonomyPath({ resourceType });

      if (taxonomyPath === undefined || this.lookupTaxonomyGroup({ taxonomyPath }) === undefined) {
        unknownItems.push(item);
        continue;
      }

      const existingItems = itemsByPath.get(taxonomyPath);
      if (existingItems === undefined) {
        itemsByPath.set(taxonomyPath, [item]);
        continue;
      }

      existingItems.push(item);
    }

    const groups = this.#buildResolvedSchemaTaxonomyGroups({
      groups: this.schemaTaxonomy,
      itemsByPath,
      parentPath: undefined,
    });

    const groupsWithUnknown =
      unknownItems.length === 0
        ? groups
        : [
            ...groups,
            {
              items: unknownItems,
              label: 'Unknown',
              path: 'unknown',
              subgroups: [],
            },
          ];

    return groupsWithUnknown;
  }

  lookupDisplayInfo<const TResourceType extends keyof TResourceTypeToModel & string>({
    resourceType,
  }: {
    resourceType: TResourceType;
  }): ResolvedDisplayInfo<TResourceTypeToModel[TResourceType], TIcon> {
    const cached = this.#cache.get(resourceType);
    if (cached !== undefined) {
      // The cache entry was populated for this resource key; its model parameter follows the same key.
      return cached as ResolvedDisplayInfo<TResourceTypeToModel[TResourceType], TIcon>;
    }

    const entry = this.schemaRegistry.get(resourceType);
    const resourceLabel =
      this.resourceTypeLabels.get(resourceType) ?? this.#humanizeFieldName({ fieldName: resourceType });
    const pluralLabel = pluralize(resourceLabel);

    const fields = this.#resolveFields({ resourceType });

    const result: ResolvedDisplayInfo<TResourceTypeToModel[TResourceType], TIcon> =
      entry === undefined
        ? ({ fields, pluralLabel, resourceLabel } as ResolvedDisplayInfo<TResourceTypeToModel[TResourceType], TIcon>)
        : ({
            description: entry.description,
            detailSubTitle: entry.detailSubTitle,
            fields,
            icon: entry.icon,
            labelField: entry.labelField,
            pluralLabel,
            recordLabel:
              entry.recordLabel ??
              (entry.labelField !== undefined
                ? (record: TResourceTypeToModel[TResourceType]) => {
                    const value: unknown = Reflect.get(record as object, entry.labelField!);
                    return typeof value === 'string' && value.length > 0 ? value : resourceLabel;
                  }
                : undefined),
            resourceLabel,
          } as ResolvedDisplayInfo<TResourceTypeToModel[TResourceType], TIcon>);

    this.#cache.set(
      resourceType,
      result as ResolvedDisplayInfo<TResourceTypeToModel[keyof TResourceTypeToModel & string], TIcon>,
    );
    return result;
  }

  lookupRecordDisplayInfo<const TResourceType extends keyof TResourceTypeToModel & string>({
    record,
  }: {
    record: TResourceTypeToModel[TResourceType];
  }): ResolvedRecordDisplayInfo<TResourceTypeToModel[TResourceType], TIcon>;
  lookupRecordDisplayInfo({
    record,
  }: {
    record: WithLegacy<TypedRecordInstance>;
  }): ResolvedRecordDisplayInfo<TResourceTypeToModel[keyof TResourceTypeToModel & string], TIcon>;
  lookupRecordDisplayInfo({
    record,
  }: {
    record: WithLegacy<TypedRecordInstance>;
  }): ResolvedRecordDisplayInfo<TResourceTypeToModel[keyof TResourceTypeToModel & string], TIcon> {
    const resourceType = recordIdentifierFor(record).type;

    if (!this.isRegisteredResourceType(resourceType)) {
      const resourceLabel = this.#humanizeFieldName({ fieldName: resourceType });
      const hasName = 'name' in record && typeof (record as Record<string, unknown>).name === 'string';
      const resolvedRecordLabel = hasName ? ((record as Record<string, unknown>).name as string) : resourceLabel;

      return {
        fields: {} as ResolvedRecordDisplayInfo<
          TResourceTypeToModel[keyof TResourceTypeToModel & string],
          TIcon
        >['fields'],
        pluralLabel: pluralize(resourceLabel),
        resolvedRecordLabel,
        resourceLabel,
      };
    }

    const displayInfo = this.lookupDisplayInfo({ resourceType });

    let resolvedRecordLabel: string;

    switch (typeof displayInfo.recordLabel) {
      case 'function': {
        if (displayInfo.labelField !== undefined) {
          const labelValue: unknown = Reflect.get(record, displayInfo.labelField);
          resolvedRecordLabel = (displayInfo.recordLabel as (recordValue: typeof record, value: string) => string)(
            record,
            String(labelValue ?? ''),
          );
        } else {
          resolvedRecordLabel = (displayInfo.recordLabel as (recordValue: typeof record) => string)(record);
        }
        break;
      }
      case 'string':
        resolvedRecordLabel = displayInfo.recordLabel;
        break;
      default: {
        const hasName = 'name' in record && typeof (record as Record<string, unknown>).name === 'string';
        resolvedRecordLabel = hasName
          ? ((record as Record<string, unknown>).name as string)
          : displayInfo.resourceLabel;
        break;
      }
    }

    return { ...displayInfo, resolvedRecordLabel };
  }

  lookupTaxonomyGroup({ taxonomyPath }: { taxonomyPath: string }): SchemaTaxonomyGroupDefinition<TIcon> | undefined {
    return taxonomyPath
      .split('.')
      .reduce<
        | Readonly<Record<string, SchemaTaxonomyGroupDefinition<TIcon>>>
        | SchemaTaxonomyGroupDefinition<TIcon>
        | undefined
      >((currentValue, pathSegment, index) => {
        if (currentValue === undefined) return undefined;

        if (index === 0) {
          return (currentValue as Readonly<Record<string, SchemaTaxonomyGroupDefinition<TIcon>>>)[pathSegment];
        }

        return (currentValue as SchemaTaxonomyGroupDefinition<TIcon>).subgroups?.[pathSegment];
      }, this.schemaTaxonomy) as SchemaTaxonomyGroupDefinition<TIcon> | undefined;
  }

  lookupTaxonomyPath<const TResourceType extends keyof TResourceTypeToModel & string>({
    resourceType,
  }: {
    resourceType: TResourceType;
  }): string | undefined {
    return this.schemaRegistry.get(resourceType)?.taxonomyPath;
  }

  lookupTopLevelTaxonomyGroupLabel<const TResourceType extends keyof TResourceTypeToModel & string>({
    resourceType,
  }: {
    resourceType: TResourceType;
  }): string | undefined {
    const taxonomyPath = this.lookupTaxonomyPath({ resourceType });
    if (taxonomyPath === undefined) return undefined;

    const topLevelGroupKey = taxonomyPath.split('.').at(0);
    if (topLevelGroupKey === undefined) return undefined;

    return this.schemaTaxonomy[topLevelGroupKey as keyof typeof this.schemaTaxonomy]?.label;
  }

  resolveFieldLabel<const TResourceType extends keyof TResourceTypeToModel & string>({
    fieldPath,
    model,
  }: {
    fieldPath: string;
    model: TResourceTypeToModel[TResourceType];
  }): string;
  resolveFieldLabel<const TResourceType extends keyof TResourceTypeToModel & string>({
    fieldPath,
    resourceType,
  }: {
    fieldPath: string;
    resourceType: TResourceType;
  }): string;
  resolveFieldLabel<const TResourceType extends keyof TResourceTypeToModel & string>({
    fieldPath,
    model,
    resourceType,
  }: {
    fieldPath: string;
    model?: TResourceTypeToModel[TResourceType];
    resourceType?: TResourceType;
  }): string {
    if (model !== undefined) {
      const displayInfo = this.lookupRecordDisplayInfo<TResourceType>({ record: model });
      return this.#resolveNestedFieldLabel({ displayInfo, fieldPath });
    }

    const displayInfo = this.lookupDisplayInfo({ resourceType: resourceType! });
    return this.#resolveNestedFieldLabel({ displayInfo, fieldPath });
  }

  isRegisteredResourceType(resourceType: string): resourceType is keyof TResourceTypeToModel & string {
    return this.schemaRegistry.has(resourceType);
  }

  readonly #cache = new Map<
    keyof TResourceTypeToModel & string,
    ResolvedDisplayInfo<TResourceTypeToModel[keyof TResourceTypeToModel & string], TIcon>
  >();

  #buildResolvedSchemaTaxonomyGroups({
    groups,
    itemsByPath,
    parentPath,
  }: {
    groups: Readonly<Record<string, SchemaTaxonomyGroupDefinition<TIcon>>>;
    itemsByPath: ReadonlyMap<string, ResolvedSchemaTaxonomyItem<keyof TResourceTypeToModel & string, TIcon>[]>;
    parentPath: string | undefined;
  }): ResolvedSchemaTaxonomyGroup<keyof TResourceTypeToModel & string, TIcon>[] {
    return Object.entries(groups).reduce<ResolvedSchemaTaxonomyGroup<keyof TResourceTypeToModel & string, TIcon>[]>(
      (resolvedGroups, [groupKey, group]) => {
        const path = parentPath === undefined ? groupKey : `${parentPath}.${groupKey}`;
        const subgroups = group.subgroups
          ? this.#buildResolvedSchemaTaxonomyGroups({ groups: group.subgroups, itemsByPath, parentPath: path })
          : [];
        const items = itemsByPath.get(path) ?? [];

        if (items.length === 0 && subgroups.length === 0) return resolvedGroups;

        resolvedGroups.push({
          description: group.description,
          icon: group.icon,
          items,
          label: group.label,
          path,
          subgroups,
        });

        return resolvedGroups;
      },
      [],
    );
  }

  #buildResolvedSchemaTaxonomyItem({
    resourceType,
    route,
  }: {
    resourceType: keyof TResourceTypeToModel & string;
    route: string;
  }): ResolvedSchemaTaxonomyItem<keyof TResourceTypeToModel & string, TIcon> {
    const displayInfo = this.lookupDisplayInfo({ resourceType });

    return {
      description: displayInfo.description ?? '',
      icon: displayInfo.icon,
      label: displayInfo.pluralLabel,
      resourceType,
      route,
    };
  }

  #humanizeFieldName({ fieldName }: { fieldName: string }): string {
    let name = fieldName;

    if (name.endsWith('Id') && name.length > 2) {
      name = name.slice(0, -2);
    }

    if (name.startsWith('is') && name.length > 2 && name[2] === name[2]?.toUpperCase()) {
      name = name.slice(2);
    }

    return startCase(name);
  }

  #isDisplayableField({ field }: { field: FieldSchema }): boolean {
    return (
      (field.kind === 'attribute' ||
        field.kind === 'derived' ||
        field.kind === 'field' ||
        field.kind === 'object' ||
        field.kind === 'schema-object') &&
      field.type !== '@legacy' &&
      field.type !== 'schema-meta'
    );
  }

  #resolveBelongsToFieldInfo({
    field,
    fieldName,
  }: {
    field: FieldSchema;
    fieldName: string;
  }): ResolvedBelongsToFieldDisplayInfo {
    const fieldType = field.type as string;
    const relatedTypeCamel = camelCase(fieldType);
    if (relatedTypeCamel === fieldName) {
      const relatedLabel = this.resourceTypeLabels.get(fieldType) ?? this.#humanizeFieldName({ fieldName: fieldType });
      return { kind: 'belongsTo', name: relatedLabel, type: fieldType };
    }
    return { kind: 'belongsTo', name: this.#humanizeFieldName({ fieldName }), type: fieldType };
  }

  #resolveFieldDisplayInfo({
    field,
    fieldName,
  }: {
    field: FieldSchema;
    fieldName: string;
  }): ResolvedFieldDisplayInfo | undefined {
    switch (field.kind) {
      case 'attribute':
        return { kind: 'attribute', name: this.#humanizeFieldName({ fieldName }), type: field.type ?? undefined };
      case 'belongsTo':
        return this.#resolveBelongsToFieldInfo({ field, fieldName });
      case 'derived':
        if (!this.#isDisplayableField({ field })) return undefined;
        return { kind: 'derived', name: this.#humanizeFieldName({ fieldName }), type: field.type };
      case 'field':
        return { kind: 'field', name: this.#humanizeFieldName({ fieldName }), type: field.type ?? undefined };
      case 'hasMany':
        return this.#resolveHasManyFieldInfo({ field, fieldName });
      case 'object':
        return { kind: 'object', name: this.#humanizeFieldName({ fieldName }) };
      case 'schema-object':
        return this.#resolveSchemaObjectFieldInfo({ field, fieldName });
      default:
        return undefined;
    }
  }

  #resolveFields({ resourceType }: { resourceType: string }): Readonly<Record<string, ResolvedFieldDisplayInfo>> {
    let schemaFields: Map<string, FieldSchema>;
    try {
      schemaFields = this.store.schema.fields({ type: resourceType });
    } catch {
      return {};
    }

    const entry = this.schemaRegistry.get(resourceType);
    const fieldOverrides = entry?.fields;

    return schemaFields.entries().reduce<Record<string, ResolvedFieldDisplayInfo>>((record, [fieldName, field]) => {
      const resolved = this.#resolveFieldDisplayInfo({ field, fieldName });
      if (resolved === undefined) return record;

      const override = fieldOverrides?.[fieldName];
      record[fieldName] = override !== undefined ? { ...resolved, name: override.name } : resolved;

      return record;
    }, {});
  }

  #resolveHasManyFieldInfo({
    field,
    fieldName,
  }: {
    field: Extract<FieldSchema, { kind: 'hasMany' }>;
    fieldName: string;
  }): ResolvedHasManyFieldDisplayInfo {
    const fieldType = field.type as string;
    const singularFieldName = singularize(fieldName);
    const relatedTypeCamel = camelCase(fieldType);
    const asValue = field.options?.as;
    if (singularFieldName === relatedTypeCamel) {
      const relatedLabel = this.resourceTypeLabels.get(fieldType) ?? this.#humanizeFieldName({ fieldName: fieldType });
      return { kind: 'hasMany', name: pluralize(relatedLabel), type: fieldType, as: asValue };
    }
    return { kind: 'hasMany', name: this.#humanizeFieldName({ fieldName }), type: fieldType, as: asValue };
  }

  #resolveNestedFieldLabel({
    displayInfo,
    fieldPath,
  }: {
    displayInfo: Pick<ResolvedDisplayInfo<TResourceTypeToModel[keyof TResourceTypeToModel & string], TIcon>, 'fields'>;
    fieldPath: string;
  }): string {
    const segments = fieldPath.split('.');
    let currentFields: Readonly<Record<string, ResolvedFieldDisplayInfo>> = displayInfo.fields;

    return segments
      .map((segment) => {
        const fieldInfo = currentFields[segment];
        if (fieldInfo?.kind === 'schema-object') {
          currentFields = fieldInfo.fields;
        }
        return fieldInfo?.name ?? this.#humanizeFieldName({ fieldName: segment });
      })
      .join(' › ');
  }

  #resolveSchemaObjectFieldInfo({
    field,
    fieldName,
  }: {
    field: FieldSchema;
    fieldName: string;
  }): ResolvedSchemaObjectFieldDisplayInfo {
    const fieldType = field.type as string;
    const childFields = this.#resolveFields({ resourceType: fieldType });
    return {
      fields: childFields,
      kind: 'schema-object',
      name: this.#humanizeFieldName({ fieldName }),
      type: fieldType,
    };
  }
}
