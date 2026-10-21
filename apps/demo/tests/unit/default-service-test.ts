import DefaultSchemaDisplayInfoService from '@ember-schema/ember/services/schema-display-info';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | schema-display-info default', function (hooks) {
  setupTest(hooks);

  test('the add-on default service can resolve an empty display entry', function (assert) {
    const service = new DefaultSchemaDisplayInfoService(this.owner);

    const displayInfo = service.lookupDisplayInfo({ resourceType: 'post' });

    assert.strictEqual(displayInfo.resourceLabel, 'Post');
    assert.deepEqual(displayInfo.fields, {});
  });
});
