import {
  AdminWebsocket,
  AppWebsocket,
  InstalledCell,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  InstalledAppletInfo,
} from "@neighbourhoods/nh-we-applet";
import { ProviderStore } from "@neighbourhoods/provider-applet";
import { ProviderApplet } from "./provider-applet";
import { HolochainClient } from '@holochain-open-dev/cell-client';

const providerApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weStore: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("provider-applet", ProviderApplet);
        element.innerHTML = `<provider-applet></provider-applet>`;
        const appletElement = element.querySelector("provider-applet") as any;

        const providerCell = appletAppInfo[0].installedAppInfo.cell_data.find(c => c.role_id === 'provider') as InstalledCell;
        const providerStore = new ProviderStore(
          new HolochainClient(appWebsocket),
          providerCell,
        )
        appletElement.providerStore = providerStore;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default providerApplet;
