import axios from "axios";
import { manifest } from "../manifest";
import {
    StampNewTicketProps,
    StampNewTicketResponse,
    StampNewLootboxProps,
    StampNewLootboxResponse,
} from "@wormgraph/helpers";
import { logger } from "firebase-functions";

export const stampNewLootbox = async (props: StampNewLootboxProps): Promise<string> => {
    logger.info("Stamping new lootbox", props);
    const { backgroundImage, logoImage, themeColor, name, lootboxAddress, chainIdHex } = props;
    const stampConfig: StampNewLootboxProps = {
        backgroundImage,
        logoImage,
        themeColor,
        name,
        lootboxAddress,
        chainIdHex,
    };
    const secret = process.env.STAMP_SECRET || "";
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

export const stampNewTicket = async (
    props: StampNewTicketProps
): Promise<{ stampURL: string; metadataURL: string }> => {
    const secret = process.env.STAMP_SECRET || "";
    const { backgroundImage, logoImage, themeColor, name, ticketID, lootboxAddress, chainIdHex, metadata } = props;
    const stampConfig: StampNewTicketProps = {
        backgroundImage,
        logoImage,
        themeColor,
        name,
        ticketID,
        lootboxAddress,
        chainIdHex,
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
