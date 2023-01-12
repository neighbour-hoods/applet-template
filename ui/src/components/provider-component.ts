import { contextProvided, contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state, query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { providerStoreContext } from "../contexts";
import { ProviderStore } from "../provider-store";
import { get } from "svelte/store";
import { ListItem } from "./list-item";
import { AddItem } from "./add-item";
import { List, ListItem as MWCListItem } from '@scoped-elements/material-web'

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
        'mwc-list': List,
        'mwc-list-item': MWCListItem,
        };
    }
}