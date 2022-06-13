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

  const headers = new Headers({
    "Content-Type": "application/json",
    secret,
  });
  try {
    const data = await fetch(
      manifest.cloudRun.containers.stampNewLootbox.fullRoute,
      {
        method: "POST",
        headers: headers,
        mode: "cors",
        cache: "default",
        body: JSON.stringify(stampConfig),
      }
    );
    const { stamp } = await data.json();
    return stamp;
  } catch (e) {
    console.log(e);
    return "";
  }
};
