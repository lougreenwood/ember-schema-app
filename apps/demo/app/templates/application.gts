import SchemaProbe from '@ember-schema-app/ember-schema/components/schema-probe';
import SurfacePanel from '@ember-schema-app/ember-ui/components/surface-panel';

import DemoSummary from 'demo/components/demo-summary';

<template>
  <main>
    <SurfacePanel @title='Schema packages'>
      <SchemaProbe @resourceType='post' />
      <DemoSummary />
    </SurfacePanel>
  </main>
</template>
