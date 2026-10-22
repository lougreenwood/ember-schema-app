import type { TOC } from '@ember/component/template-only';
import type { BadgeSignature } from '@ember-schema-app/ember-schema/components/ui/buttons/button/types';

/**
 * Get intent-based styling classes for the badge pill.
 *
 * Maps intent to background, border, and text colors matching the project's
 * design system (consistent with polling-job-providers-status-badge).
 *
 * Note: Template helper — uses positional args for template convenience.
 */
function getBadgeIntentClasses(intent: BadgeSignature['Args']['intent']): string {
  switch (intent) {
    case 'error':
      return 'bg-danger-medium border-danger-medium text-on-danger';
    case 'warning':
      return 'bg-warning-medium border-warning-medium text-on-warning';
    case 'success':
      return 'bg-success-medium border-success-medium text-on-success';
    case 'info':
      return 'bg-brand-medium border-brand-medium text-on-brand';
    default:
      return 'bg-neutral-medium border-neutral-medium text-on-neutral';
  }
}

/**
 * Badge component — template-only contextual component for Button.
 *
 * Renders a circular/pill-shaped indicator with intent-aware colors.
 * Designed to be yielded by the Button's `:badge` named block and
 * positioned absolutely in the button's top-right corner by the
 * Button's badge wrapper.
 *
 * The badge itself handles only its own visual appearance (shape, colors,
 * content). Positioning is the responsibility of the parent Button component.
 *
 * @example
 * ```hbs
 * <:badge as |Badge|>
 *   <Badge @intent="error">!</Badge>
 * </:badge>
 * ```
 */
const Badge: TOC<BadgeSignature> = <template>
  <span
    class='rounded-full border text-3xs font-bold flex items-center justify-center min-w-4 h-4 px-1 transition-colors
      {{getBadgeIntentClasses @intent}}'
    ...attributes
  >
    {{yield}}
  </span>
</template>;

export default Badge;
