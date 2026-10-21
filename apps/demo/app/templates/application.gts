import SchemaProbe from '@ember-schema/ember/components/schema-probe';
import SurfacePanel from '@ember-schema/ui/components/surface-panel';

import DemoSummary from 'demo/components/demo-summary';

<template>
  <main>
    <SurfacePanel @title='Schema packages'>
      <SchemaProbe @resourceType='post' />
      <DemoSummary />
    </SurfacePanel>
  </main>
</template>
