import type { TOC } from '@ember/component/template-only';
import type {
  FieldDescriptor,
  WarpDriveRecord,
} from '@ember-schema-app/ember-schema/components/ui/field-display/types';

import { resolveDisplayComponent } from '@ember-schema-app/ember-schema/components/ui/field-display/registry';

interface FieldDisplaySignature {
  Args: {
    fieldDescriptor: FieldDescriptor;
    model: WarpDriveRecord | undefined;
  };
  Element: HTMLElement;
}

const FieldDisplay: TOC<FieldDisplaySignature> = <template>
  <div class='text-sm'>
    {{#let (resolveDisplayComponent displayType=@fieldDescriptor.displaySpecification.type) as |DisplayComponent|}}
      <DisplayComponent @model={{@model}} @fieldDescriptor={{@fieldDescriptor}} />
    {{/let}}
  </div>
</template>;

export default FieldDisplay;
