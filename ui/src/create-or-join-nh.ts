import { query } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { TextField, Button } from '@scoped-elements/material-web'

export class CreateOrJoinNh extends ScopedElementsMixin(LitElement) {
    @query('#ca-pubkey')
    input!: HTMLInputElement;

    render() {
        return html`
            <div class="nh-creation-container">
                <mwc-button outlined=true @click=${this.dispatchCreateNeighbourhood}>Create Neighbourhood</mwc-button>
                <div>
                    <mwc-textfield id="ca-pubkey" placeholder=${`community activator pubkey`}></mwc-textfield>
                    <mwc-button outlined=true @click=${this.dispatchJoinNeighbourhood}>Join Neighbourhood</mwc-button>
                </div>
            </div>
        `
    }

    dispatchCreateNeighbourhood() {
        this.dispatchEvent(new CustomEvent('create-nh'))
    }

    dispatchJoinNeighbourhood() {
        const newValue = this.input.value;
        if (newValue) {
            const options = {
                detail: {newValue},
                bubbles: true,
                composed: true
            };
            console.log('ca key', newValue)
            this.dispatchEvent(new CustomEvent('join-nh', options))
            this.input.value = ''
        }
    }

    static get scopedElements() {
        return {
            'mwc-textfield': TextField,
            'mwc-button': Button,
        }
    }

    static styles = css`
        .nh-creation-container {
            display: flex;
            flex-direction: column;
        }
    `
}
