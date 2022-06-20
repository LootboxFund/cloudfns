import axios from "axios";
import manifest from "../manifest/manifest";
import { ChainIDHex, ContractAddress, Url } from "../manifest/types.helpers";

// stamp the lootbox
interface StampNewLootboxProps {
  backgroundImage: Url;
  badgeImage?: Url;
  logoImage: Url;
  themeColor: string;
  name: string;
  ticketID: string;
  lootboxAddress: ContractAddress;
  chainIdHex: ChainIDHex;
  numShares: string;
}

interface StampResponse {
  stamp: string;
}

export const stampNewLootbox = async (
  secret: string,
  props: StampNewLootboxProps
): Promise<string> => {
  const {
    backgroundImage,
    logoImage,
    themeColor,
    name,
    ticketID,
    lootboxAddress,
    chainIdHex,
    numShares,
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
  };

  try {
    const response = await axios.post<StampResponse>(
      manifest.cloudRun.containers.stampNewLootbox.fullRoute,
      JSON.stringify(stampConfig),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secret,
        },
      }
    );

    const { stamp } = response.data;
    return stamp;
  } catch (e) {
    console.error("Error stamping lootbox", e?.message);
    console.error(e);
    return "";
  }
};
