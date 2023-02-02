# applet execution
There are two main contexts in which your applet will be executed: in `NH Launcher` (currently a fork of `We`) as an applet (contained in the `we-applet/` directory) and as a web app for development purposes (in the `ui/` directory, which also contains the ui components and state management). The reason for this separation is to speed up the development cycle of your frontend. Whenever you test your applet in we, you need to build it as a `.webhapp` and install it directly to `NH Laucnher`, which is time consuming. 

## without `NH Launcher`
By running `npm run start` you spawn a conductor and initialize a sensemaker cell and a provider cell, and launch the ui as a web app directly in the browser. 

In `package.json`, this is done by the following commands:
```
"start": "npm run network 2",

// build a happ which bundles both the provider dna and sensemaker dna for easier access to both cells in test harness
"network": "hc s clean && npm run build:test-happ && concurrently-repeat \"npm run start:agent\"",

// set environment variables for app and admin ports
"start:agent": "cross-env HC_PORT=$(port) HC_ADMIN_PORT=$(port) concurrently -k \"npm run start:happ\" \"sleep 5 && npm run start -w ui\"",

// spawn the conductor and install the happ
"start:happ": "concurrently \"RUST_LOG=warn echo \"pass\" | hc s --piped -f=$HC_ADMIN_PORT generate ./workdir/sensemaker-enabled/provider-sensemaker.happ --run=$HC_PORT -a provider network mdns\" \"npm run playground\"",
```

For development, the entry point of the application is [`index.html`](./ui/index.html), which imports the [ProviderAppTestHarness](./ui/src/provider-app-test-harness.ts) webcomponent, registers it and then adds it to the DOM.

`provider-app-test-harness.ts` is there to wrap your root level ui component ([`provider-app`](./ui/src/provider-app.ts)) and pass in whatever objects would normally be provided by We. In this case, it is just the [`SensemakerStore`](https://github.com/neighbour-hoods/nh-we/blob/sensemaker-integration/ui/libs/we-applet/src/sensemaker/sensemakerStore.ts) object, but in the future it will likely include the [`ProfileStore`](https://github.com/neighbour-hoods/nh-we/blob/1f44167b78242f7b2d924f74ca735aedf2be8836/ui/libs/we-applet/src/index.ts#L25) object to be able to access profile information.

It also sets up a [`ProviderStore`](./ui/src/provider-store.ts) object since this depends the conductor app websocket. In we, the conductor would already be instantiated and running, and that websocket would be used to construct the provider store object.

Lastly, it registers your applet config to the sensemaker cell.

## with `NH Laucnher`
In the `we-applet` directory, you will find the code that bundles the app UI as a we applet (`.webhapp` file) which can be imported by `NH Launcher`. `provider-applet.ts` imports the `ProviderApp` class from the `ui/` directory, which is a separate npm module inside the npm workspace, and treats it like any other lit webcomponent.
