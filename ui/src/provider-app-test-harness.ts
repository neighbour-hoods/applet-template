import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppAgentWebsocket,
  AppWebsocket,
  CellInfo, CellType,
  InstalledCell,
  ActionHash,
  AppInfo,
  AdminWebsocket,
  EntryHash,
  encodeHashToBase64,
} from '@holochain/client';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { get } from 'svelte/store';
import { ProviderStore } from './provider-store';
import { SensemakerService, SensemakerStore } from '@neighbourhoods/nh-we-applet';
import { ProviderApp } from './index';
import appletConfig from './appletConfig'

const SENSEMAKER_ROLE_NAME = "sensemaker"
const PROVIDER_ROLE_NAME = "provider"

@customElement('provider-app-test-harness')
export class ProviderAppTestHarness extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;
  @state() currentSelectedList: string | undefined;

  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;

  @property({ type: Object })
  appInfo!: AppInfo;

  @property()
  _providerStore!: ProviderStore;

  @property()
  _sensemakerStore!: SensemakerStore;

  // on the first update, setup any networking connections required for app execution
  async firstUpdated(): Promise<void> {
    let detectedSensemakerCell: InstalledCell | undefined;

    try {
      // connect to the conductor
      await this.connectHolochain()
      const installedCells = this.getInstalledCells();

      // check if sensemaker has been cloned yet
      detectedSensemakerCell = installedCells.find(
        // when a cell is cloned, the role_name is appended with the number of the clone
        (c: InstalledCell) => c.role_name === `${SENSEMAKER_ROLE_NAME}.0`
      );
      // if it hasn't been cloned yet, clone it
      if (!detectedSensemakerCell) {
        console.debug(`Cloning new Cell for ${SENSEMAKER_ROLE_NAME}`)

        const sensemakerCell = installedCells.find(
          //@ts-ignore
          c => c.name === SENSEMAKER_ROLE_NAME
        ) as InstalledCell;
        detectedSensemakerCell = await this.appWebsocket.createCloneCell({
          app_id: 'provider-sensemaker',
          role_name: SENSEMAKER_ROLE_NAME,
          modifiers: {
            network_seed: '',
            properties: {
              community_activator: encodeHashToBase64(sensemakerCell.cell_id[1])
            },
            origin_time: Date.now(),
          },
          name: 'sensemaker-clone',
        });

        // now that we've cloned, refresh our cache of appInfo
        await this.refreshAppInfo();
      }
    } catch (e) {
      console.error(e)
    }

    // construct the sensemaker store
    const sensemakerService = new SensemakerService(await AppAgentWebsocket.connect(
      APP_SOCKET_URI,
      this.appInfo.installed_app_id,
    ), detectedSensemakerCell.role_name!);
    this._sensemakerStore = new SensemakerStore(sensemakerService);

    // register the applet config
    await this._sensemakerStore.registerApplet(appletConfig)

    const providerCell = installedCells
      .find(c => c.role_name === PROVIDER_ROLE_NAME);

    // construct the provider store
    if (providerCell) {
      this._providerStore = new ProviderStore(await AppAgentWebsocket.connect(
        this.appWebsocket.client.socket.url,
        this.appInfo.installed_app_id,
      ), providerCell);
    } else {
      throw new Error("Unable to detect provider cell")
    }

    // register the applet config
    await this._sensemakerStore.registerApplet(appletConfig)

    // initialize the sensemaker store so that the UI knows about assessments and other sensemaker data
    await this.updateSensemakerState();

    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    return html`
      <main>
        <div class="home-page">
          <provider-app .sensemakerStore=${this._sensemakerStore} .providerStore=${this._providerStore}></provider-app>
        </div>
      </main>
    `;
  }

  async connectHolochain() {
    this.adminWebsocket = await AdminWebsocket.connect(``);

    this.appWebsocket = await AppWebsocket.connect(``);

    await this.refreshAppInfo();
  }

  private getInstalledCells(): InstalledCell[] {
    return (this.appInfo as AppInfo).cell_info[SENSEMAKER_ROLE_NAME]
        // @ts-ignore
        .map((c: CellInfo) => (c[CellType.Provisioned] || c[CellType.Cloned]) as InstalledCell)
  }

  async refreshAppInfo(appInfo: AppInfo) {
    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'provider',
    });
  }

  async updateSensemakerState() {
    const allProviderResourceEntryHashes: EntryHash[] = await this._providerStore.allProviderResourceEntryHashes()
    const dimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["importance"]
    for (const taskEh of allProviderResourceEntryHashes) {
      await this._sensemakerStore.getAssessmentForResource({
        dimension_eh: dimensionEh,
        resource_eh: taskEh
      })
    }
  }

  static get scopedElements() {
    return {
      'provider-app': ProviderApp,
    };
  }

  static styles = css`
    .home-page {
      display: flex;
      flex-direction: row;
    }  

    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}
