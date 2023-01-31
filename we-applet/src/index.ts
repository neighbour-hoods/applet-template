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
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("provider-applet", ProviderApplet);
        element.innerHTML = `<provider-applet></provider-applet>`;
        const appletElement = element.querySelector("provider-applet") as any;
        appletElement.appWebsocket = appWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default providerApplet;
