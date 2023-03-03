const nodeResolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");

const babel = require("@rollup/plugin-babel").default;
const html = require("@web/rollup-plugin-html").default;
const { importMetaAssets } = require("@web/rollup-plugin-import-meta-assets");
const { terser } = require("rollup-plugin-terser");
const typescript = require('@rollup/plugin-typescript');

const makeConfig = (
  inputFile,
  production,
  extraPlugins = [],
  outDir = "dist"
) => ({
  input: inputFile,
  output: {
    entryFileNames: "[hash].js",
    chunkFileNames: "[hash].js",
    assetFileNames: "[hash][extname]",
    format: "es",
    dir: "dist",
    sourcemap: !production,
  },
  watch: {
    clearScreen: false,
  },

  plugins: [
    ...extraPlugins,

    /** Enable using HTML as rollup entrypoint */
    html({
      minify: true,
    }),
    /** Resolve bare module imports */
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    replace({
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
      "process.env.ENV": `"${process.env.ENV}"`,
      "process.env.HC_PORT": `undefined`,
      "process.env.ADMIN_PORT": `undefined`,
    }),
    commonjs({}),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    /** Minify JS */
    terser(),
    /** Bundle assets references via import.meta.url */
    importMetaAssets(),
    /** Compile JS to a lower language target */
    babel({
      exclude: /node_modules/,

      babelHelpers: "bundled",
      presets: [
        [
          require.resolve("@babel/preset-env"),
          {
            targets: [
              "defaults",
              "not IE 11",
              "not op_mini all",
              "last 3 Chrome major versions",
              "last 3 Firefox major versions",
              "last 3 Edge major versions",
              "last 3 Safari major versions",
            ],
            modules: false,
            bugfixes: true,
          },
        ],
      ],
      plugins: [
        [
          require.resolve("babel-plugin-template-html-minifier"),
          {
            modules: {
              lit: ["html", { name: "css", encapsulation: "style" }],
            },
            failOnError: false,
            strictCSS: true,
            htmlMinifier: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: true,
            },
          },
        ],
      ],
    }),
  ],
})

module.exports = {
  makeConfig,
  default: makeConfig(
    "index.html",
    !process.env.ROLLUP_WATCH,
  )
}
