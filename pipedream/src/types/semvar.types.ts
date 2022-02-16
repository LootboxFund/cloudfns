export type SemanticVersion = "0.0.1-sandbox" | "0.1.0-demo";
export type GBucketName = "guildfx-exchange.appspot.com";

export interface TerraSemvar {
  gcloud: GCloud_Config;
}

export interface GCloud_Config {
  bucketName: "guildfx-exchange.appspot.com";
  prefixes: GBucketPrefixes;
  semvar: SemanticVersion;
}
export type GBucketPrefixes = "tokens" | "crowdsales" | "guilds" | "abi" | "lootbox";
