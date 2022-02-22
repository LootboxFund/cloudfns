import { SemanticVersion } from "@lootboxfund/helpers";
export type GBucketName = "guildfx-exchange.appspot.com";

export interface Terrasemver {
  gcloud: GCloud_Config;
}

export interface GCloud_Config {
  bucketName: "guildfx-exchange.appspot.com";
  prefixes: GBucketPrefixes;
  semver: SemanticVersion;
}
export type GBucketPrefixes = "tokens" | "crowdsales" | "guilds" | "abi" | "lootbox" | "lootbox-uri";
