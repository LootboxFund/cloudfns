import { BigNumber } from "ethers";
import { Address } from ".";

export interface ERC20_TransferEvent {
  from: Address;
  to: Address;
  value: BigNumber;
}

export interface Event_GuildCreated {
  contractAddress: Address;
  guildTokenName: string;
  guildTokenSymbol: string;
  dao: Address;
  developer: Address;
  creator: Address;
  guildFactory: Address;
}

export interface Event_CrowdSaleCreated {
  crowdsaleAddress: Address;
  guildToken: Address;
  dao: Address;
  developer: Address;
  treasury: Address;
  startingPrice: BigNumber;
  deployer: Address;
}


export interface Event_LootboxCreated {
  lootboxName: string;
  lootbox: Address;
  issuer: Address;
  treasury: Address;
  maxSharesSold: BigNumber;
  sharePriceUSD: BigNumber;
}
