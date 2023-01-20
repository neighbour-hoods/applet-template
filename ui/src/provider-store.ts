import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  Dictionary,
} from '@holochain-open-dev/core-types';
import { serializeHash } from '@holochain-open-dev/utils';
import { Writable, writable } from 'svelte/store';
import { EntryHash, InstalledCell, Record } from '@holochain/client';
import { ProviderService } from './provider-service';

// the ProviderStore manages the Writable svelte/store object, like accessing and updating it
export class ProviderStore {
  service: ProviderService;

  // this private field is meant to store the data from the provider dna in a structure that is helpful to the UI
  // you could create additional fields depending on what makes the most sense for your application data model
  #providerData: Writable<Dictionary<Array<Record>>> = writable({});

  get myAgentPubKey(): AgentPubKeyB64 {
    return serializeHash(this.providerCell.cell_id[1]);
  }

  constructor(
    protected client: HolochainClient,
    protected providerCell: InstalledCell,
    zomeName: string = 'provider'
  ) {
    this.service = new ProviderService(
      new CellClient(client, providerCell),
      zomeName
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
