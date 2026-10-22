import type { TOC } from '@ember/component/template-only';

import formatRelativeSmart from '@ember-schema-app/ember-schema/helpers/format-relative-smart';
import formatDate from 'ember-intl/helpers/format-date';
import formatTime from 'ember-intl/helpers/format-time';
import Tooltip from '@ember-schema-app/ember-schema/components/ui/popovers/tooltip.gts';

export interface RelativeDateSignature {
  Args: {
    date?: Date | undefined;
    interval?: number | undefined;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLElement;
}

/**
 * RelativeDate component displays a date in relative format (e.g., "2 hours ago")
 * with a tooltip showing the full date and time on hover.
 *
 * @example
 * ```hbs
 * <RelativeDate @date={{this.createdAt}} />
 * ```
 */
const RelativeDate: TOC<RelativeDateSignature> = <template>
  {{#if @date}}
    <Tooltip @placement='top' class='cursor-default' ...attributes>
      <:default>
        {{formatRelativeSmart @date interval=@interval}}
      </:default>
      <:content>
        {{formatDate @date}}
        -
        {{formatTime @date timeStyle='long'}}
      </:content>
    </Tooltip>
  {{/if}}
</template>;

export default RelativeDate;
