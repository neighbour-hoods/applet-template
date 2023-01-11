import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  Dictionary,
} from '@holochain-open-dev/core-types';
import { serializeHash } from '@holochain-open-dev/utils';
import { derived, get, Writable, writable } from 'svelte/store';
import { EntryHash, InstalledCell } from '@holochain/client';
import { ProviderService } from './provider-service';
import { Task, TaskToListInput, WrappedEntry } from './types';

export class ProviderStore {
  service: ProviderService;

  #providerData: Writable<Dictionary<Array<WrappedEntry<Task>>>> = writable({});

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

  async allProviderResourceEntryHashes(): Promise<Array<EntryHash>> {
    return this.service.allProviderResourceEntryHashes();
  }

  async fetchAllResources() {
    return this.service.fetchAllResources();
}
