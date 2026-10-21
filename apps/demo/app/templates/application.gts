import SchemaProbe from '@ember-schema-app/ember-schema/components/schema-probe';
import Pill from '@ember-schema-app/ember-ui/components/pill';
import SurfacePanel from '@ember-schema-app/ember-ui/components/surface-panel';

import DemoSummary from 'demo/components/demo-summary';

<template>
  <main>
    <SurfacePanel @title='Schema packages'>
      <Pill @appearance='primary' @label='Schema-driven' />
      <SchemaProbe @resourceType='post' />
      <DemoSummary />
    </SurfacePanel>
  </main>
</template>
