import type { TOC } from '@ember/component/template-only';

export interface CollapsibleSignature {
  Args: {
    /**
     * Whether the collapsible content is expanded.
     */
    isOpen: boolean;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLDivElement;
}

/**
 * A CSS-only collapsible component using grid-template-rows animation.
 *
 * Animates between grid-template-rows: 0fr and 1fr. The inner content
 * has min-height: 0 to allow shrinking below intrinsic size.
 *
 * When fully collapsed (0fr), content is visually hidden but still in
 * layout for animation purposes. Parent should handle gap if needed.
 */
const Collapsible: TOC<CollapsibleSignature> = <template>
  <div
    class='grid transition-[grid-template-rows,opacity] duration-200 ease-in-out
      {{if @isOpen "grid-rows-[1fr] opacity-100" "grid-rows-[0fr] opacity-0"}}'
    ...attributes
  >
    <div class='overflow-hidden min-h-0'>
      {{yield}}
    </div>
  </div>
</template>;

export default Collapsible;
