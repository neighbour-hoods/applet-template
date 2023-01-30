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
  // async firstUpdated(): Promise<void> {
  async firstUpdated() {
    // connect to the conductor
    try {
      await this.connectHolochain()
      const installedSensemakerCells = (this.appInfo as AppInfo).cell_info[SENSEMAKER_ROLE_NAME]
      
      // check if sensemaker has been cloned yet
      let allSensemakerClones = installedSensemakerCells.filter((cellInfo) => "Cloned" in cellInfo);
      let provisionedSensemakerCells: CellInfo[] = installedSensemakerCells.filter((cellInfo) => "Provisioned" in cellInfo);
      const sensemakerCell: Cell = (provisionedSensemakerCells[0] as { "Provisioned": Cell }).Provisioned;
      let clonedSensemakerRoleName: RoleName;

      // if it hasn't been cloned yet, clone it
      if (allSensemakerClones.length === 0) {
        console.debug(`Cloning new Cell for ${SENSEMAKER_ROLE_NAME}`)
        const clonedSensemakerCell = await this.appWebsocket.createCloneCell({
          app_id: this.appInfo.installed_app_id,
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
        clonedSensemakerRoleName = clonedSensemakerCell.role_name!;
      }
      else {
        const clonedSensemakerCell = (allSensemakerClones[0] as { "Cloned": Cell }).Cloned;
        clonedSensemakerRoleName = clonedSensemakerCell.name!;
      }
      // now that we've cloned, we should be able to successfully pass subsequent execution of this method
      // return await this.firstUpdated()

      const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(this.appWebsocket, "todo-sensemaker");
      const sensemakerService = new SensemakerService(appAgentWebsocket, clonedSensemakerRoleName);
      this._sensemakerStore = new SensemakerStore(sensemakerService);

      // register the applet config
      await this._sensemakerStore.registerApplet(appletConfig)

      const providerCellInfo: CellInfo = this.appInfo.cell_info[PROVIDER_ROLE_NAME][0]
      const providerCell: Cell = (providerCellInfo as { "Provisioned": Cell }).Provisioned;


      // construct the provider store
      if (providerCellInfo) {
        this._providerStore = new ProviderStore(await AppAgentWebsocket.connect(
          this.appWebsocket,
          this.appInfo.installed_app_id,
        ), providerCell);
      } else {
        throw new Error("Unable to detect provider cell")
      }

      // initialize the sensemaker store so that the UI knows about assessments and other sensemaker data
      // await this.updateSensemakerState()
    }
    catch (e) {
      console.error(e)
    }
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
