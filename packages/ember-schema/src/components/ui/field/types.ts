import type { ComponentLike } from '@glint/template';
import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type {
  SectionClasses,
  SectionFactorySignature,
} from '@ember-schema-app/ember-schema/components/ui/section/types';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { Result } from 'true-myth';

export interface FieldSignature {
  Args: {
    /**
     * Label rendered as the field heading. Descriptor-driven callers (`FieldSetField`) supply the resolved descriptor
     * label instead.
     */
    label?: string;
    appearance?: 'default' | 'subtle';
    classes?: SectionClasses;
    /**
     * Section component used to render the field label. Bound by the containing FieldSet so nested fields inherit the
     * correct heading level. Defaults to the root Section component.
     */
    section?: ComponentLike<SectionFactorySignature>;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLElement;
}

export interface FieldSetFieldArgs {
  appearance?: 'default' | 'subtle';
  classes?: SectionClasses;
  fieldDescriptor?: Result<FieldDescriptor, AppError>;
  label?: string;
  model?: WarpDriveRecord;
  section?: ComponentLike<SectionFactorySignature>;
}

export interface FieldSetFieldSignature {
  Args: FieldSetFieldArgs;
  Blocks: {
    default: [];
  };
  Element: HTMLElement;
}
