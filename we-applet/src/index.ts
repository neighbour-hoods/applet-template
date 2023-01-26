import {
  AdminWebsocket,
  AppWebsocket,
  InstalledCell,
  AppInfo,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-we-applet";
import { ProviderStore } from "@neighbourhoods/provider-applet";
import { ProviderApplet } from "./provider-applet";
import { AppAgentWebsocket } from '@holochain/client';

const PROVIDER_ROLE_NAME = 'provider'

const providerApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weStore: WeServices,
    appletAppInfo: AppletInfo[]
  ): Promise<AppletRenderers> {
    const appId = appletAppInfo[0].appInfo.installed_app_id
    const installedCells = appletAppInfo[0].appInfo.cell_info[PROVIDER_ROLE_NAME]
      .map((c: CellInfo) => ((c as { [CellType.Provisioned as string]: Cell }).Provisioned || (c as { [CellType.Cloned as string]: Cell }).Cloned) as InstalledCell);
    const providerCell = installedCells
      .find(c => c.role_name === PROVIDER_ROLE_NAME)

    let providerStore?: ProviderStore;
    if (providerCell) {
      const appWs = await AppAgentWebsocket.connect(
        appWebsocket.client.socket.url,
        PROVIDER_ROLE_NAME,
      );
      providerStore = new ProviderStore(appWs, providerCell);
    } else {
      throw new Error("Unable to render WeApplet: no provider Cell detected")
    }

    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("provider-applet", ProviderApplet);
        element.innerHTML = `<provider-applet></provider-applet>`;
        const appletElement = element.querySelector("provider-applet") as any;

        appletElement.providerStore = providerStore;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default providerApplet;
