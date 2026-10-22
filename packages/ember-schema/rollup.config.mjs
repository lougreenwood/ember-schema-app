import { Addon } from '@embroider/addon-dev/rollup';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const babelConfig = resolve(rootDirectory, './babel.publish.config.cjs');
const packageName = '@ember-schema-app/ember-schema';
const sourceExtensions = ['.gts', '.gjs', '.ts', '.js'];

/**
 * Resolves the package's own public specifiers (`@ember-schema-app/ember-schema/...`) back to `src/`.
 *
 * The package consumes its own modules through the same absolute specifiers consumers use. Without this, node resolution
 * follows `package.json#exports` into `dist/`, which is the build output currently being written.
 */
const resolveOwnSourceImports = {
  name: 'resolve-own-source-imports',
  resolveId(source) {
    const prefix = `${packageName}/`;

    if (!source.startsWith(prefix)) return undefined;

    const base = resolve(rootDirectory, 'src', source.slice(prefix.length));
    const candidates = [
      base,
      ...sourceExtensions.map((extension) => `${base}${extension}`),
      ...sourceExtensions.map((extension) => `${base}/index${extension}`),
    ];

    return candidates.find((candidate) => statSync(candidate, { throwIfNoEntry: false })?.isFile() === true);
  },
};

/**
 * App re-exports exist so the host app can resolve classic component/helper/modifier modules.
 *
 * Support modules that live alongside components (`types`, `consts`, `registry`, `engine`, helpers for reading values)
 * have no default export, so re-exporting `default` for them would emit an invalid module. Only source modules with a
 * default export participate in the app re-export.
 */
function appReexportExports(addonFilename) {
  if (!addonFilename.startsWith('components/')) return ['default'];

  const sourceBase = resolve(rootDirectory, 'src', addonFilename.slice(0, -'.js'.length));

  return statSync(`${sourceBase}.gts`, { throwIfNoEntry: false })?.isFile() === true ? ['default'] : [];
}

export default {
  output: addon.output(),

  plugins: [
    resolveOwnSourceImports,

    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts', '.gts'] }),

    addon.publicEntrypoints(['**/*.js', 'index.js']),

    addon.appReexports(['components/**/*.js', 'helpers/**/*.js', 'modifiers/**/*.js'], {
      exports: appReexportExports,
    }),

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
