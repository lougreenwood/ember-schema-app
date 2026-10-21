export type LegacyModelKeys =
  | '_createSnapshot'
  | 'adapterError'
  | 'belongsTo'
  | 'changedAttributes'
  | 'constructor'
  | 'currentState'
  | 'deleteRecord'
  | 'destroyRecord'
  | 'dirtyType'
  | 'errors'
  | 'hasDirtyAttributes'
  | 'hasMany'
  | 'isDeleted'
  | 'isDestroyed'
  | 'isDestroying'
  | 'isEmpty'
  | 'isError'
  | 'isLoaded'
  | 'isLoading'
  | 'isNew'
  | 'isSaving'
  | 'isValid'
  | 'reload'
  | 'rollbackAttributes'
  | 'save'
  | 'serialize'
  | 'unloadRecord';

export type DisplayableFieldNames<TModel> = Exclude<Extract<keyof TModel, string>, 'id' | LegacyModelKeys>;

export interface FieldDisplayOverride {
  readonly name: string;
}

export interface ResolvedAttributeFieldDisplayInfo {
  readonly kind: 'attribute';
  readonly name: string;
  readonly type: string | undefined;
}

export interface ResolvedBelongsToFieldDisplayInfo {
  readonly kind: 'belongsTo';
  readonly name: string;
  readonly type: string;
}

export interface ResolvedDerivedFieldDisplayInfo {
  readonly kind: 'derived';
  readonly name: string;
  readonly type: string;
}

export interface ResolvedGenericFieldDisplayInfo {
  readonly kind: 'field';
  readonly name: string;
  readonly type: string | undefined;
}

export interface ResolvedHasManyFieldDisplayInfo {
  readonly as?: string;
  readonly kind: 'hasMany';
  readonly name: string;
  readonly type: string;
}

export interface ResolvedObjectFieldDisplayInfo {
  readonly kind: 'object';
  readonly name: string;
}

export interface ResolvedSchemaObjectFieldDisplayInfo {
  readonly fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  readonly kind: 'schema-object';
  readonly name: string;
  readonly type: string;
}

export type ResolvedFieldDisplayInfo =
  | ResolvedAttributeFieldDisplayInfo
  | ResolvedBelongsToFieldDisplayInfo
  | ResolvedDerivedFieldDisplayInfo
  | ResolvedGenericFieldDisplayInfo
  | ResolvedHasManyFieldDisplayInfo
  | ResolvedObjectFieldDisplayInfo
  | ResolvedSchemaObjectFieldDisplayInfo;

export interface ResolvedDisplayInfo<TModel, TIcon> {
  readonly description?: string;
  readonly detailSubTitle?: string;
  readonly fields: Readonly<Record<DisplayableFieldNames<TModel>, ResolvedFieldDisplayInfo>>;
  readonly icon?: TIcon;
  readonly labelField?: string;
  readonly pluralLabel: string;
  readonly recordLabel?: SchemaRegistryEntry<TModel, TIcon>['recordLabel'];
  readonly resourceLabel: string;
}

export interface ResolvedRecordDisplayInfo<TModel, TIcon> extends ResolvedDisplayInfo<TModel, TIcon> {
  readonly resolvedRecordLabel: string;
}

export type SchemaRegistryEntry<TModel, TIcon> = {
  readonly description?: string;
  readonly detailSubTitle?: string;
  readonly fields?: Readonly<Record<string, FieldDisplayOverride>>;
  readonly icon: TIcon;
  readonly taxonomyPath?: string;
} & (
  | {
      readonly labelField: string;
      readonly recordLabel?:
        ((record: TModel) => string) | ((record: TModel, labelFieldValue: string) => string) | string;
    }
  | {
      readonly labelField?: undefined;
      readonly recordLabel: ((record: TModel) => string) | string;
    }
);

export interface SchemaTaxonomyGroupDefinition<TIcon> {
  readonly description?: string;
  readonly icon?: TIcon;
  readonly label: string;
  readonly subgroups?: Readonly<Record<string, SchemaTaxonomyGroupDefinition<TIcon>>>;
}

export interface ResolvedSchemaTaxonomyGroup<TResourceType extends string, TIcon> {
  readonly description?: string;
  readonly icon?: TIcon;
  readonly items: readonly ResolvedSchemaTaxonomyItem<TResourceType, TIcon>[];
  readonly label: string;
  readonly path: string;
  readonly subgroups: readonly ResolvedSchemaTaxonomyGroup<TResourceType, TIcon>[];
}

export interface ResolvedSchemaTaxonomyItem<TResourceType extends string, TIcon> {
  readonly description: string;
  readonly icon?: TIcon;
  readonly label: string;
  readonly resourceType: TResourceType;
  readonly route: string;
}
