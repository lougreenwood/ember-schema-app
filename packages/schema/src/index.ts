export { resolveDisplayInfo, humanize, pluralize, flattenFieldNames } from './display-info.js';
export { buildFieldDescriptor, buildFieldDescriptors, inferDisplayFieldType } from './field-descriptor.js';
export type {
  DisplayFieldType,
  DisplayTypeInferenceArgs,
  DisplayTypePredicate,
  FieldDescriptor,
  FieldDisplaySpecification,
  FieldValueSource,
} from './field-descriptor.js';
export type {
  BooleanFieldVariant,
  CommonConditionalEffect,
  CurrencySymbolPosition,
  FieldAppearance,
  FieldLayout,
  FieldSelectOptionBase,
  FieldSize,
  FieldValueType,
  FormSchemaBooleanField,
  FormSchemaConditional,
  FormSchemaConditionalEffect,
  FormSchemaCurrencyField,
  FormSchemaDateField,
  FormSchemaDescriptor,
  FormSchemaField,
  FormSchemaFieldType,
  FormSchemaGroup,
  FormSchemaMultiInputField,
  FormSchemaMultiSelectField,
  FormSchemaNumberField,
  FormSchemaSelectField,
  FormSchemaTextField,
  FormSchemaWhenCondition,
  InvalidSelectionPolicy,
  NumberDisplayType,
  NumberInputControlType,
  NumericConditionalEffect,
  SelectConditionalEffect,
  TextConditionalEffect,
} from './form.js';
export type {
  ActionLeaf,
  InteractionSurfaceActionTree,
  InteractionSurfaceGroup,
  InteractionSurfaceLinkTree,
  InteractionSurfaceSubmenu,
  LinkLeaf,
} from './interaction.js';
export type { ActionsRegistry, FieldRendererRegistry, RecordLookup, TableRegistry } from './registry.js';
export { schemaError } from './types.js';
export type {
  AppErrorLike,
  DisplayInfo,
  FieldDescriptorKind,
  FieldDisplayOverride,
  ResolvedFieldDisplayInfo,
  SchemaRegistry,
  SchemaRegistryEntry,
  SchemaResult,
  SchemaSource,
  SourceField,
} from './types.js';
