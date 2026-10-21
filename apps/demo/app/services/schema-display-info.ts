import SchemaDisplayInfoService from '@ember-schema/ember/services/schema-display-info';
import type { DisplayInfo } from '@ember-schema/schema';

import { POST_DISPLAY_INFO } from '../demo-display-data';

export default class DemoSchemaDisplayInfoService extends SchemaDisplayInfoService {
  protected readonly displayInfo: Readonly<Record<string, DisplayInfo>> = {
    post: POST_DISPLAY_INFO,
  };
}
