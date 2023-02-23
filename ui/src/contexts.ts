import { createContext } from '@lit-labs/context';
import { SensemakerStore } from '@neighbourhoods/nh-launcher-applet';

export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
);
