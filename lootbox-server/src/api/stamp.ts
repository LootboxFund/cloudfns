import axios from "axios";
import { manifest } from "../manifest";
import {
  StampSimpleTicketResponse,
  StampSimpleTicketProps,
  StampNewLootboxProps,
  StampNewLootboxResponse,
  StampInviteTicketProps,
  StampInviteTicketResponse,
} from "@wormgraph/helpers";

interface StampSimpleTicketPropsBE {
  coverPhoto: string;
  sponsorLogos: string[];
  teamName: string;
  playerHeadshot?: string;
  themeColor: string;
}

export const stampNewLootboxSimpleTicket = async (
  secret: string,
  props: StampSimpleTicketPropsBE
): Promise<string> => {
  const stampConfig: StampSimpleTicketProps = {
    coverPhoto: props.coverPhoto,
    sponsorLogos: props.sponsorLogos,
    teamName: props.teamName,
    playerHeadshot: props.playerHeadshot,
    themeColor: props.themeColor,
  };
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
}

export const createInviteStamp = async (
  secret: string,
  props: InviteStampPropsBE
): Promise<string> => {
  const stampConfig: StampInviteTicketProps = {
    coverPhoto: props.coverPhoto,
    sponsorLogos: props.sponsorLogos,
    teamName: props.teamName,
    playerHeadshot: props.playerHeadshot,
    themeColor: props.themeColor,
    ticketValue: props.ticketValue,
    qrCodeLink: props.qrCodeLink,
  };
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

/** @deprecated this is the old lootbox design. Use the other functions in this file instead */
export const stampNewLootbox = async (
  secret: string,
  props: StampNewLootboxProps
): Promise<string> => {
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
