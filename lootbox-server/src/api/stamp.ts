import axios from "axios";
import { manifest } from "../manifest";
import {
  StampNewTicketProps,
  StampNewTicketResponse,
  LootboxTicketMetadataV2_Firestore,
  Address,
  ChainIDHex,
  Url,
} from "@wormgraph/helpers";

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
