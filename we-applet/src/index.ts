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
  InstalledAppletInfo,
} from "@neighbourhoods/nh-we-applet";
import { ProviderStore } from "@neighbourhoods/provider-applet";
import { ProviderApplet } from "./provider-applet";
import { AppAgentClient } from '@holochain/client';

const PROVIDER_ROLE_NAME = 'provider'

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

        const appId = appletAppInfo[0].installedAppInfo.installed_app_id
        const providerStore = new ProviderStore(
          new AppAgentClient(appWebsocket, appId),
          PROVIDER_ROLE_NAME,
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
