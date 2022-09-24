import axios from "axios";
import { manifest } from "../manifest";
import { Address, ChainIDHex, ContractAddress, Url } from "@wormgraph/helpers";
import { LootboxTicketMetadataV2_Firestore } from "./firestore/lootbox.types";

interface StampNewTicketProps {
  backgroundImage: Url;
  badgeImage?: Url;
  logoImage: Url;
  themeColor: string;
  name: string;
  ticketID: string;
  lootboxAddress: Address;
  chainIdHex: ChainIDHex;
  numShares: string;
  metadata: LootboxTicketMetadataV2_Firestore;
}
interface StampNewTicketResponse {
  stamp: string;
  uri: string;
}
export const stampNewTicket = async (
  secret: string,
  props: StampNewTicketProps
): Promise<{ stampURL: string; metadataURL: string }> => {
  const {
    backgroundImage,
    logoImage,
    themeColor,
    name,
    ticketID,
    lootboxAddress,
    chainIdHex,
    numShares,
    metadata,
  } = props;
  const stampConfig = {
    backgroundImage,
    logoImage,
    themeColor,
    name,
    ticketID,
    lootboxAddress,
    chainIdHex,
    numShares,
    metadata,
  };
  const response = await axios.post<StampNewTicketResponse>(
    manifest.cloudRun.containers.stampNewTicket.fullRoute,
    JSON.stringify(stampConfig),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secret,
      },
    }
  );
  const { stamp, uri } = response.data;

  return { stampURL: stamp, metadataURL: uri };
};
