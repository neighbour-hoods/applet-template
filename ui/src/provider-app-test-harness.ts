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
  Cell,
  RoleName,
} from '@holochain/client';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { get } from 'svelte/store';
import { ProviderStore } from './provider-store';
import { SensemakerService, SensemakerStore } from '@neighbourhoods/nh-we-applet';
import { ProviderApp } from './index';
import { CreateOrJoinNh } from './create-or-join-nh';
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

  @property()
  isSensemakerCloned: boolean = false;

  @property()
  agentPubkey!: string;

  // on the first update, setup any networking connections required for app execution
  // async firstUpdated(): Promise<void> {
  async firstUpdated() {
    // connect to the conductor
    try {
      await this.connectHolochain()

      const providerCellInfo: CellInfo = this.appInfo.cell_info[PROVIDER_ROLE_NAME][0]

      // construct the provider store
      if (providerCellInfo) {
        const providerCell: Cell = (providerCellInfo as { "Provisioned": Cell }).Provisioned;
        this.agentPubkey = encodeHashToBase64(providerCell.cell_id[1]);
        this._providerStore = new ProviderStore(await AppAgentWebsocket.connect(
          this.appWebsocket,
          this.appInfo.installed_app_id,
        ), providerCell);
      } else {
        throw new Error("Unable to detect provider cell")
      }

      const installedSensemakerCells = (this.appInfo as AppInfo).cell_info[SENSEMAKER_ROLE_NAME]

      // check if sensemaker has been cloned yet
      let allSensemakerClones = installedSensemakerCells.filter((cellInfo) => "Cloned" in cellInfo);
      if (allSensemakerClones.length > 0) {
        this.isSensemakerCloned = true;
        const clonedSensemakerCell = (allSensemakerClones[0] as { "Cloned": Cell }).Cloned;
        const clonedSensemakerRoleName = clonedSensemakerCell.clone_id!;
        await this.initializeSensemakerStore(clonedSensemakerRoleName);
        await this.updateSensemakerState();
        this.loading = false;
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  async initializeSensemakerStore(clonedSensemakerRoleName: string) {
    const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(this.appWebsocket, "todo-sensemaker");
    const sensemakerService = new SensemakerService(appAgentWebsocket, clonedSensemakerRoleName)
    this._sensemakerStore = new SensemakerStore(sensemakerService);
  }
  
  async cloneSensemakerCell(ca_pubkey: string) {
    const clonedSensemakerCell: InstalledCell = await this.appWebsocket.createCloneCell({
      app_id: this.appInfo.installed_app_id,
      role_name: SENSEMAKER_ROLE_NAME,
      modifiers: {
        network_seed: '',
        properties: {
          community_activator: ca_pubkey
        },
      },
      name: `${SENSEMAKER_ROLE_NAME}-clone`,
    });
    this.isSensemakerCloned = true;
    await this.initializeSensemakerStore(clonedSensemakerCell.role_name)
  }

  async createNeighbourhood(_e: CustomEvent) {
    await this.cloneSensemakerCell(this.agentPubkey)
    const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
    await this.updateSensemakerState()
    this.loading = false;
  }

  async joinNeighbourhood(e: CustomEvent) {
    await this.cloneSensemakerCell(e.detail.newValue)
    console.log('successfully cloned sensemaker cell')
    // wait some time for the dht to sync, otherwise checkIfAppletConfigExists returns null
    setTimeout(async () => {
      const _todoConfig = await this._sensemakerStore.checkIfAppletConfigExists("todo_applet")
      await this.updateSensemakerState()
      this.loading = false;
    }, 2000)
  }

  render() {
    if (this.isSensemakerCloned && this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    if (!this.isSensemakerCloned)
      return html`
      <create-or-join-nh @create-nh=${this.createNeighbourhood} @join-nh=${this.joinNeighbourhood}></create-or-join-nh>
    `;
    return html`
      <main>
        <h3>My Pubkey: ${this.agentPubkey}</h3>
        <div class="home-page">
          <provider-app .sensemakerStore=${this._sensemakerStore} .providerStore=${this._providerStore}></provider-app>
        </div>
      </main>
    `;
  }

  async connectHolochain() {
    this.adminWebsocket = await AdminWebsocket.connect(``);

    this.appWebsocket = await AppWebsocket.connect(``);

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'provider-sensemaker',
    });
  }

  async updateSensemakerState() {
    // you will need to implement the following methods in your provider dna, this is just an example of fetching sensemaker state
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
      'create-or-join-nh': CreateOrJoinNh,
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
