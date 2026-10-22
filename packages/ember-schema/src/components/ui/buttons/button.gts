import type { TOC } from '@ember/component/template-only';
import type { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import type { AppError } from '@ember-schema-app/ember-schema/vendor/shared-utils/errors/app-error';
import type { ReactiveTaskState } from '@ember-schema-app/ember-schema/utils/resources/reactive-task';
import type {
  ButtonClasses,
  ButtonSignature,
  IconOptions,
} from '@ember-schema-app/ember-schema/components/ui/buttons/button/types';
import type { ButtonSignature as FrontileButtonSignature } from 'frontile';

interface AfterLabelSignature {
  Args: { class?: string };
  Blocks: { default: [] };
  Element: HTMLSpanElement;
}

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

import { concat, hash } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { use } from 'ember-resources';
import Badge from '@ember-schema-app/ember-schema/components/ui/buttons/button/badge';
import CircleImage from '@ember-schema-app/ember-schema/components/ui/circle-image';
import { reactiveTask } from '@ember-schema-app/ember-schema/utils/resources/reactive-task';
import { mergeClasses, mergeClassStrings } from '@ember-schema-app/ember-schema/utils/merge-classes';
import { Task } from 'true-myth/task';
import { Button as FrontileButton } from 'frontile';

/**
 * Label wrapper component - template-only.
 * Wraps label content with proper styling.
 * Accepts @class arg for pre-binding via component helper.
 */
const Label: TOC<LabelSignature> = <template>
  <span class={{@class}} ...attributes>
    {{yield}}
  </span>
</template>;

/**
 * AfterLabel wrapper component - template-only.
 * Wraps after-label content (badges, indicators) with proper styling.
 * Accepts @class arg for pre-binding via component helper.
 */
const AfterLabel: TOC<AfterLabelSignature> = <template>
  <span class={{@class}} ...attributes>
    {{yield}}
  </span>
</template>;

/**
 * ButtonContent component - template-only.
 * Renders the icon and label with proper styling.
 * Used by Button in renderless mode to yield content rendering to consumers.
 */
const ButtonContent: TOC<ButtonContentSignature> = <template>
  {{#if @icon}}
    <FaIcon
      @icon={{@icon}}
      @fixedWidth={{true}}
      @spin={{if @iconOptions.spin true false}}
      @pulse={{if @iconOptions.pulse true false}}
      @flip={{@iconOptions.flip}}
      @rotation={{@iconOptions.rotation}}
      @size={{@iconOptions.size}}
      @transform={{@iconOptions.transform}}
      class='{{@iconSizeClass}} {{@classes.icon}}'
    />
  {{/if}}

  {{#if @label}}
    <span class={{@classes.label}}>{{@label}}</span>
  {{else if (has-block)}}
    <span class={{@classes.label}}>
      {{yield}}
    </span>
  {{/if}}
</template>;

/**
 * Noop component for yielding in normal mode where Content is not used.
 * Provides type-safe placeholder that renders nothing.
 */
const NoopContent: TOC<ButtonContentSignature> = <template></template>;

interface TaskErrorBadgeSignature {
  Args: {
    classes?: string;
    iconSize?: SizeProp;
  };
  Element: HTMLSpanElement;
}

const TaskErrorBadge: TOC<TaskErrorBadgeSignature> = <template>
  <span class='absolute -top-2 -right-2 z-10 pointer-events-none {{@classes}}' ...attributes>
    <FaIcon @icon={{faExclamationCircle}} @size={{if @iconSize @iconSize 'sm'}} class='text-danger-medium' />
  </span>
</template>;

/**
 * App custom Button component.
 *
 * Extends Frontile's Button with:
 * - `@icon` argument for Font Awesome icons
 * - `afterLabel` named block for badges and indicators
 *
 * Features:
 * - All Frontile Button features (appearances, intents, sizes, loading, disabled)
 * - Icon support with automatic spacing
 * - After-label slot for badges/counts
 *
 * For buttons that should blend with their surface and become prominent on interaction,
 * use `@appearance="surface"`. This appearance is theme-adaptive and works
 * on both light and dark backgrounds. Combine with `@intent="primary"` for selected
 * states that show brand color, or `@intent="default"` for neutral selected states.
 *
 * Usage:
 * ```hbs
 * {{! Simple button }}
 * <Ui::Button @appearance="default" @onPress={{this.handleClick}}>
 *   Click me
 * </Ui::Button>
 *
 * {{! Surface button - theme-adaptive, blends with background }}
 * <Ui::Button
 *   @appearance="surface"
 *   @intent="default"
 *   @icon={{faChartLine}}
 *   @label="Overview"
 *   @onPress={{this.navigate}}
 * />
 *
 * {{! Button with icon and badge }}
 * <Ui::Button
 *   @appearance="surface"
 *   @intent="default"
 *   @icon={{faList}}
 *   @size="sm"
 *   @onPress={{this.openList}}
 * >
 *   Focus List
 *   <:afterLabel>
 *     <Badge @count={{this.count}} />
 *   </:afterLabel>
 * </Ui::Button>
 * ```
 */
export default class Button extends Component<ButtonSignature> {
  @use private _taskState = reactiveTask(() => this.args.task ?? Task.resolve()) as ReactiveTaskState<
    unknown,
    AppError
  >;

  /**
   * Fixed square size class per button size for `shape="circle"`.
   * Uses `size-*` (sets both width and height) so the button is always square
   * regardless of Frontile's asymmetric horizontal/vertical padding.
   */
  get _isTaskSkeletonLoading(): boolean {
    return this._taskState.isPending && this.args.taskLoadingStyle === 'skeleton';
  }

  get displayIcon(): IconDefinition | undefined {
    if (this._taskState.isPending && this.args.taskLoadingStyle !== 'skeleton') return faSpinner;

    return this.args.icon;
  }

  get displayIconOptions(): IconOptions {
    if (this._taskState.isPending && this.args.taskLoadingStyle !== 'skeleton') return { spin: true };

    return this.args.iconOptions ?? {};
  }

  get effectiveDisabled(): boolean {
    if (this.args.disableOnTaskPending && this._taskState.isPending) return true;

    return this.args.disabled ?? false;
  }

  get isTaskRejected(): boolean {
    return this._taskState.isRejected;
  }

  get circleSizeClass(): string {
    switch (this.args.size) {
      case '2xs':
        return 'size-4';
      case 'lg':
        return 'size-9';
      case 'sm':
        return 'size-7';
      case 'xl':
        return 'size-11';
      case 'xs':
        return 'size-5';
      default:
        return 'size-8'; // md
    }
  }

  /**
   * Merged classes combining internal defaults with external @classes arg.
   * Uses mergeClasses for Tailwind-aware merging with proper precedence.
   */
  get classes(): ButtonClasses {
    return mergeClasses(this._classes, this.args.classes);
  }

  /**
   * Cast appearance to Frontile's type for compatibility.
   * We extend Frontile with 'minimal-outlined' and 'surface' appearances via registerCustomStyles.
   */
  get frontileAppearance(): FrontileButtonSignature['Args']['appearance'] {
    return this.args.appearance as FrontileButtonSignature['Args']['appearance'];
  }

  /**
   * Cast intent to Frontile's type for compatibility.
   * We extend Frontile with 'secondary' and 'info' intents via registerCustomStyles.
   */
  get frontileIntent(): FrontileButtonSignature['Args']['intent'] {
    return this.args.intent as FrontileButtonSignature['Args']['intent'];
  }

  /**
   * Cast size to Frontile's type for compatibility.
   * We extend Frontile with '2xs' and 'md' sizes via registerCustomStyles.
   */
  get frontileSize(): FrontileButtonSignature['Args']['size'] {
    return this.args.size as FrontileButtonSignature['Args']['size'];
  }

  /**
   * Map button size to Frontile icon size class.
   * Uses Frontile's coordinated icon/typography scale for consistent sizing.
   */
  get iconSizeClass(): string {
    switch (this.args.size) {
      case '2xs':
        return 'size-icon-3xs';
      case 'lg':
        return 'size-icon-md';
      case 'sm':
        return 'size-icon-xs';
      case 'xl':
        return 'size-icon-lg';
      case 'xs':
        return 'size-icon-2xs';
      default:
        return 'size-icon-sm'; // md and undefined
    }
  }

  /**
   * Additional classes driven by the `@shape` arg.
   * `circle` forces equal square dimensions and fully-rounded corners.
   */
  get shapeClass(): string {
    if (this.args.shape !== 'circle') return '';
    return `rounded-full ${this.circleSizeClass}`;
  }

  mergeRenderlessClassNames = (frontileClassNames: string): string => {
    return mergeClassStrings([frontileClassNames], this.classes.base);
  };

  /**
   * Internal default classes for button elements.
   * These are the component's structural defaults before external overrides.
   */
  get _classes(): ButtonClasses {
    return {
      afterLabel: 'flex-shrink-0',
      badge: 'absolute -top-2 -right-2 z-10 pointer-events-none',
      base: `relative flex flex-row items-center justify-center gap-2 ${this.shapeClass}`.trim(),
      icon: 'flex-shrink-0',
      label: 'flex-1 empty:hidden text-left truncate',
    };
  }

  <template>
    {{!
      We extend Frontile's button with custom variants (appearance: 'surface', size: '2xs')
      via registerCustomStyles. Use getters to cast to Frontile's types for template compatibility.
    }}
    {{#if @isRenderless}}
      {{! Renderless mode: yield classNames, Content component, and classes for consumer to compose }}
      <FrontileButton
        @appearance={{this.frontileAppearance}}
        @isRenderless={{true}}
        @isInGroup={{@isInGroup}}
        @intent={{this.frontileIntent}}
        @size={{this.frontileSize}}
        as |btn|
      >
        {{yield
          (hash
            classNames=(this.mergeRenderlessClassNames btn.classNames)
            Content=(component
              ButtonContent
              icon=@icon
              label=@label
              iconSizeClass=this.iconSizeClass
              iconOptions=@iconOptions
              classes=this.classes
            )
            classes=this.classes
            Label=(component Label class=this.classes.label)
            AfterLabel=(component AfterLabel class=this.classes.afterLabel)
            Badge=Badge
          )
        }}
      </FrontileButton>
    {{else}}
      {{! Normal mode: render button with content }}
      <FrontileButton
        @appearance={{this.frontileAppearance}}
        @class={{this.classes.base}}
        disabled={{this.effectiveDisabled}}
        @isInGroup={{@isInGroup}}
        @intent={{this.frontileIntent}}
        @size={{this.frontileSize}}
        @type={{@type}}
        @onPress={{@onPress}}
        ...attributes
      >
        {{#if this.displayIcon}}
          <FaIcon
            @icon={{this.displayIcon}}
            @fixedWidth={{true}}
            @spin={{if this.displayIconOptions.spin true false}}
            @pulse={{if this.displayIconOptions.pulse true false}}
            @flip={{this.displayIconOptions.flip}}
            @rotation={{this.displayIconOptions.rotation}}
            @size={{this.displayIconOptions.size}}
            @transform={{this.displayIconOptions.transform}}
            class='{{this.iconSizeClass}} {{this.classes.icon}}'
          />
        {{else if @imageUrl}}
          <CircleImage @imageUrl={{@imageUrl}} @name={{@imageAlt}} @size='sm' class='{{this.classes.icon}}' />
        {{/if}}

        {{#if (has-block-params)}}
          {{! Consumer uses block params: they control wrapping via yielded Label/AfterLabel }}
          {{! Label and AfterLabel are pre-bound with merged classes so consumers get styling automatically }}
          {{#if @label}}
            <Label @class={{this.classes.label}}>
              {{@label}}
            </Label>
          {{/if}}
          {{#if this._isTaskSkeletonLoading}}
            <span
              class={{concat
                'animate-pulse bg-neutral-soft rounded'
                (if this.classes.label (concat ' ' this.classes.label))
              }}
            >&nbsp;</span>
          {{else}}
            {{yield
              (hash
                Label=(component Label class=this.classes.label)
                AfterLabel=(component AfterLabel class=this.classes.afterLabel)
                Badge=Badge
                classNames=''
                Content=(component NoopContent classes=this.classes iconSizeClass=this.iconSizeClass)
                classes=this.classes
              )
            }}
          {{/if}}

          {{#if this.isTaskRejected}}
            <TaskErrorBadge />
          {{else if (has-block 'badge')}}
            <span class={{this.classes.badge}}>
              {{yield (hash Badge=Badge) to='badge'}}
            </span>
          {{/if}}
        {{else}}
          {{! No block params: we handle all wrapping internally }}
          {{#if this._isTaskSkeletonLoading}}
            <span
              class={{concat
                'animate-pulse bg-neutral-soft rounded'
                (if this.classes.label (concat ' ' this.classes.label))
              }}
            >&nbsp;</span>
          {{else if @label}}
            <Label @class={{this.classes.label}}>
              {{@label}}
            </Label>
          {{else if (has-block)}}
            <Label @class={{this.classes.label}}>
              {{yield
                (hash
                  Label=(component Label class=this.classes.label)
                  AfterLabel=(component AfterLabel class=this.classes.afterLabel)
                  Badge=Badge
                  classNames=''
                  Content=(component NoopContent classes=this.classes iconSizeClass=this.iconSizeClass)
                  classes=this.classes
                )
              }}
            </Label>
          {{/if}}

          {{#if (has-block 'afterLabel')}}
            <AfterLabel @class={{this.classes.afterLabel}}>
              {{yield to='afterLabel'}}
            </AfterLabel>
          {{/if}}

          {{#if this.isTaskRejected}}
            <TaskErrorBadge />
          {{else if (has-block 'badge')}}
            <span class={{this.classes.badge}}>
              {{yield (hash Badge=Badge) to='badge'}}
            </span>
          {{/if}}
        {{/if}}
      </FrontileButton>
    {{/if}}
  </template>
}
