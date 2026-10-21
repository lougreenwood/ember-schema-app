import Component from '@glimmer/component';

import { resolvePostFieldLabel } from '../demo-display-data';

export default class DemoSummary extends Component {
  get typedFieldLabel(): string {
    return resolvePostFieldLabel({ field: 'title' });
  }

  <template>
    <p data-test-typed-label>{{this.typedFieldLabel}}</p>
  </template>
}
