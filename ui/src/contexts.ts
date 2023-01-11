import { createContext } from '@lit-labs/context';
import { ProviderStore } from './provider-store';
import { SensemakerStore } from '@neighbourhoods/nh-we-applet';

export const providerStoreContext = createContext<ProviderStore>(
    'provider-store-context'
);
export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
);