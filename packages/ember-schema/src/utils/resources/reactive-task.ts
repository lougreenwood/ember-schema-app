import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { Task } from 'true-myth/task';

import { trackedObject } from '@ember/reactive/collections';
import { resource, resourceFactory } from 'ember-resources';

/**
 * Reactive state when task is pending
 */
export interface ReactiveTaskPending {
  readonly isPending: true;
  readonly isRejected: false;
  readonly isResolved: false;
  readonly reason: undefined;
  readonly value: undefined;
}

/**
 * Reactive state when task is rejected
 */
export interface ReactiveTaskRejected<_TValue, TError extends AppError> {
  readonly isPending: false;
  readonly isRejected: true;
  readonly isResolved: false;
  readonly reason: TError;
  readonly value: undefined;
}

/**
 * Reactive state when task is resolved
 */
export interface ReactiveTaskResolved<TValue> {
  readonly isPending: false;
  readonly isRejected: false;
  readonly isResolved: true;
  readonly reason: undefined;
  readonly value: TValue;
}

/**
 * Discriminated union of all reactive task states
 */
export type ReactiveTaskState<TValue, TError extends AppError> =
  ReactiveTaskPending | ReactiveTaskRejected<TValue, TError> | ReactiveTaskResolved<TValue>;

/**
 * Internal mutable state shape used by trackedObject
 */
interface ReactiveTaskStateMutable<TValue, TError extends AppError> {
  isPending: boolean;
  isRejected: boolean;
  isResolved: boolean;
  reason: TError | undefined;
  value: TValue | undefined;
}

/**
 * Input type for reactiveTask - accepts either a Task directly or a thunk returning a Task.
 *
 * Also accepts ReactiveTaskState for idempotent pass-through: if a caller accidentally passes an already-wrapped
 * reactive state (e.g., from useTask), it is returned as-is instead of attempting to re-wrap it.
 */
type TaskInput<TValue, TError extends AppError> =
  | (() => ReactiveTaskState<TValue, TError> | Task<TValue, TError>)
  | ReactiveTaskState<TValue, TError>
  | Task<TValue, TError>;

/**
 * Runtime check: true-myth Task implements PromiseLike and exposes `.then()`. ReactiveTaskState (trackedObject proxy)
 * has the same state fields but no `.then()`. This is the discriminator.
 */
function isTask<TValue, TError extends AppError>(
  value: ReactiveTaskState<TValue, TError> | Task<TValue, TError>,
): value is Task<TValue, TError> {
  return typeof (value as Task<TValue, TError>).then === 'function';
}

/**
 * Function-based resource that wraps a TrueMyth Task and makes its state reactive.
 *
 * Since Task state getters (isResolved, isRejected, isPending, value, reason) are not tracked by Ember's reactivity
 * system, this resource subscribes to the Task via `.then()` and updates reactive properties when it settles.
 *
 * The returned state is a discriminated union - when `isResolved` is `true`, `value` is guaranteed to be `TValue` (not
 * undefined). When `isRejected` is `true`, `reason` is guaranteed to be `TError`.
 *
 * **Idempotent:** If the input is already a `ReactiveTaskState` (e.g., from a prior `useTask` or `reactiveTask` call),
 * it is returned as-is without re-wrapping. This makes the resource resilient to accidental double-wrapping.
 *
 * @example Class usage with @use decorator (thunk for reactivity)
 *
 * ```gts
 * import { use } from 'ember-resources';
 * import { reactiveTask } from '@ember-schema-app/ember-schema/utils/resources/reactive-task';
 *
 * class MyComponent extends Component {
 *   @use taskState = reactiveTask(() => this.args.task);
 *
 *   get result() {
 *     const state = this.taskState;
 *     if (state.isResolved) {
 *       // TypeScript knows state.value is TValue here
 *       return state.value;
 *     }
 *   }
 * }
 * ```
 *
 * @example Template usage
 *
 * ```gts
 * import { reactiveTask } from '@ember-schema-app/ember-schema/utils/resources/reactive-task';
 *
 * <template>
 * {{#let (reactiveTask @task) as |task|}}
 * {{#if task.isResolved}}
 * {{task.value}}
 * {{else if task.isRejected}}
 * {{task.reason}}
 * {{else}}
 * Loading...
 * {{/if}}
 * {{/let}}
 * </template>
 * ```
 */
function reactiveTaskResource<TValue, TError extends AppError>(taskInput: TaskInput<TValue, TError>) {
  return resource(({ on }) => {
    // Support both direct Task and thunk (function returning Task) for reactivity with @use
    const taskOrState = typeof taskInput === 'function' ? taskInput() : taskInput;

    // Idempotent pass-through: if the input is already a ReactiveTaskState (e.g., from useTask
    // or a prior reactiveTask call), return it directly instead of attempting to re-wrap.
    // Discriminator: true-myth Task has .then() (PromiseLike), ReactiveTaskState does not.
    if (!isTask(taskOrState)) {
      return taskOrState;
    }

    const task = taskOrState;

    const state = trackedObject<ReactiveTaskStateMutable<TValue, TError>>({
      isPending: task.isPending,
      isRejected: task.isRejected,
      isResolved: task.isResolved,
      reason: task.isRejected ? task.reason : undefined,
      value: task.isResolved ? task.value : undefined,
    });

    let isDestroyed = false;

    // Subscribe to task settlement via .then() instead of RAF polling.
    // Task implements PromiseLike — .then() fires once as a microtask when the task settles,
    // delivering a Result that we pattern-match to update tracked state. This avoids the RAF
    // polling race condition where a RAF callback could write tracked state during component
    // teardown, scheduling a re-render on an already-destroying helper.
    if (task.isPending) {
      void task.then((result) => {
        if (isDestroyed) return;

        result.match({
          Ok: (value) => {
            state.isResolved = true;
            state.isPending = false;
            state.value = value;
          },
          Err: (reason) => {
            state.isRejected = true;
            state.isPending = false;
            state.reason = reason;
          },
        });
      });
    }

    on.cleanup(() => {
      isDestroyed = true;
    });

    // Cast to discriminated union - the runtime object maintains the invariants
    // that make this safe (e.g., value is only set when isResolved becomes true)
    return state as ReactiveTaskState<TValue, TError>;
  });
}

export const reactiveTask = resourceFactory(reactiveTaskResource);
