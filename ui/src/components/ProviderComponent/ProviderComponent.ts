import { contextProvided } from "@lit-labs/context";
import { property } from "lit/decorators.js";
import { ScopedRegistryHost as ScopedElementsMixin } from "@lit-labs/scoped-registry-mixin";
import { LitElement, html } from "lit";
import { ProviderStore, providerStoreContext } from "@neighbourhoods/provider-store";

export class ProviderComponent extends ScopedElementsMixin(LitElement) {
    @contextProvided({ context: providerStoreContext, subscribe: true })
    @property({attribute: false})
    public  providerStore!: ProviderStore


    render() {
        return html`
            <div>
                <p1>this is a provider component!</p1>
            </div>
        `
    }

    static get elementDefinitions() {
        return {
        };
    }
}
