import axios from "axios";
import { manifest } from "../manifest";
import { ChainIDHex, ContractAddress, Url } from "@wormgraph/helpers";
import { logger } from "firebase-functions";

// TODO move to helpers
interface StampNewLootboxProps {
    backgroundImage: Url;
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

export const stampNewLootbox = async (props: StampNewLootboxProps): Promise<string> => {
    logger.info("Stamping new lootbox", props);
    const { backgroundImage, logoImage, themeColor, name, ticketID, lootboxAddress, chainIdHex, numShares } = props;
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
    const secret = process.env.STAMP_SECRET || "";
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
};
