# applet-template
This repository is a template for creating nh-we applets. It is meant to be cloned and provide the basic repository structure and scripts for developing and testing your nh-we applets.

## getting started
1. set up your development environment by following the steps in [Environment Setup](#environment-setup)
1. familiarize yourself with the [repository structure](./STRUCTURE.md) and [reactive state management](./REACTIVE-STATE-MANAGEMENT.md) documents and the use of two important dependencies: [`@neighbourhoods/nh-we-applet`](https://www.npmjs.com/package/@neighbourhoods/nh-we-applet) & [`@neighbourhoods/sensemaker-lite-types`](https://www.npmjs.com/package/@neighbourhoods/sensemaker-lite-types)
1. Clone this repository
1. add your zome code
1. create your applet config and add it to both [`./ui/src/appletConfig.ts`](./ui/src/appletConfig.ts) & [`./we-applet/src/appletConfig.ts`](./we-applet/src/appletConfig.ts)
1. replace all instances of `provider` (including in file or directory names)
1. build your front end store object (see `providerStore.ts`)
1. test your UI with `npm run start`
1. package your applet as a `.webhapp` file to be imported by nh-we with `npm run package`

## Environment Setup

1. Install the holochain dev environment (only nix-shell is required): https://developer.holochain.org/docs/install/
2. Enable Holochain cachix with:

```bash
nix-env -iA cachix -f https://cachix.org/api/v1/install
cachix use holochain-ci
```

3. Clone this repo and `cd` inside of it.
4. Enter the nix shell by running this in the root folder of the repository: 

```bash
nix-shell
npm install
```

This will install all the needed dependencies in your local environment, including `holochain`, `hc` and `npm`.

Run all the other instructions in this README from inside this nix-shell, otherwise **they won't work**.

## Bootstrapping a network

Create a whole network of nodes connected to each other and their respective UIs with.

```bash
npm run network 3
```

Substitute the "3" for the number of nodes that you want to bootstrap in your network.

This will also bring up the Holochain Playground for advanced introspection of the conductors.

## Running an agent
 
If you only want to run a single conductor and a UI connected to it:

```bash
npm start
```

To run another agent, open another terminal, and execute again:

```bash
npm start
```

Each new agent that you create this way will get assigned its own port and get connected to the other agents.

## Running the DNA tests

```bash
npm run test
```

## Building the DNA

```bash
npm run build:happ
```

## Package

To package the web happ:

``` bash
npm run package
```

You'll have the `provider.webhapp` in `workdir`. This is what you should distribute so that the Holochain Launcher can install it.

You will also have its subcomponent `provider.happ` in the same folder`.

## Documentation

This repository is using this tooling:

- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/): npm v7's built-in monorepo capabilities.
- [hc](https://github.com/holochain/holochain/tree/develop/crates/hc): Holochain CLI to easily manage Holochain development instances.
- [@holochain/tryorama](https://www.npmjs.com/package/@holochain/tryorama): test framework.
- [@holochain/client](https://www.npmjs.com/package/@holochain/client): client library to connect to Holochain from the UI.
- [@holochain-playground/cli](https://www.npmjs.com/package/@holochain-playground/cli): introspection tooling to understand what's going on in the Holochain nodes.