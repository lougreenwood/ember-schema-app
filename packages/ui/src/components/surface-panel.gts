import type { TOC } from '@ember/component/template-only';

export interface SurfacePanelSignature {
  Args: {
    title: string;
  };
  Blocks: {
    default: [];
  };
}

const SurfacePanel: TOC<SurfacePanelSignature> = <template>
  <section class='schema-surface-panel' data-test-ui-panel>
    <h2>{{@title}}</h2>
    {{yield}}
  </section>
</template>;

export default SurfacePanel;
