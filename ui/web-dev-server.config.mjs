// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
import { fileURLToPath } from 'url';
import { fromRollup } from '@web/dev-server-rollup';
import rollupReplace from '@rollup/plugin-replace';
import rollupCommonjs from '@rollup/plugin-commonjs';
import { esbuildPlugin } from '@web/dev-server-esbuild';

const replace = fromRollup(rollupReplace);
const commonjs = fromRollup(rollupCommonjs);

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

export const makeConfig = (
  appIndex,
  rootDir = undefined,
) => Object.assign({
  open: false,
  watch: !hmr,
  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
    browser: true,
    preferBuiltins: false
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  appIndex,
  clearTerminalOnReload: false,

  plugins: [
    replace({
      'process.env.HC_PORT': JSON.stringify(process.env.HC_PORT),
      'process.env.HC_ADMIN_PORT': JSON.stringify(process.env.HC_ADMIN_PORT),
      delimiters: ['', ''],
    }),

    commonjs({
      include: [
        '**/node_modules/tweetnacl/*',
      ],
    }),

    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),

    // ESBuild also handles TypeScript compilation and MIMEtype config
    esbuildPlugin({
      target: 'auto',
      ts: true,
      json: true,
      jsx: true,
      tsx: true,
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url))
    }),
  ],

  // See documentation for all available options
}, rootDir ? { rootDir } : {})

export default /** @type {import('@web/dev-server').DevServerConfig} */ makeConfig("index.html", "./")
