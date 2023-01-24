import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
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

const APP_SOCKET_URI = `ws://localhost:${process.env.HC_PORT}`
const ADMIN_SOCKET_URI = `ws://localhost:${process.env.HC_ADMIN_PORT}`

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
    const SENSEMAKER_ROLE_NAME = "sensemaker"
    
    // connect to the conductor
    await this.connectHolochain()
    const installedCells = (this.appInfo as AppInfo).cell_info[SENSEMAKER_ROLE_NAME]
      // @ts-ignore
      .map((c: CellInfo) => (c[CellType.Provisioned] || c[CellType.Cloned]) as InstalledCell);
    
    // check if sensemaker has been cloned yet
    let clonedSensemakerCell: InstalledCell | undefined
    clonedSensemakerCell = installedCells.find(
      // when a cell is cloned, the role_name is appended with the number of the clone
      (c: InstalledCell) => c.role_name === `${SENSEMAKER_ROLE_NAME}.0`
    );
    // if it hasn't been cloned yet, clone it
    if (!clonedSensemakerCell) {
      console.debug(`Cloning new Cell for ${SENSEMAKER_ROLE_NAME}`)

      const sensemakerCell = installedCells.find(
        c => c.role_name === SENSEMAKER_ROLE_NAME
      ) as InstalledCell;
  
      clonedSensemakerCell = await this.appWebsocket.createCloneCell({
        app_id: 'provider',
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

      // now that we've cloned, we should be able to successfully pass subsequent execution of this method
      return await this.firstUpdated()
    }
    
    // construct the sensemaker store
    const sensemakerService = new SensemakerService(await AppAgentWebsocket.connect(
      APP_SOCKET_URI,
      this.appInfo.installed_app_id,
    ), SENSEMAKER_ROLE_NAME);
    this._sensemakerStore = new SensemakerStore(sensemakerService);

    // register the applet config
    await this._sensemakerStore.registerApplet(appletConfig)

    const providerCell = installedCells
      .find(c => c.role_name === 'provider');

    // construct the provider store
    this._providerStore = new ProviderStore(
        new HolochainClient(this.appWebsocket),
        providerCell,
    );
    
    // fetch all resources to initialize the provider store
    const allResources = await this._providerStore.fetchAllResources()

    // initialize the sensemaker store so that the UI knows about assessments and other sensemaker data
    await this.updateSensemakerState()
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
    this.adminWebsocket = await AdminWebsocket.connect(
      ADMIN_SOCKET_URI
    );

    this.appWebsocket = await AppWebsocket.connect(
      APP_SOCKET_URI
    );
    

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
