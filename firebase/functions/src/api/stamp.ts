import axios from "axios";
import { manifest } from "../manifest";
import {
    StampNewTicketProps,
    StampNewTicketResponse,
    StampNewLootboxProps,
    StampNewLootboxResponse,
    StampSimpleTicketProps,
    StampSimpleTicketResponse,
    StampInviteTicketProps,
    StampInviteTicketResponse,
    StampVictoryTicketProps,
    StampVictoryTicketResponse,
} from "@wormgraph/helpers";
import { logger } from "firebase-functions";

/** @deprecated this is the old design */
export const stampNewLootbox = async (props: StampNewLootboxProps): Promise<string> => {
    logger.info("Stamping new lootbox", props);
    const { backgroundImage, logoImage, themeColor, name, lootboxAddress, chainIdHex, lootboxID } = props;
    const stampConfig: StampNewLootboxProps = {
        backgroundImage,
        logoImage,
        themeColor,
        name,
        lootboxAddress,
        chainIdHex,
        lootboxID,
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
    const { backgroundImage, logoImage, themeColor, name, ticketID, lootboxAddress, chainIdHex, metadata, lootboxID } =
        props;
    const stampConfig: StampNewTicketProps = {
        backgroundImage,
        logoImage,
        themeColor,
        name,
        ticketID,
        lootboxAddress,
        chainIdHex,
        metadata,
        lootboxID,
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

interface StampSimpleTicketPropsBE {
    coverPhoto: string;
    sponsorLogos: string[];
    teamName: string;
    playerHeadshot?: string;
    themeColor: string;
    eventName?: string;
    hostName?: string;
}

export const stampNewLootboxSimpleTicket = async (props: StampSimpleTicketPropsBE): Promise<string> => {
    const stampConfig: StampSimpleTicketProps = {
        coverPhoto: props.coverPhoto,
        sponsorLogos: props.sponsorLogos,
        teamName: props.teamName,
        playerHeadshot: props.playerHeadshot,
        themeColor: props.themeColor,
        eventName: props.eventName,
        hostName: props.hostName,
    };
    const secret = process.env.STAMP_SECRET || "";
    const response = await axios.post<StampSimpleTicketResponse>(
        manifest.cloudRun.containers.simpleLootboxStamp.fullRoute,
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

interface InviteStampPropsBE {
    coverPhoto: string;
    sponsorLogos: string[];
    teamName: string;
    playerHeadshot?: string;
    themeColor: string;
    ticketValue: string;
    qrCodeLink: string;
    eventName?: string;
    hostName?: string;
}

export const createInviteStamp = async (props: InviteStampPropsBE): Promise<string> => {
    const stampConfig: StampInviteTicketProps = {
        coverPhoto: props.coverPhoto,
        sponsorLogos: props.sponsorLogos,
        teamName: props.teamName,
        playerHeadshot: props.playerHeadshot,
        themeColor: props.themeColor,
        ticketValue: props.ticketValue,
        qrCodeLink: props.qrCodeLink,
        eventName: props.eventName,
        hostName: props.hostName,
    };
    const secret = process.env.STAMP_SECRET || "";
    const response = await axios.post<StampInviteTicketResponse>(
        manifest.cloudRun.containers.inviteStamp.fullRoute,
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

interface StampVictoryTicketPropsBE {
    eventName?: string;
    hostName?: string;
    coverPhoto: string;
    sponsorLogos: string[];
    teamName: string;
    playerHeadshot?: string;
    themeColor: string;
    ticketValue: string;
    qrCodeLink: string;
}

export const stampNewVictoryTicket = async (props: StampVictoryTicketPropsBE): Promise<string> => {
    const stampConfig: StampVictoryTicketProps = {
        coverPhoto: props.coverPhoto,
        sponsorLogos: props.sponsorLogos,
        teamName: props.teamName,
        playerHeadshot: props.playerHeadshot,
        themeColor: props.themeColor,
        eventName: props.eventName,
        hostName: props.hostName,
        ticketValue: props.ticketValue,
        qrCodeLink: props.qrCodeLink,
    };
    const secret = process.env.STAMP_SECRET || "";
    const response = await axios.post<StampVictoryTicketResponse>(
        manifest.cloudRun.containers.victoryStamp.fullRoute,
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
