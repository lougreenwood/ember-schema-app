import type { Result } from 'true-myth';

import type { AppErrorLike } from './types.js';

export interface FieldRendererRegistry<TFieldType extends string, TComponent> {
  readonly renderers: ReadonlyMap<TFieldType, TComponent>;
}

export interface TableRegistry<TResourceType extends string, TComponent> {
  readonly tables: ReadonlyMap<TResourceType, TComponent>;
}

export interface ActionsRegistry<TResourceType extends string, TComponent> {
  readonly actions: ReadonlyMap<TResourceType, TComponent>;
}

export interface RecordLookup<TRecord> {
  peekRelatedRecord({ id, resourceType }: { id: string; resourceType: string }): Result<TRecord, AppErrorLike>;
}
