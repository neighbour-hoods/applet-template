import { Writable, writable } from 'svelte/store';
import {
  AppAgentWebsocket,
  EntryHash,
  AgentPubKeyB64,
  Record,
  encodeHashToBase64,
  ProvisionedCell,
} from '@holochain/client';
import { createContext } from '@lit-labs/context';

import { ProviderService } from './ProviderService';
export { ProviderService }

// the ProviderStore manages the Writable svelte/store object, like accessing and updating it
export class ProviderStore {
  service: ProviderService;

  // this private field is meant to store the data from the provider dna in a structure that is helpful to the UI
  // you could create additional fields depending on what makes the most sense for your application data model
  #providerData: Writable<{ [any: string]: Array<Record> }> = writable({});

  get myAgentPubKey(): AgentPubKeyB64 {
    return encodeHashToBase64(this.providerCell.cell_id[1]);
  }

  constructor(
    protected client: AppAgentWebsocket,
    protected providerCell: ProvisionedCell,
    zomeName: string = 'provider'
  ) {
    this.service = new ProviderService(
      client,
      providerCell.cell_id
    );
  }

  // you would create function for each zome call that you want to make
  async allProviderResourceEntryHashes(): Promise<Array<EntryHash>> {
    return this.service.allProviderResourceEntryHashes();
  }

  // this is an example of a function you would create to fetch all relevant data
  // from the provider dna to initialize the store on page refreshes
  async fetchAllResources() {
    return this.service.fetchAllResources();
  }
}

// Component context for reading relevant ProviderStore instance
export const providerStoreContext = createContext<ProviderStore>(
	'provider-store-context'
);
