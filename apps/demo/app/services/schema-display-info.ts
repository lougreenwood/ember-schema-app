import SchemaDisplayInfoService from '@ember-schema-app/ember-schema/services/schema-display-info';
import type { DisplayInfo } from '@ember-schema-app/ember-schema/services/schema-display-info/base';

import { POST_DISPLAY_INFO } from '../demo-display-data';

export default class DemoSchemaDisplayInfoService extends SchemaDisplayInfoService {
  protected readonly displayInfo: Readonly<Record<string, DisplayInfo>> = {
    post: POST_DISPLAY_INFO,
  };
}
