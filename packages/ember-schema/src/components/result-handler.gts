import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { ErrFor, OkFor, Result } from 'true-myth/result';

import Component from '@glimmer/component';

import ErrorHandler, { type ErrorHandlerAppearance } from '@ember-schema-app/ember-schema/components/error-handler';

interface ResultHandlerSignature<TResult extends Result<unknown, AppError>> {
  Args: {
    /**
     * Appearance controlling default error display style.
     * @default 'panel'
     */
    appearance?: ErrorHandlerAppearance | undefined;
    result: TResult;
  };
  Blocks: {
    default: [value: OkFor<TResult>];
    error: [error: ErrFor<TResult>];
    ok: [value: OkFor<TResult>];
  };
  Element: undefined;
}

/**
 * Generic result handler component for displaying Result<T, E> values.
 *
 * Supports two block patterns:
 *
 * 1. Default block only: Shows value on Ok, default error display on Err (controlled by @appearance)
 *    `<ResultHandler @result={{result}} as |value|>{{value}}</ResultHandler>`
 *
 * 2. With error block: Shows value on Ok, custom error UI on Err
 *    `<ResultHandler @result={{result}}><:ok as |value|>{{value}}</:ok><:error as |e|>Custom</:error></ResultHandler>`
 *
 * 3. No blocks: Shows default error display on Err, nothing on Ok
 *    `<ResultHandler @result={{result}} />`
 *
 * Error display appearance:
 * - `"panel"` (default): Full error section with errorCode, collapsible details, copy button
 * - `"inline"`: Compact ErrorPopover icon with hover popover
 */
export default class ResultHandler<TResult extends Result<unknown, AppError>> extends Component<
  ResultHandlerSignature<TResult>
> {
  <template>
    {{#if @result.isOk}}
      {{#if (has-block 'ok')}}
        {{yield @result.value to='ok'}}
      {{else}}
        {{yield @result.value}}
      {{/if}}
    {{else if (has-block 'error')}}
      {{yield @result.error to='error'}}
    {{else}}
      <ErrorHandler @error={{@result.error}} @appearance={{this.appearance}} />
    {{/if}}
  </template>

  private get appearance(): ErrorHandlerAppearance {
    return this.args.appearance ?? 'panel';
  }
}
