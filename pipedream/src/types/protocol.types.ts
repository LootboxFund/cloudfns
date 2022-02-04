import { Address, ChainIDDecimal, ChainIDHex, Url } from "./base.types";
import { TerraSemvar, SemanticVersion } from "./semvar.types";

export interface TokenData {
  address: Address;
  decimals: number;
  name: string;
  symbol: string;
  chainIdHex: ChainIDHex;
  chainIdDecimal: ChainIDDecimal;
  logoURI: Url;
  priceOracle: Address;
}

export interface GCloudBucketFragment {
  semvar: SemanticVersion;
  chainIDHex: ChainIDHex;
  prefix: string;
  bucket: TerraSemvar["gcloud"]["bucketName"];
  data: TokenData;
}

export type ABIUtilRepresenation = {
  abi: string;
  keys: string[];
};
