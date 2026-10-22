import type { ResolvedFieldDisplayInfo } from '@ember-schema-app/schema';
import type { FieldDescriptor } from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type {
  FieldIsHasManyNotLeafError,
  FieldIsSchemaObjectContainerNotLeafError,
} from '@ember-schema-app/ember-schema/components/ui/field-display/errors';
import type { WithLegacy } from '@warp-drive/legacy/model/migration-support';
import type { TypedRecordInstance } from '@warp-drive/core/types/record';
import type { Result } from 'true-myth';

import Service, { service } from '@ember/service';
import {
  buildFieldDescriptor,
  buildFieldDescriptors,
} from '@ember-schema-app/ember-schema/components/ui/field-display/engine';
import type { WarpDriveRecord } from '@ember-schema-app/ember-schema/components/ui/field-display/types';
import type SchemaDisplayInfoService from '@ember-schema-app/ember-schema/services/schema-display-info';

export default class FieldDisplayEngineService extends Service {
  @service('schema-display-info') declare schemaDisplayInfo: SchemaDisplayInfoService<
    Record<string, WithLegacy<TypedRecordInstance>>
  >;

  buildFieldDescriptors({ record }: { record: WarpDriveRecord }): FieldDescriptor[] {
    const fields = this.schemaDisplayInfo.lookupRecordDisplayInfo({ record }).fields;
    return buildFieldDescriptors({ fields });
  }

  buildFieldDescriptor({
    fieldInfo,
    fieldName,
  }: {
    fieldInfo: ResolvedFieldDisplayInfo;
    fieldName: string;
  }): Result<FieldDescriptor, FieldIsHasManyNotLeafError | FieldIsSchemaObjectContainerNotLeafError> {
    return buildFieldDescriptor({ fieldInfo, fieldName });
  }
}
