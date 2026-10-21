import type { DisplayInfo } from '@ember-schema/schema';

import Component from '@glimmer/component';
import { service } from '@ember/service';

import type { AbstractSchemaDisplayInfoService } from '../services/schema-display-info/base';

export interface SchemaProbeSignature {
  Args: {
    resourceType: string;
  };
  Blocks: {
    default: [];
  };
}

export default class SchemaProbe extends Component<SchemaProbeSignature> {
  @service('schema-display-info') declare schemaDisplayInfoService: AbstractSchemaDisplayInfoService;

  get displayInfo(): DisplayInfo {
    return this.schemaDisplayInfoService.lookupDisplayInfo({ resourceType: this.args.resourceType });
  }

  get fieldLabel(): string {
    return this.displayInfo.fields['title']?.label ?? 'Unknown';
  }

  <template>
    <div class='schema-probe' data-test-schema-probe>
      <p data-test-resource-label>{{this.displayInfo.resourceLabel}}</p>
      <p data-test-field-label>{{this.fieldLabel}}</p>
    </div>
  </template>
}
