import { createContext } from '@lit-labs/context';
import { SensemakerStore } from '@neighbourhoods/nh-we-applet';

export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
);
