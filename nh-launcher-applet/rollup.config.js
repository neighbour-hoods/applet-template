import path from 'path';
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";

import babel from "@rollup/plugin-babel";
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets";
import { terser } from "rollup-plugin-terser";
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "dist/nh-launcher-applet/src/index.js",
  output: {
    format: "es",
    dir: "dist",
    sourcemap: false,
  },
  watch: {
    clearScreen: false,
  },
  external: [],
  plugins: [
    copy({
      targets: [{ src: "icon.png", dest: "dist" }],
    }),
    /** Resolve bare module imports */
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      modulePaths: [path.resolve(__dirname, './out-tsc'), path.resolve(__dirname, './dist')],
    }),
    replace({
      "process.env.NODE_ENV": '"production"',
    }),
    commonjs({}),
    /** Minify JS */
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
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
};
