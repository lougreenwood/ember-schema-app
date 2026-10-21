import loadConfigFromMeta from '@embroider/config-meta-loader';
import { assert } from '@ember/debug';

const config = loadConfigFromMeta('demo') as unknown;

assert('config is not an object', typeof config === 'object' && Boolean(config));
assert(
  'modulePrefix was not detected on your config',
  'modulePrefix' in Object(config) && typeof (config as Record<string, unknown>).modulePrefix === 'string',
);
assert(
  'locationType was not detected on your config',
  'locationType' in Object(config) && typeof (config as Record<string, unknown>).locationType === 'string',
);
assert(
  'rootURL was not detected on your config',
  'rootURL' in Object(config) && typeof (config as Record<string, unknown>).rootURL === 'string',
);
assert(
  'APP was not detected on your config',
  'APP' in Object(config) && typeof (config as Record<string, unknown>).APP === 'object',
);

export default config as {
  modulePrefix: string;
  podModulePrefix?: string;
  locationType: string;
  rootURL: string;
  APP: Record<string, unknown>;
} & Record<string, unknown>;
