import { CellClient } from '@holochain-open-dev/cell-client';
import { Dictionary, EntryHashB64 } from '@holochain-open-dev/core-types';
import { ActionHash } from '@holochain/client';
import { Task, TaskToListInput, WrappedEntry } from './types';

// the ProviderService object handles the zome calls
export class ProviderService {
  constructor(public cellClient: CellClient, public zomeName = 'provider') {}

  async createNewResource(input: string): Promise<null> {
    return this.callZome('create_new_resource', input);
  }
  async allProviderResourceEntryHashes(): Promise<Array<EntryHashB64>> {
    return this.callZome('all_provider_resource_entry_hashes', null);
  }
  async fetchAllResources(): Promise<Dictionary<null>> {
    return this.callZome('fetch_all_resources', null);
  }
  private callZome(fnName: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fnName, payload);
  }
}
