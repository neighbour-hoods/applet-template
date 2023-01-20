import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
  AdminWebsocket,
  InstalledCell,
  EntryHash,
} from '@holochain/client';
import '@material/mwc-circular-progress';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { HolochainClient, CellClient } from '@holochain-open-dev/cell-client';
import { get } from 'svelte/store';
import { ProviderStore } from './provider-store';
import { SensemakerService, SensemakerStore } from '@neighbourhoods/nh-we-applet';
import { serializeHash } from '@holochain-open-dev/utils';
import { ProviderApp } from './index';
import appletConfig from './appletConfig'

export class ProviderAppTestHarness extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() actionHash: ActionHash | undefined;
  @state() currentSelectedList: string | undefined;

  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;

  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  @property()
  _providerStore!: ProviderStore;

  @property()
  _sensemakerStore!: SensemakerStore;


  // on the first update, setup any networking connections required for app execution
  async firstUpdated() {
    
    // connect to the conductor
    await this.connectHolochain()
    const installedCells = this.appInfo.cell_data;
    const client = new HolochainClient(this.appWebsocket);
    
    // check if sensemaker has been cloned yet
    let clonedSensemakerCell: InstalledCell | undefined
    clonedSensemakerCell = installedCells.find(
      // when a cell is cloned, the role_id is appended with the number of the clone
      c => c.role_id === 'sensemaker.0'
    );
    // if it hasn't been cloned yet, clone it
    if (!clonedSensemakerCell) {
      const sensemakerCell = installedCells.find(
        c => c.role_id === 'sensemaker'
      ) as InstalledCell;
  
      clonedSensemakerCell = await this.appWebsocket.createCloneCell({
        app_id: 'provider',
        role_id: "sensemaker",
        modifiers: {
          network_seed: '',
          properties: {
            community_activator: serializeHash(sensemakerCell.cell_id[1])
          },
          origin_time: Date.now(),
        },
        name: 'sensemaker-clone',
      });
    }
    
    // construct the sensemaker store
    const sensemakerCellClient = new CellClient(client, clonedSensemakerCell);
    const sensemakerService = new SensemakerService(sensemakerCellClient);
    this._sensemakerStore = new SensemakerStore(sensemakerService);

    let appInfos = await this.appWebsocket.appInfo({
      installed_app_id: 'provider',
    });

    // register the applet config
    await this._sensemakerStore.registerApplet(appletConfig)

    const providerCell = installedCells.find(
      c => c.role_id === 'provider'
    ) as InstalledCell;

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
      `ws://localhost:${process.env.HC_ADMIN_PORT}`
    );

    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
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
