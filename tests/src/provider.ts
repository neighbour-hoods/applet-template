
import { AppBundleSource } from "@holochain/client";
import { pause, runScenario } from "@holochain/tryorama";
import { decode } from '@msgpack/msgpack';
import pkg from 'tape-promise/tape';
const { test } = pkg;
import { providerHapp } from "./utils";


export default () => test("provider CRUD tests", async (t) => {
  await runScenario(async scenario => {

    const appBundleSource: AppBundleSource = { path: providerHapp };

    const [alice, bob] = await scenario.addPlayersWithApps([{ appBundleSource }, { appBundleSource }]);

    await scenario.shareAllAgents();
  });
});
