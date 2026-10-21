import { AbstractSchemaDisplayInfoService } from './schema-display-info/base';
import type { DisplayInfo } from './schema-display-info/base';

export default class SchemaDisplayInfoService extends AbstractSchemaDisplayInfoService {
  protected readonly displayInfo: Readonly<Record<string, DisplayInfo>> = {};
}

declare module '@ember/service' {
  interface Registry {
    'schema-display-info': AbstractSchemaDisplayInfoService;
  }
}
