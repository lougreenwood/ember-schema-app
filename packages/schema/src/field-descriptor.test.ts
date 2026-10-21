import assert from 'node:assert/strict';
import test from 'node:test';
import { Result } from 'true-myth';

import { buildFieldDescriptors, inferDisplayFieldType } from './field-descriptor.js';
import type { ResolvedFieldDisplayInfo } from './types.js';

function expectOk<T>(result: Result<T, unknown>): T {
  return result.match({
    Ok: (value) => value,
    Err: (error) => {
      assert.fail(`Expected a successful result, received ${JSON.stringify(error)}`);
    },
  });
}

test('consult app predicates before built-in inference', () => {
  const fieldInfo: ResolvedFieldDisplayInfo = {
    kind: 'schema-object',
    label: 'Price',
    type: 'serialized-currency-value',
  };

  const displayType = expectOk(
    inferDisplayFieldType({
      fieldInfo,
      fieldName: 'price',
      fieldPath: 'price',
      predicates: [({ fieldPath }) => (fieldPath === 'price' ? 'currency-value' : undefined)],
    }),
  );

  assert.equal(displayType, 'currency-value');
});

test('expands schema-object containers and keeps hasMany fields out of detail leaves', () => {
  const fields: Record<string, ResolvedFieldDisplayInfo> = {
    author: { kind: 'belongs-to', label: 'Author', type: 'author' },
    metadata: {
      fields: {
        published: { kind: 'attribute', label: 'Published', type: 'optional-date' },
        rating: { kind: 'attribute', label: 'Rating', type: 'optional-number' },
      },
      kind: 'schema-object',
      label: 'Metadata',
      type: 'post-metadata',
    },
    tags: { kind: 'has-many', label: 'Tags', type: 'tag' },
    title: { kind: 'attribute', label: 'Title', type: 'string' },
  };

  const descriptors = buildFieldDescriptors({ fields });

  assert.deepEqual(
    descriptors.map((descriptor) => [descriptor.id, descriptor.displaySpecification.type]),
    [
      ['author', 'id'],
      ['metadata.published', 'date'],
      ['metadata.rating', 'number'],
      ['title', 'unknown'],
    ],
  );
});
