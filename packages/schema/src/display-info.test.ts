import assert from 'node:assert/strict';
import test from 'node:test';
import { Result } from 'true-myth';

import { flattenFieldNames, resolveDisplayInfo } from './display-info.js';
import type { DisplayInfo, SchemaRegistry, SchemaSource, SourceField } from './types.js';

const registry: SchemaRegistry<'post', string> = {
  get({ resourceType }) {
    if (resourceType !== 'post') {
      return Result.err({
        errorCode: 'SCHEMA_RESOURCE_NOT_REGISTERED',
        message: `Resource type ${resourceType} is not registered`,
        name: 'SchemaError',
      });
    }

    return Result.ok({
      description: 'A post',
      fields: {
        title: { label: 'Headline' },
      },
      icon: 'post-icon',
      labelField: 'title',
    });
  },
  has({ resourceType }) {
    return resourceType === 'post';
  },
};

const source: SchemaSource = {
  fieldsFor() {
    const fields = new Map<string, SourceField>([
      ['title', { kind: 'attribute', type: 'string' }],
      ['author', { kind: 'belongs-to', type: 'author' }],
      [
        'metadata',
        {
          fields: {
            published: { kind: 'attribute', type: 'optional-date' },
            rating: { kind: 'attribute', type: 'optional-number' },
          },
          kind: 'schema-object',
          type: 'post-metadata',
        },
      ],
    ]);

    return Result.ok(fields);
  },
};

function expectOk<T>(result: Result<T, unknown>): T {
  return result.match({
    Ok: (value) => value,
    Err: (error) => {
      assert.fail(`Expected a successful result, received ${JSON.stringify(error)}`);
    },
  });
}

test('resolves labels, field overrides, pluralization, and nested schema objects', () => {
  const displayInfo: DisplayInfo<string> = expectOk(resolveDisplayInfo({ registry, resourceType: 'post', source }));

  assert.equal(displayInfo.resourceLabel, 'Post');
  assert.equal(displayInfo.pluralLabel, 'Posts');
  assert.equal(displayInfo.description, 'A post');
  assert.equal(displayInfo.icon, 'post-icon');

  const title = displayInfo.fields.title;
  const author = displayInfo.fields.author;
  const metadata = displayInfo.fields.metadata;
  assert.ok(title);
  assert.ok(author);
  assert.ok(metadata);
  assert.equal(title.label, 'Headline');
  assert.equal(author.kind, 'belongs-to');
  assert.equal(metadata.kind, 'schema-object');
  const metadataFields = metadata.fields;
  assert.ok(metadataFields);
  const rating = metadataFields.rating;
  assert.ok(rating);
  assert.equal(rating.type, 'optional-number');
  assert.deepEqual(flattenFieldNames({ fields: displayInfo.fields }), [
    'title',
    'author',
    'metadata.published',
    'metadata.rating',
  ]);
});

test('returns the registry error for an unregistered resource', () => {
  const result = resolveDisplayInfo({ registry, resourceType: 'comment', source });

  assert.equal(
    result.match({
      Ok: () => 'ok',
      Err: (error) => error.errorCode,
    }),
    'SCHEMA_RESOURCE_NOT_REGISTERED',
  );
});
