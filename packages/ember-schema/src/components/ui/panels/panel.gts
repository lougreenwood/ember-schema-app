import Component from '@glimmer/component';
import { mergeClassStrings } from '@ember-schema-app/ember-schema/utils/merge-classes';

/**
 * Structural treatment of the panel container.
 * Aligned with Frontile Button appearance naming where applicable.
 *
 * - `'default'` — rounded corners with visible border (standard card/panel)
 * - `'surface'` — rounded corners, no border (blends with surrounding surface)
 */
export type PanelAppearance = 'default' | 'surface';

/**
 * Color/semantic meaning of the panel.
 * Aligned with Frontile Button intent naming where applicable.
 *
 * - `'default'` — deepest surface (`bg-surface-solid-2`)
 * - `'subtle'` — lighter surface (`bg-surface-solid-1`)
 * - `'danger'` — danger soft surface with matching border/text accents
 */
export type PanelIntent = 'danger' | 'default' | 'subtle';

export interface PanelSignature {
  Args: {
    appearance?: PanelAppearance;
    /**
     * Additional CSS classes merged with Panel's computed classes via mergeClassStrings.
     * Use this (instead of the HTML `class` attribute) when you need to override
     * Panel's default styles such as padding, background, or border.
     */
    class?: string;
    fillHeight?: boolean;
    /**
     * Color/semantic meaning. Controls the surface color.
     * Defaults to `'default'` (`bg-surface-solid-2`).
     */
    intent?: PanelIntent;
    /**
     * Controls padding. Defaults to `'md'` (`p-4`).
     */
    size?: PanelSize;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

/**
 * Controls padding (and in future, font size).
 * Follows the pattern established by Button.
 */
export type PanelSize = 'lg' | 'md' | 'sm' | 'xl' | 'xs';

class Panel extends Component<PanelSignature> {
  get classes(): string {
    const fill = this.args.fillHeight ? 'flex flex-col grow shrink-0 basis-auto' : '';
    return mergeClassStrings([this.appearanceClasses, this.intentClasses, this.paddingClass, fill], this.args.class);
  }

  private get appearanceClasses(): string {
    switch (this.resolvedAppearance) {
      case 'surface':
        return 'rounded-sm';
      default:
        return 'rounded-sm border border-divider';
    }
  }

  private get intentClasses(): string {
    switch (this.resolvedIntent) {
      case 'danger':
        return 'border-danger-medium/40 bg-danger-soft/20 text-danger-strong';
      case 'subtle':
        return 'bg-surface-solid-1';
      default:
        return 'bg-surface-solid-2';
    }
  }

  private get paddingClass(): string {
    switch (this.args.size) {
      case 'lg':
        return 'p-6';
      case 'sm':
        return 'p-2';
      case 'xl':
        return 'p-8';
      case 'xs':
        return 'p-1';
      case 'md':
      default:
        return 'p-4';
    }
  }

  private get resolvedAppearance(): PanelAppearance {
    return this.args.appearance ?? 'default';
  }

  private get resolvedIntent(): PanelIntent {
    return this.args.intent ?? 'default';
  }

  <template>
    <div class={{this.classes}} ...attributes>
      {{yield}}
    </div>
  </template>
}

export default Panel;
