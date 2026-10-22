import type { TOC } from '@ember/component/template-only';

const SIZE_CLASS_MAP: Record<'lg' | 'md' | 'sm', string> = {
  lg: 'size-10',
  md: 'size-8',
  sm: 'size-6',
};

interface CircleImageSignature {
  Args: {
    imageUrl?: string | undefined;
    name?: string | undefined;
    size?: 'lg' | 'md' | 'sm' | undefined;
  };
  Element: HTMLImageElement | HTMLDivElement;
}

function sizeClass(size: 'lg' | 'md' | 'sm' | undefined): string {
  return SIZE_CLASS_MAP[size ?? 'md'];
}

const CircleImage: TOC<CircleImageSignature> = <template>
  {{#if @imageUrl}}
    <img src={{@imageUrl}} alt={{@name}} class='{{sizeClass @size}} rounded-full object-cover shrink-0' ...attributes />
  {{else}}
    <div
      class='{{sizeClass @size}} rounded-full bg-surface-solid-4 shrink-0'
      role='img'
      aria-label={{@name}}
      ...attributes
    />
  {{/if}}
</template>;

export default CircleImage;
