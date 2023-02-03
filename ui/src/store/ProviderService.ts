import { EntryHash, AppAgentWebsocket, CellId } from '@holochain/client';

const PROVIDER_ZOME_NAME = 'provider'

// the ProviderService object handles the zome calls
export class ProviderService {
  constructor(public cellClient: AppAgentWebsocket, public cellId: CellId) {}

  async createNewResource(input: string): Promise<null> {
    return this.callZome('create_new_resource', input);
  }
  async allProviderResourceEntryHashes(): Promise<Array<EntryHash>> {
    return this.callZome('all_provider_resource_entry_hashes', null);
  }
  async fetchAllResources(): Promise<{}> {
    return this.callZome('fetch_all_resources', null);
  }
  private callZome(fnName: string, payload: any) {
    return this.cellClient.callZome({
      cell_id: this.cellId,
      zome_name: PROVIDER_ZOME_NAME,
      fn_name: fnName,
      payload,
      provenance: this.cellId[1],
    });
  }
}
