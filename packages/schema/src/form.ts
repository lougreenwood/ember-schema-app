export type BooleanFieldVariant = 'checkbox' | 'switch';
export type CurrencySymbolPosition = 'after' | 'before';
export type FieldAppearance = 'default' | 'inline';
export type FieldLayout = 'compact' | 'default';
export type FieldSize = 'lg' | 'md' | 'sm' | 'xs';
export type NumberDisplayType = 'duration' | 'number' | 'percentage';
export type NumberInputControlType = 'input' | 'slider';
export type InvalidSelectionPolicy = 'clear' | 'firstOption';

export interface FieldSelectOptionBase {
  readonly description?: string;
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
}

export type FormSchemaFieldType =
  'boolean' | 'currency' | 'date' | 'multi-input' | 'multi-select' | 'number' | 'select' | 'text';

export interface FormSchemaDescriptor<TCurrencyValue> {
  readonly conditionals?: readonly FormSchemaConditional[];
  readonly description?: string;
  readonly fields: readonly FormSchemaField<TCurrencyValue>[];
  readonly groups?: readonly FormSchemaGroup<TCurrencyValue>[];
  readonly id: string;
  readonly name?: string;
}

export interface FormSchemaGroup<TCurrencyValue> {
  readonly conditionals?: readonly FormSchemaConditional[];
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly fields: readonly FormSchemaField<TCurrencyValue>[];
  readonly groups?: readonly FormSchemaGroup<TCurrencyValue>[];
  readonly id: string;
  readonly name: string;
}

interface FormSchemaFieldBase<TCurrencyValue> {
  readonly appearance?: FieldAppearance;
  readonly conditionals?: readonly FormSchemaConditional[];
  readonly description?: string;
  readonly id: string;
  readonly initialValue?: TCurrencyValue | unknown;
  readonly isDisabled?: boolean;
  readonly isHidden?: boolean;
  readonly isRequired?: boolean;
  readonly label?: string;
  readonly layout?: FieldLayout;
  readonly placeholder?: string;
  readonly size?: FieldSize;
  readonly title?: string;
}

export type FormSchemaField<TCurrencyValue> =
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'boolean' } & FormSchemaBooleanField)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'currency' } & FormSchemaCurrencyField<TCurrencyValue>)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'date' } & FormSchemaDateField)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'multi-input' } & FormSchemaMultiInputField)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'multi-select' } & FormSchemaMultiSelectField)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'number' } & FormSchemaNumberField)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'select' } & FormSchemaSelectField)
  | (FormSchemaFieldBase<TCurrencyValue> & { readonly type: 'text' } & FormSchemaTextField);

export interface FormSchemaBooleanField {
  readonly variant?: BooleanFieldVariant;
}

export interface FormSchemaCurrencyField<TCurrencyValue> {
  readonly inputControlType?: NumberInputControlType;
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
  readonly symbolPosition?: CurrencySymbolPosition;
  readonly valueType?: TCurrencyValue;
}

export interface FormSchemaDateField {
  readonly maxDate?: Date;
  readonly minDate?: Date;
}

export interface FormSchemaMultiInputField {
  readonly allowDuplicates?: boolean;
  readonly dataType: 'number' | 'string';
  readonly displayType?: NumberDisplayType;
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
}

export interface FormSchemaMultiSelectField {
  readonly allowEmpty?: boolean;
  readonly disabledKeys?: readonly string[];
  readonly isFilterable?: boolean;
  readonly items: readonly FieldSelectOptionBase[];
  readonly renderInPlace?: boolean;
  readonly triggerLabel?: string;
}

export interface FormSchemaNumberField {
  readonly displayType?: NumberDisplayType;
  readonly inputControlType?: NumberInputControlType;
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
}

export interface FormSchemaSelectField {
  readonly allowEmpty?: boolean;
  readonly disabledKeys?: readonly string[];
  readonly invalidSelectionPolicy?: InvalidSelectionPolicy;
  readonly isFilterable?: boolean;
  readonly items: readonly FieldSelectOptionBase[];
  readonly renderInPlace?: boolean;
}

export interface FormSchemaTextField {
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly pattern?: string;
}

export type FieldValueType<F extends FormSchemaFieldType, TCurrencyValue> = F extends 'text'
  ? string
  : F extends 'number'
    ? number
    : F extends 'boolean'
      ? boolean
      : F extends 'date'
        ? Date
        : F extends 'select'
          ? FieldSelectOptionBase
          : F extends 'multi-select'
            ? FieldSelectOptionBase[]
            : F extends 'currency'
              ? TCurrencyValue
              : F extends 'multi-input'
                ? number[]
                : never;

export type FormSchemaConditionalEffect =
  CommonConditionalEffect | NumericConditionalEffect | SelectConditionalEffect | TextConditionalEffect;

export interface CommonConditionalEffect {
  readonly enabled?: boolean;
  readonly required?: boolean;
  readonly visible?: boolean;
}

export interface NumericConditionalEffect extends CommonConditionalEffect {
  readonly max?: number;
  readonly min?: number;
  readonly step?: number;
}

export interface SelectConditionalEffect extends CommonConditionalEffect {
  readonly invalidSelectionPolicy?: InvalidSelectionPolicy;
  readonly options?: readonly FieldSelectOptionBase[];
}

export interface TextConditionalEffect extends CommonConditionalEffect {
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly pattern?: string;
}

export interface FormSchemaConditional {
  readonly else?: Readonly<Record<string, FormSchemaConditionalEffect>>;
  readonly then: Readonly<Record<string, FormSchemaConditionalEffect>>;
  readonly when: FormSchemaWhenCondition;
}

export type FormSchemaWhenCondition =
  | {
      readonly field: string;
      readonly operator:
        | 'contains'
        | 'endsWith'
        | 'equals'
        | 'greaterThan'
        | 'greaterThanOrEqual'
        | 'in'
        | 'includes'
        | 'lessThan'
        | 'lessThanOrEqual'
        | 'notEquals'
        | 'notIn'
        | 'notIncludes'
        | 'present'
        | 'startsWith';
      readonly value: unknown;
    }
  | { readonly all: readonly FormSchemaWhenCondition[] }
  | { readonly any: readonly FormSchemaWhenCondition[] }
  | { readonly not: FormSchemaWhenCondition };
