/**
 * This code should only be used for local deployments (files like `autotasks/onCreateLootbox/build.ts`)
 * Because it calls external dependencies that might not be bundled into the autotask / sentinel code
 */
export { latest as Manifest } from "@wormgraph/manifest";
