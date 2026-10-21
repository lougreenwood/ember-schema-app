import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | schema probe', function (hooks) {
  setupApplicationTest(hooks);

  test('renders the application supplied display data through the add-on service', async function (assert) {
    await visit('/');

    assert.dom('[data-test-resource-label]').hasText('Post');
    assert.dom('[data-test-field-label]').hasText('Title');
    assert.dom('[data-test-typed-label]').hasText('Title');
  });
});
