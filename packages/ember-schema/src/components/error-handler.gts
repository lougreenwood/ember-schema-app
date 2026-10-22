import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';

import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import {
  faDownLeftAndUpRightToCenter,
  faExclamationCircle,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';

import Button from '@ember-schema-app/ember-schema/components/ui/buttons/button';
import Copyable from '@ember-schema-app/ember-schema/components/ui/copyable';
import ErrorPopover from '@ember-schema-app/ember-schema/components/ui/popovers/error-popover';
import Section from '@ember-schema-app/ember-schema/components/ui/section';
import StatefulField from '@ember-schema-app/ember-schema/components/ui/stateful-field';
import { serializeError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/serialize-error';

/**
 * Appearance for error display.
 *
 * - `"panel"` (default): Full error section with errorCode, collapsible serialized details, and copy button.
 * - `"inline"`: Compact `<ErrorPopover>` icon with hover popover.
 */
export type ErrorHandlerAppearance = 'inline' | 'panel';

interface ErrorHandlerSignature {
  Args: {
    /**
     * Appearance controlling error display style.
     * @default 'panel'
     */
    appearance?: ErrorHandlerAppearance | undefined;
    /** The error to display. */
    error: AppError;
    /**
     * Optional label text shown alongside the error icon in inline mode.
     * The label + icon together form the hover target for the error popover.
     */
    label?: string | undefined;
  };
  Element: undefined;
}

/**
 * Shared error display component used by both TaskHandler and ResultHandler.
 *
 * - `panel`: Prominent error section with Section header, errorCode, collapsible serialized error, and copy button.
 * - `inline`: Bare `<ErrorPopover>` icon with hover popover showing message and errorCode.
 *
 * @example Panel appearance (default)
 * ```hbs
 * <ErrorHandler @error={{error}} />
 * ```
 *
 * @example Inline appearance
 * ```hbs
 * <ErrorHandler @error={{error}} @appearance="inline" />
 * ```
 */
export default class ErrorHandler extends Component<ErrorHandlerSignature> {
  private get isPanelAppearance(): boolean {
    return (this.args.appearance ?? 'panel') !== 'inline';
  }

  <template>
    {{#if this.isPanelAppearance}}
      <StatefulField @initialValue={{false}} as |isExpanded setIsExpanded|>
        <Section
          @title='Error'
          @titleIcon={{faExclamationCircle}}
          @sectionLevel={{2}}
          @layout='compact'
          @hasDivider={{true}}
          @classes={{hash header=(hash base='py-0') body='gap-3'}}
          class='text-left rounded-lg border border-danger-medium bg-surface-solid-1 p-4'
          as |s|
        >
          <s.Header>
            <:subTitle>
              <Copyable @text={{@error.name}} class='text-neutral-soft'>
                <code class='font-mono'>{{@error.name}}</code>
              </Copyable>
            </:subTitle>
          </s.Header>

          <s.Body>
            <div class='flex flex-col gap-2 rounded bg-surface-solid-2 p-3'>
              <span class='text-sm text-neutral-soft'>{{@error.message}}</span>
              <Button
                @appearance='surface'
                @size='xs'
                @icon={{if isExpanded faDownLeftAndUpRightToCenter faUpRightAndDownLeftFromCenter}}
                class='self-start'
                {{on 'click' (fn toggleBoolean isExpanded setIsExpanded)}}
              />

              <pre
                class='text-xs text-default overflow-x-auto whitespace-pre-wrap break-all
                  {{if isExpanded "py-2" "max-h-40 overflow-y-auto border-y border-divider py-2"}}'
              >{{serializeError @error}}</pre>

              <Copyable @text={{serializeError @error}} class='self-end' as |copyable|>
                <copyable.CopyButton @appearance='outlined' @size='xs' @label={{if copyable.copied 'Copied' 'Copy'}} />
              </Copyable>
            </div>
          </s.Body>
        </Section>
      </StatefulField>
    {{else}}
      {{log 'debug:claim-ui-error-inline' @error.errorCode @error.message}}
      {{#let (component ErrorPopover error=@error placement='top') as |popover|}}
        {{#if @label}}
          <popover @showIcon={{true}}>
            <span class='text-xs text-warning'>{{@label}}</span>
          </popover>
        {{else}}
          <popover />
        {{/if}}
      {{/let}}
    {{/if}}
  </template>
}

/**
 * Toggles a boolean value via a setter function.
 * Used with StatefulField for collapsible toggle.
 */
function toggleBoolean(currentValue: boolean, setValue: (value: boolean) => void): void {
  setValue(!currentValue);
}

export { type ErrorHandlerSignature };
