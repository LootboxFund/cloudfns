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
    const data = await fetch(
      manifest.cloudRun.containers.stampNewLootbox.fullRoute,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          secret,
        },
        body: JSON.stringify(stampConfig),
      }
    );
    const { stamp } = (await data.json()) as StampResponse;
    return stamp;
  } catch (e) {
    console.log(e);
    return "";
  }
};
