import { Address, ChainIDDecimal, ChainIDHex, Url } from "@lootboxfund/helpers";
import { Terrasemver } from "./semver.types";
import { SemanticVersion } from '@lootboxfund/helpers';

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
  semver: SemanticVersion;
  chainIDHex: ChainIDHex;
  prefix: string;
  bucket: Terrasemver["gcloud"]["bucketName"];
  data: TokenData;
}

export type ABIUtilRepresenation = {
  abi: string;
  keys: string[];
};
