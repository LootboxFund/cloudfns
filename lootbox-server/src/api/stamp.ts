import axios from "axios";
import { manifest } from "../manifest";
import {
  StampNewLootboxProps,
  StampNewLootboxResponse,
} from "@wormgraph/helpers";

export const stampNewLootbox = async (
  secret: string,
  props: StampNewLootboxProps
): Promise<string> => {
  console.log("Stamping new lootbox", props);
  const {
    backgroundImage,
    logoImage,
    themeColor,
    name,
    lootboxAddress,
    chainIdHex,
    lootboxID,
  } = props;
  const stampConfig: StampNewLootboxProps = {
    backgroundImage,
    logoImage,
    themeColor,
    name,
    lootboxAddress,
    chainIdHex,
    lootboxID,
  };
  const response = await axios.post<StampNewLootboxResponse>(
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
};
