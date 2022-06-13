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
    secret:
      "s;dkjnf;kn;qwkqnewljbflsiubdiuchsdkfljblj1bljbljbjlh23bjh3b24jh3b5k2jdluvsigbaskjcmldsgowpeifjwkjeb23gv2uh42k3jo34uw8eyfisudhbkjwebckjndoi23j4o",
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
