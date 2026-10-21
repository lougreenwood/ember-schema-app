import Component from '@glimmer/component';

interface PillSignature {
  Args: {
    appearance?: 'neutral' | 'primary';
    label?: string;
    size?: 'sm' | 'md';
  };
  Blocks: {
    default: [];
  };
  Element: HTMLSpanElement;
}

export default class Pill extends Component<PillSignature> {
  get appearanceClass(): string {
    return this.args.appearance === 'primary' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-700';
  }

  get sizeClass(): string {
    return this.args.size === 'md' ? 'px-2 py-0.5 text-sm' : 'px-2 py-0.5 text-xs';
  }

  <template>
    <span class='me-1 inline-flex items-center rounded-full {{this.sizeClass}} {{this.appearanceClass}}' ...attributes>
      {{#if (has-block)}}
        {{yield}}
      {{else if @label}}
        {{@label}}
      {{/if}}
    </span>
  </template>
}
