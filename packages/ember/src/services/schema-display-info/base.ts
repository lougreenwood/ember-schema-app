import type { DisplayInfo } from '@ember-schema/schema';
import Service from '@ember/service';

export abstract class AbstractSchemaDisplayInfoService extends Service {
  protected abstract readonly displayInfo: Readonly<Record<string, DisplayInfo>>;

  lookupDisplayInfo({ resourceType }: { resourceType: string }): DisplayInfo {
    const displayInfo = this.displayInfo[resourceType];

    if (displayInfo !== undefined) {
      return displayInfo;
    }

    const resourceLabel = this.#humanizeResourceType({ resourceType });

    return {
      fields: {},
      pluralLabel: this.#pluralize({ label: resourceLabel }),
      resourceLabel,
    };
  }

  #humanizeResourceType({ resourceType }: { resourceType: string }): string {
    const label = resourceType
      .split('-')
      .filter((word) => word.length > 0)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');

    return label.length > 0 ? label : 'Resource';
  }

  #pluralize({ label }: { label: string }): string {
    return label.endsWith('s') ? label : `${label}s`;
  }
}
