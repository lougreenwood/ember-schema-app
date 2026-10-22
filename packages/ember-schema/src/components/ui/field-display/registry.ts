import type { ComponentLike } from '@glint/template';
import type {
  DisplayFieldType,
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';

import BooleanFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/boolean-field-display';
import DateFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/date-field-display';
import DefaultFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/default-field-display';
import EnumFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/enum-field-display';
import IdentifierFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/identifier-field-display';
import JsonFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/json-field-display';
import NumberFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/number-field-display';
import UrlFieldDisplay from '@ember-schema-app/ember-schema/components/ui/field-display/url-field-display';

type ValueRenderComponent = ComponentLike<{
  Args: { fieldDescriptor: FieldDescriptor; model: WarpDriveRecord | undefined };
  Element: HTMLElement;
}>;

const DISPLAY_COMPONENT_MAP: Record<DisplayFieldType, ValueRenderComponent> = {
  boolean: BooleanFieldDisplay,
  date: DateFieldDisplay,
  enum: EnumFieldDisplay,
  identifier: IdentifierFieldDisplay,
  json: JsonFieldDisplay,
  number: NumberFieldDisplay,
  unknown: DefaultFieldDisplay,
  url: UrlFieldDisplay,
};

export function resolveDisplayComponent({ displayType }: { displayType: DisplayFieldType }): ValueRenderComponent {
  return DISPLAY_COMPONENT_MAP[displayType];
}
