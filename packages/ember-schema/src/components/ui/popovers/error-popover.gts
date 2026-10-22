import type { TOC } from '@ember/component/template-only';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { InfoPopoverPlacement } from '@ember-schema-app/ember-schema/components/ui/popovers/info-popover';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import Copyable from '@ember-schema-app/ember-schema/components/ui/copyable';
import InfoPopover from '@ember-schema-app/ember-schema/components/ui/popovers/info-popover';
import { serializeError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/serialize-error';

interface ErrorPopoverSignature {
  Args: {
    /**
     * The error to display.
     */
    error: AppError;
    /**
     * Placement of the popover relative to the trigger.
     * @default 'top'
     */
    placement?: InfoPopoverPlacement | undefined;
    /**
     * Whether to show an exclamation icon inline before the trigger content.
     * Only applies when using a custom trigger block.
     * @default false
     */
    showIcon?: boolean | undefined;
  };
  Blocks: {
    /**
     * Custom trigger element. If not provided, shows a red exclamation icon.
     */
    default: [];
  };
  Element: HTMLSpanElement;
}

/**
 * ErrorPopover component for displaying AppError details in a hover popover.
 *
 * Shows:
 * - Error message
 * - Error code with copy button
 * - Full serialized error in a code block with copy button
 *
 * @example Default trigger (exclamation icon)
 * ```hbs
 * <ErrorPopover @error={{error}} />
 * ```
 *
 * @example Custom trigger with inline icon
 * ```hbs
 * <ErrorPopover @error={{error}} @showIcon={{true}}>
 *   <span class="text-danger">Error occurred</span>
 * </ErrorPopover>
 * ```
 *
 * @example Custom trigger without icon
 * ```hbs
 * <ErrorPopover @error={{error}}>
 *   <span class="text-2xs text-danger-medium">Something went wrong</span>
 * </ErrorPopover>
 * ```
 */
const ErrorPopover: TOC<ErrorPopoverSignature> = <template>
  <InfoPopover @placement={{if @placement @placement 'top'}}>
    <:trigger as |t|>
      {{#if (has-block)}}
        <span {{t.anchor}} class='inline-flex items-center gap-1 cursor-help hover:opacity-80' ...attributes>
          {{#if @showIcon}}
            <FaIcon @icon={{faExclamationCircle}} @size='2xs' class='text-danger-medium' />
          {{/if}}
          {{yield}}
        </span>
      {{else}}
        <span {{t.anchor}} class='text-danger cursor-help' ...attributes>
          <FaIcon @icon={{faExclamationCircle}} @size='sm' />
        </span>
      {{/if}}
    </:trigger>

    <:content>
      <div class='flex flex-col gap-2 max-w-xs'>
        <div class='text-neutral-strong'>{{@error.message}}</div>
        <Copyable @text={{@error.errorCode}} as |c|>
          <span class='inline-flex items-center gap-1 text-neutral-soft text-2xs'>
            <code class='font-mono'>{{@error.errorCode}}</code>
            <c.CopyButton />
          </span>
        </Copyable>
        <div class='border-t border-divider pt-1'>
          <div class='relative'>
            <pre
              class='max-h-32 overflow-auto text-2xs text-neutral-medium font-mono whitespace-pre-wrap'
            >{{serializeError @error}}</pre>
            <Copyable @text={{serializeError @error}} as |c|>
              <span class='absolute top-0 right-0'>
                <c.CopyButton />
              </span>
            </Copyable>
          </div>
        </div>
      </div>
    </:content>
  </InfoPopover>
</template>;

export default ErrorPopover;

export { type ErrorPopoverSignature };
