import { BigNumber } from "ethers";
import { Address } from ".";

export interface ERC20_TransferEvent {
  from: Address;
  to: Address;
  value: BigNumber;
}
