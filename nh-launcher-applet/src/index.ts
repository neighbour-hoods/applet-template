import {
  AdminWebsocket,
  AppWebsocket,
} from "@holochain/client";
import {
  NhLauncherApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";
import { ProviderApplet } from "./provider-applet";


const providerApplet: NhLauncherApplet = {
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
