import { contextProvided } from "@lit-labs/context";
import { property } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import { providerStoreContext } from "../contexts";
import { ProviderStore } from "../provider-store";

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
    
    static get scopedElements() {
        return {
        };
    }
}