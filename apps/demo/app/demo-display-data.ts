import type { DisplayInfo } from '@ember-schema-app/ember-schema/services/schema-display-info/base';

export const POST_DISPLAY_INFO = {
  fields: {
    body: {
      kind: 'attribute',
      label: 'Body',
    },
    title: {
      kind: 'attribute',
      label: 'Title',
    },
  },
  pluralLabel: 'Posts',
  resourceLabel: 'Post',
} as const satisfies DisplayInfo;

export type PostFieldName = keyof typeof POST_DISPLAY_INFO.fields;

export function resolvePostFieldLabel({ field }: { field: PostFieldName }): string {
  return POST_DISPLAY_INFO.fields[field].label;
}
