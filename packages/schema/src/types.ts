import type { Result } from 'true-myth';

export interface AppErrorLike {
  readonly errorCode: string;
  readonly message: string;
  readonly name: string;
}

export type SchemaResult<T> = Result<T, AppErrorLike>;

export function schemaError({ errorCode, message }: { errorCode: string; message: string }): AppErrorLike {
  return {
    errorCode,
    message,
    name: 'SchemaError',
  };
}

export type FieldDescriptorKind =
  'attribute' | 'belongs-to' | 'derived' | 'field' | 'has-many' | 'id' | 'object' | 'schema-object';

export interface SourceField {
  readonly kind: FieldDescriptorKind;
  readonly type?: string;
  readonly fields?: Readonly<Record<string, SourceField>>;
  readonly as?: string;
}

export interface SchemaSource {
  fieldsFor({ resourceType }: { resourceType: string }): SchemaResult<ReadonlyMap<string, SourceField>>;
}

export interface FieldDisplayOverride {
  readonly label: string;
}

export interface SchemaRegistryEntry<TIcon = unknown> {
  readonly description?: string;
  readonly detailSubtitle?: string;
  readonly fields?: Readonly<Record<string, FieldDisplayOverride>>;
  readonly icon?: TIcon;
  readonly labelField?: string;
  readonly recordLabel?: (record: unknown) => string;
  readonly taxonomyPath?: string;
}

export interface SchemaRegistry<TResourceType extends string = string, TIcon = unknown> {
  get({ resourceType }: { resourceType: TResourceType }): SchemaResult<SchemaRegistryEntry<TIcon>>;
  has({ resourceType }: { resourceType: string }): boolean;
}

export interface ResolvedFieldDisplayInfo {
  readonly as?: string;
  readonly fields?: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  readonly kind: FieldDescriptorKind;
  readonly label: string;
  readonly type?: string;
}

export interface DisplayInfo<TIcon = unknown> {
  readonly description?: string;
  readonly detailSubtitle?: string;
  readonly fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  readonly icon?: TIcon;
  readonly labelField?: string;
  readonly pluralLabel: string;
  readonly recordLabel?: (record: unknown) => string;
  readonly resourceLabel: string;
}
