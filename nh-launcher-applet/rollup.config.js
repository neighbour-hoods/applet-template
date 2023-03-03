import copy from "rollup-plugin-copy"
import { makeConfig } from '@neighbourhoods/provider-applet/rollup.config'

const production = !process.env.ROLLUP_WATCH;

export default makeConfig(
  "dist/nh-launcher-applet/src/index.js",
  production,
  [copy({
    targets: [{ src: "icon.png", dest: "dist" }],
  })],
)
