export type FieldDescriptorKind = 'attribute' | 'belongs-to' | 'derived' | 'field' | 'has-many' | 'schema-object';

export interface ResolvedFieldDisplayInfo {
  readonly kind: FieldDescriptorKind;
  readonly label: string;
  readonly type?: string;
}

export interface DisplayInfo {
  readonly fields: Readonly<Record<string, ResolvedFieldDisplayInfo>>;
  readonly pluralLabel: string;
  readonly resourceLabel: string;
}

export const schemaPackageIdentity = {
  name: '@ember-schema/schema',
} as const;
