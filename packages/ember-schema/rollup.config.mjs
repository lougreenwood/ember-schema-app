import { Addon } from '@embroider/addon-dev/rollup';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const babelConfig = resolve(rootDirectory, './babel.publish.config.cjs');

export default {
  output: addon.output(),

  plugins: [
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts', '.gts'] }),

    addon.publicEntrypoints(['**/*.js', 'index.js']),

    addon.appReexports(['components/**/*.js', 'services/**/*.js', 'helpers/**/*.js', 'modifiers/**/*.js']),

    addon.dependencies(),

    babel({
      extensions: ['.js', '.gjs', '.ts', '.gts'],
      babelHelpers: 'bundled',
      configFile: babelConfig,
    }),

    addon.gjs(),

    addon.keepAssets(['**/*.css']),

    addon.clean(),
  ],
};
