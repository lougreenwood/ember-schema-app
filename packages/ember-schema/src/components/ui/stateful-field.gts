import Component from '@glimmer/component';
import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { createScheduleWorkHelper } from '@ember-schema-app/ember-schema/utils/_base-utils/schedule-after-render';

/**

 *
 * Signature for the StatefulField component.
 *
 * StatefulField is a headless component that manages local state with lifecycle cleanup.
 * It receives an initial value, tracks mutations via `setValue`, and yields the current
 * value and setter to children.
 */
interface StatefulFieldSignature<T> {
  Args: {
    /**

     *
     * Initial value. This is set once on mount and never re-read. If the initial value
     * needs to change, destroy and recreate the component.
     */
    initialValue?: T;

    /**

     *
     * Cleanup function called:
     *
     * - Before value changes (with oldValue)
     * - On destruction (with current value)
     */
    cleanup?: (value: T) => void;

    /**

     *
     * Called after state updates with { oldValue, newValue }.
     *
     * Called on initialization (oldValue will be undefined) and on subsequent changes.
     */
    onChange?: (args: { newValue: T; oldValue: T | undefined }) => void;
  };
  Blocks: {
    default: [value: T, setValue: (newValue: T) => void];
  };
}

/**

 *
 * StatefulField is a headless component that manages local state with lifecycle cleanup.
 *
 * ## Usage
 *
 * ```hbs
 * <StatefulField
 *   @initialValue={{initialData}}
 *   @onChange={{this.updateRef}}
 *   @cleanup={{this.cleanup}}
 *   as |value setValue|
 * >
 *   <Input @value={{value.name}} @onChange={{fn (mut value.name)}} />
 *   <Button @onClick={{fn setValue newData}}>Update</Button>
 * </StatefulField>
 * ```
 *
 * ## Key Behaviors
 *
 * 1. **Initialization**: Internal `@tracked value` is set to `@initialValue` once at construction.
 *    The arg is never re-read after mount. `@onChange` is called with the initial value.
 *
 * 2. **On `setValue(newValue)`**:
 *    - Calls `@cleanup?.(currentValue)` before the change
 *    - Updates internal `value` to `newValue`
 *    - Calls `@onChange?.({ oldValue, newValue })` after the change (only if value changed)
 *
 * 3. **On destruction** (via `willDestroy` lifecycle hook):
 *    - Calls `@cleanup?.(currentValue)`
 *
 * ## Architecture Notes
 *
 * - **Conditional rendering triggers cleanup**: When a parent value changes causing this
 *   component to unmount, `willDestroy` fires and cleanup runs automatically.
 *
 * - **Children are replaced, not reset**: When parent data changes, child StatefulField
 *   components are destroyed and new ones mount. This is how "reset" semantics work.
 *
 * - **Headless**: This component yields data only; it renders no DOM.
 */
export default class StatefulField<T> extends Component<StatefulFieldSignature<T>> {
  get value(): T {
    return this._value as T;
  }

  set value(newValue: T) {
    const oldValue = this._value;

    // Only proceed if value actually changed (or if this is initialization)
    if (oldValue === newValue && oldValue !== undefined) {
      return;
    }

    // Call cleanup before change (but not on initial set where oldValue is undefined)
    if (oldValue !== undefined) {
      this.args.cleanup?.(oldValue);
    }

    this._value = newValue;

    // Call onChange after update
    this.args.onChange?.({ newValue, oldValue });
  }

  constructor(owner: Owner, args: StatefulFieldSignature<T>['Args']) {
    super(owner, args);

    // Set up lifecycle-aware scheduling for deferred work
    this.#scheduleWork = createScheduleWorkHelper(this);

    // Defer initial onChange call to after render to avoid autotracking errors.
    // The value is already set via the field initializer above.
    if (this.args.onChange) {
      this.#scheduleWork(() => {
        this.args.onChange?.({ newValue: this.value, oldValue: undefined });
      });
    }
  }

  /**

   *
   * Update the internal value. Triggers cleanup and onChange via the setter.
   *
   * @param newValue - The new value to set
   */
  setValue = (newValue: T): void => {
    this.value = newValue;
  };

  willDestroy(): void {
    super.willDestroy();
    this.args.cleanup?.(this.value);
  }

  /**
   * Internal tracked value. Initialized directly from args to avoid autotracking issues.
   */
  @tracked private _value: T | undefined = this.args.initialValue;

  /**
   * Schedule work to run after render pass completes.
   *
   * Used to defer onChange calls during initialization to avoid Glimmer autotracking errors.
   */
  readonly #scheduleWork: (callback: () => void) => void;

  <template>{{yield this.value this.setValue}}</template>
}
