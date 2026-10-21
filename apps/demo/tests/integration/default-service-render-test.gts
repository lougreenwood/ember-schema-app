import DefaultSchemaDisplayInfoService from '@ember-schema/ember/services/schema-display-info';
import SchemaProbe from '@ember-schema/ember/components/schema-probe';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | schema-probe default service', function (hooks) {
  setupRenderingTest(hooks);

  test('uses the add-on default service when the application subclass is absent', async function (assert) {
    this.owner.register('service:schema-display-info', DefaultSchemaDisplayInfoService);

    await render(<template><SchemaProbe @resourceType='post' /></template>);

    assert.dom('[data-test-resource-label]').hasText('Post');
    assert.dom('[data-test-field-label]').hasText('Unknown');
  });
});
