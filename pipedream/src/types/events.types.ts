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
  paramsKeys: [
    "contractAddress",
    "guildTokenName",
    "guildTokenSymbol",
    "dao",
    "developer",
    "creator",
    "guildFactory"
  ];
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
