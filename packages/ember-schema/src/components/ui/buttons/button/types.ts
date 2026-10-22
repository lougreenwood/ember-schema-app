import type { FlipProp, IconDefinition, RotateProp, SizeProp, Transform } from '@fortawesome/fontawesome-svg-core';
import type { ComponentLike } from '@glint/template';
import type {
  ExtendSignature,
  SignatureExtension,
} from '@ember-schema-app/ember-schema/types/type-utils/extend-signature';
import type { Task } from 'true-myth/task';
import type { ReactiveTaskState } from '@ember-schema-app/ember-schema/utils/resources/reactive-task';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { ButtonSignature as FrontileButtonSignature } from 'frontile';

/**
 * Intent variants for the Badge contextual component.
 *
 * Controls the badge's background, border, and text colors.
 */
export type BadgeIntent = 'error' | 'info' | 'success' | 'warning';

/**
 * Signature for the Badge contextual component yielded by Button's `:badge` block.
 *
 * The Badge renders a circular/pill indicator with intent-aware colors. Content is provided via the default block
 * (icon, text, number).
 */
export interface BadgeSignature {
  Args: {
    /**
     * Optional class override for the badge element.
     */
    class?: string;

    /**
     * Visual intent controlling badge colors. Maps to design system semantic colors (danger, warning, success, brand).
     */
    intent?: BadgeIntent;
  };
  Blocks: { default: [] };
  Element: HTMLSpanElement;
}

/**
 * App button appearance variants.
 *
 * Frontile built-in: 'default' | 'outlined' | 'minimal' | 'custom'
 *
 * App custom:
 *
 * - 'minimal-outlined' - like outlined, but with border only on hover
 * - 'surface' - theme-adaptive buttons that blend with their surface
 *
 * When adding new appearances:
 *
 * 1. Add to frontile-customizations.ts (runtime)
 * 2. Update this type (compile-time)
 * 3. Update types/frontile.d.ts module augmentation
 */
export type ButtonAppearance = 'custom' | 'default' | 'minimal' | 'minimal-outlined' | 'outlined' | 'surface';

/**
 * Block params yielded by Button.
 *
 * All properties are always present, but some are only meaningful in certain modes:
 *
 * - Renderless mode (`@isRenderless={{true}}`): Use `classNames`, `Content`, `classes`
 * - Normal mode: Use `Label`, `AfterLabel`
 */
export interface ButtonBlockParams {
  AfterLabel: ComponentLike<AfterLabelSignature>;
  Badge: ComponentLike<BadgeSignature>;
  classes: ButtonClasses;
  classNames: string;
  Content: ComponentLike<ButtonContentSignature>;
  Label: ComponentLike<LabelSignature>;
}

/**
 * Classes hash for styling internal button elements.
 *
 * Uses Tailwind Merge when `base` is forwarded to Frontile's `@class`, ensuring proper class deduplication without
 * needing `!important`.
 *
 * Includes index signature for compatibility with ClassesHash and merge-classes helper.
 */
export interface ButtonClasses {
  [key: string]: string | undefined;
  afterLabel?: string;
  badge?: string;
  base?: string;
  icon?: string;
  label?: string;
}

/**
 * App button intent variants.
 *
 * Frontile built-in: 'default' | 'primary' | 'success' | 'warning' | 'danger'
 *
 * App custom:
 *
 * - 'secondary' - complementary accent (pink)
 * - 'info' - neutral informational (cyan)
 * - 'subtle' - muted colors for auxiliary actions
 *
 * When adding new intents:
 *
 * 1. Add to frontile-customizations.ts (runtime)
 * 2. Update this type (compile-time)
 * 3. Update types/frontile.d.ts module augmentation
 */
export type ButtonIntent = 'danger' | 'default' | 'info' | 'primary' | 'secondary' | 'subtle' | 'success' | 'warning';

/**
 * Alias for ButtonBlockParams - used in renderless mode.
 *
 * @deprecated Use ButtonBlockParams directly.
 */
export type ButtonRenderlessBlockParams = ButtonBlockParams;

/**
 * App button size variants.
 *
 * Frontile built-in: 'xs' | 'sm' | 'lg' | 'xl'
 *
 * App custom:
 *
 * - '2xs' - extra extra small
 * - 'md' - medium (explicit default)
 *
 * When adding new sizes:
 *
 * 1. Add to frontile-customizations.ts (runtime)
 * 2. Update this type (compile-time)
 * 3. Update types/frontile.d.ts module augmentation
 */
export type ButtonShape = 'circle' | 'default';

/**
 * App Button component signature.
 *
 * Extends Frontile's ButtonSignature with:
 *
 * - Extended appearance, intent, and size variants
 * - Font Awesome icon support
 * - Classes hash for internal element styling
 * - AfterLabel named block for badges/indicators
 *
 * Inherits from Frontile:
 *
 * - OnPress callback with proper PressEvent typing
 * - Type attribute ('button' | 'submit' | 'reset')
 * - IsRenderless mode
 * - IsInGroup flag
 * - Element: HTMLButtonElement
 *
 * Use `ExtendButtonSignature` to create button-like components that inherit this signature.
 */
export type ButtonSignature = ExtendSignature<
  FrontileButtonSignature,
  {
    Args: AppButtonArgs;
    Blocks: {
      afterLabel?: [];
      badge?: [{ Badge: ComponentLike<BadgeSignature> }];
      default: [ButtonBlockParams];
    };
  }
>;

export type ButtonSize = '2xs' | 'lg' | 'md' | 'sm' | 'xl' | 'xs';

/**
 * Extends ButtonSignature with custom Args, Blocks, and/or Element.
 *
 * Uses the shared `ExtendSignature` utility for consistent signature extension behavior.
 *
 * @example
 *
 * ```ts
 * // LinkButton adds route args, changes Element to anchor
 * type LinkButtonSignature = ExtendButtonSignature<{
 *   Args: { route: string; model?: unknown };
 *   Element: HTMLAnchorElement;
 * }>;
 *
 * // ToggleButton adds isSelected arg
 * type ToggleButtonSignature = ExtendButtonSignature<{
 *   Args: { isSelected?: boolean; onChange?: (isSelected: boolean) => void };
 * }>;
 * ```
 */
export type ExtendButtonSignature<TExtension extends SignatureExtension> = ExtendSignature<ButtonSignature, TExtension>;

/**
 * Options forwarded to the internal `<FaIcon>` when an `@icon` is provided.
 *
 * Allows callers to control icon animation, orientation, and sizing without polluting the Button signature with
 * individual `@iconSpin`, `@iconFlip`, etc. args.
 *
 * Only the subset of FaIcon args that are useful for button icons is exposed. Unused FaIcon args (border, listItem,
 * pull, mask, symbol) are intentionally omitted.
 */
export interface IconOptions {
  /**
   * Flip the icon horizontally, vertically, or both. Useful for mirroring arrows (prev/next, undo/redo).
   */
  flip?: FlipProp;

  /**
   * Pulse animation (8-step rotation). A subtler alternative to `spin`.
   */
  pulse?: boolean;

  /**
   * Static rotation in degrees: 90, 180, or 270. Useful for rotating chevrons to indicate open/closed state.
   */
  rotation?: RotateProp;

  /**
   * Override icon size independently from button size. Uses Font Awesome's size scale ('xs', 'sm', 'lg', '2x', etc.).
   */
  size?: SizeProp;

  /**
   * Continuous spinning animation. Typically paired with `faSpinner`.
   */
  spin?: boolean;

  /**
   * Power Transforms for fine-tuned icon positioning and sizing. Accepts a Transform object or shorthand string (e.g.,
   * 'grow-6', 'shrink-2 left-4').
   */
  transform?: string | Transform;
}

interface AfterLabelSignature {
  Args: { class?: string };
  Blocks: { default: [] };
  Element: HTMLSpanElement;
}

/**
 * App-specific args that extend Frontile's ButtonArgs.
 *
 * These are the additional args App's Button component accepts beyond what Frontile provides.
 */
interface AppButtonBaseArgs {
  /**
   * Extended appearance variants including App custom appearances.
   */
  appearance?: ButtonAppearance;
  /**
   * Classes hash for styling internal button elements.
   */
  classes?: ButtonClasses;
  /**
   * Disables the rendered button element. Forwarded to the underlying `<button>` element.
   */
  disabled?: boolean;
  /**
   * Font Awesome icon to display before the label.
   */
  icon?: IconDefinition;
  /**
   * Alt text for the circular image when @imageUrl is provided.
   */
  imageAlt?: string;
  /**
   * Image URL to display as a circular image instead of a Font Awesome icon. When provided alongside @icon, the image
   * takes precedence in resolved state. Task pending (spinner mode) still overrides to faSpinner.
   */
  imageUrl?: string;
  /**
   * Options forwarded to the internal `<FaIcon>` component (spin, flip, rotation, etc.). Only applied when `@icon` is
   * provided.
   *
   * Usage: `@iconOptions={{hash spin=true}}`
   */
  iconOptions?: IconOptions;
  /**
   * Extended intent variants including App custom intents.
   */
  intent?: ButtonIntent;
  /**
   * Optional label text. Can also use default block for label content.
   */
  label?: string;
  /**
   * Shape variant controlling border-radius.
   *
   * - `'circle'` — renders as a circle (`rounded-full aspect-square`). Best paired with an icon and no label.
   * - `'default'` — standard shape (inherits Frontile's `rounded-sm`).
   */
  shape?: ButtonShape;

  /**
   * Extended size variants including App custom sizes.
   */
  size?: ButtonSize;
}

type AppButtonTaskArgs = AppButtonBaseArgs & {
  /**
   * When true AND @task is pending, disables the button. Only valid when @task is provided.
   */
  disableOnTaskPending?: boolean;

  /**
   * Task for async-aware visual states:
   *
   * - Pending: icon → spinner or skeleton bar (controlled by @taskLoadingStyle)
   * - Rejected: error badge in badge slot
   * - Resolved: normal icon rendering
   */
  task: Task<unknown, AppError> | ReactiveTaskState<unknown, AppError>;

  /**
   * Visual style for the loading state when @task is pending:
   *
   * - `'spinner'`: icon becomes faSpinner (for action-on-click tasks, e.g. submit buttons)
   * - `'skeleton'`: icon unchanged, label becomes pulsing bar (for data-loading tasks, e.g. dropdown triggers)
   *
   * @default 'spinner'
   */
  taskLoadingStyle?: 'skeleton' | 'spinner';
};

type AppButtonNoTaskArgs = AppButtonBaseArgs & {
  disableOnTaskPending?: never;
  task?: never;
  taskLoadingStyle?: never;
};

type AppButtonArgs = AppButtonTaskArgs | AppButtonNoTaskArgs;

interface ButtonContentSignature {
  Args: {
    classes: ButtonClasses;
    icon?: IconDefinition;
    iconOptions?: IconOptions;
    iconSizeClass: string;
    label?: string;
  };
  Blocks: { default: [] };
  Element: undefined;
}

interface LabelSignature {
  Args: { class?: string };
  Blocks: { default: [] };
  Element: HTMLSpanElement;
}
