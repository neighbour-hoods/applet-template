import { makeConfig } from '@neighbourhoods/provider-applet/web-dev-server.config.mjs'

export default /** @type {import('@web/dev-server').DevServerConfig} */ makeConfig("./demo/index.html", "../")
