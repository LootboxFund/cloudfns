import {
  Address,
  Claim_Firestore,
  Collection,
  doesUserHaveLootboxEditPermission,
  LootboxID,
  LootboxStatus_Firestore,
  LootboxVariant_Firestore,
  Lootbox_Firestore,
  MintWhitelistSignature_Firestore,
  TournamentID,
  Tournament_Firestore,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import { stampNewLootbox, stampNewLootboxSimpleTicket } from "../../api/stamp";
import {
  createLootbox,
  CreateLootboxPayloadLocalType,
  // createLootboxTournamentSnapshot,
  createMintWhitelistSignature,
  editLootbox,
  EditLootboxPayload,
  extractOrGenerateLootboxCreateInput,
  getAffiliateByUserIdpID,
  getLootbox,
  getLootboxCountForUserInTournament,
  getTournamentById,
  getUser,
  getWhitelistByDigest,
} from "../../api/firestore";
import { getStampSecret } from "../../api/secrets";
import { db } from "../../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";
import { ethers } from "ethers";
import { generateNonce, generateTicketDigest } from "../../lib/whitelist";
import { whitelistLootboxMintSignature } from "../../lib/whitelist";
import {
  LootboxType,
  AirdropMetadataCreateInput,
  Tournament,
  LootboxStatus,
  ReferralType,
} from "../../graphql/generated/types";
import { convertLootboxStatusGQLToDB } from "../../lib/lootbox";
import { isInteger } from "../../lib/number";
import * as referralService from "../referral";

export interface CreateLootboxRequest {
  // passed in variables
  description?: string | null;
  backgroundImage?: string | null;
  logoImage?: string | null;
  themeColor?: string | null;
  nftBountyValue?: string | null;
  maxTickets?: number | null;
  joinCommunityUrl?: string;
  symbol?: string | null;
  lootboxName?: string | null;
  tournamentID?: TournamentID;
  type?: LootboxType;
  airdropMetadata?: AirdropMetadataCreateInput;
  isExclusiveLootbox?: boolean;
  isStampV2?: boolean;
  stampMetadata?: {
    playerHeadshot?: string;
    logoURLs?: string[];
  };
}

export const create = async (
  _request: CreateLootboxRequest,
  callerUserID: UserID
): Promise<Lootbox_Firestore> => {
  console.log("creating lootbox", _request);

  // Make sure the tournament exists
  let tournament: Tournament_Firestore | undefined = undefined;
  if (_request.tournamentID) {
    tournament = await getTournamentById(_request.tournamentID);
    if (!tournament || !!tournament.timestamps.deletedAt) {
      throw new Error(
        "Could not create Lootbox. The Requested tournament was not found."
      );
    }
  }

  if (
    _request.nftBountyValue == undefined &&
    tournament?.stampMetadata?.seedLootboxFanTicketValue
  ) {
    // use event seed value if it exists
    _request.nftBountyValue =
      tournament.stampMetadata.seedLootboxFanTicketValue;
  }

  const request = await extractOrGenerateLootboxCreateInput(_request);

  const [host, stampSecret] = await Promise.all([
    tournament
      ? getAffiliateByUserIdpID(tournament?.creatorId as unknown as UserIdpID)
      : null,
    getStampSecret(),
  ]);

  if (tournament && host?.userID !== callerUserID) {
    // This is a player or promoter making the lootbox for the event
    // Make sure user does not make more lootboxes than allowed in event.inviteMetadata
    const maxAmount =
      request.type === LootboxType.Promoter
        ? tournament.inviteMetadata?.maxPromoterLootbox ?? 5
        : tournament.inviteMetadata?.maxPlayerLootbox ?? 5;

    const lootboxCount = await getLootboxCountForUserInTournament(
      callerUserID,
      tournament.id
    );

    if (lootboxCount >= maxAmount) {
      throw new Error(
        `You have already created a Lootbox for this event. Ask the event host if you want to make more.`
      );
    }
  }

  const lootboxDocumentRef = db
    .collection(Collection.Lootbox)
    .doc() as DocumentReference<Lootbox_Firestore>;

  // stamp lootbox image
  let stampImageUrl: string;

  const lootboxLogoURLS = [
    ...(request?.stampMetadata?.logoURLs ? request.stampMetadata.logoURLs : []),
    ...(tournament?.stampMetadata?.logoURLs
      ? tournament.stampMetadata.logoURLs
      : []),
  ];

  if (_request.isStampV2) {
    stampImageUrl = await stampNewLootboxSimpleTicket(stampSecret, {
      coverPhoto: request.backgroundImage,
      themeColor: request.themeColor,
      teamName: request.lootboxName,
      playerHeadshot: request.stampMetadata?.playerHeadshot ?? undefined,
      sponsorLogos: lootboxLogoURLS,
      eventName: tournament?.title || "Lootbox Events",
      hostName: host?.name,
    });
  } else {
    stampImageUrl = await stampNewLootbox(stampSecret, {
      backgroundImage: request.backgroundImage,
      logoImage: request.logoImage,
      themeColor: request.themeColor,
      name: request.lootboxName,
      lootboxID: lootboxDocumentRef.id as LootboxID,
    });
  }

  const payload: CreateLootboxPayloadLocalType = {
    variant: LootboxVariant_Firestore.cosmic,
    creatorID: callerUserID,
    stampImage: stampImageUrl,
    logo: request.logoImage,
    symbol: request.symbol,
    name: request.lootboxName,
    tournamentID: request.tournamentID,
    description: request.description,
    nftBountyValue: request.nftBountyValue,
    maxTickets: request.maxTickets,
    backgroundImage: request.backgroundImage,
    themeColor: request.themeColor,
    joinCommunityUrl: request.joinCommunityUrl,
    type: request.type,
    airdropMetadata: request.airdropMetadata,
    maxTicketsPerUser: tournament?.safetyFeatures?.seedMaxLootboxTicketsPerUser,
    isExclusiveLootbox: request.isExclusiveLootbox,
    // Gives hosts edit access
    createdOnBehalfOf: host?.userID ?? undefined,
    stampMetadata: _request.isStampV2
      ? {
          playerHeadshot: request.stampMetadata?.playerHeadshot ?? null,
          logoURLs: lootboxLogoURLS,
          eventName: tournament?.title || "Lootbox Events",
          hostName: host?.name ?? null,
        }
      : undefined,
  };

  validateCreateLootboxPayload(payload);

  const createdLootbox = await createLootbox(payload, lootboxDocumentRef);

  return createdLootbox;
};

export const whitelist = async (
  whitelisterPrivateKey: string,
  whitelistAddress: Address,
  lootbox: Lootbox_Firestore,
  claim: Claim_Firestore
): Promise<MintWhitelistSignature_Firestore> => {
  console.log("Whitelisting user", { whitelistAddress, lootbox: lootbox.id });

  if (!lootbox.address || !lootbox.chainIdHex) {
    throw new Error("Lootbox has not been deployed");
  }
  if (!ethers.utils.isAddress(whitelistAddress)) {
    throw new Error("Invalid Address");
  }
  if (!lootbox) {
    throw new Error("Lootbox not found");
  }

  const nonce = generateNonce();
  const signer = new ethers.Wallet(whitelisterPrivateKey);
  const digest = generateTicketDigest({
    minterAddress: whitelistAddress,
    lootboxAddress: lootbox.address,
    nonce,
    chainIDHex: lootbox.chainIdHex,
  });

  // Make sure whitelist with the provided digest does not already exist
  const existingWhitelist = await getWhitelistByDigest(lootbox.id, digest);

  if (existingWhitelist) {
    throw new Error("Whitelist already exists!");
  }

  console.log("generating whitelist", {
    whitelistAddress,
    lootbox: lootbox.id,
    signerAddress: signer.address,
    digest,
  });
  const signature = await whitelistLootboxMintSignature(
    lootbox.chainIdHex,
    lootbox.address,
    whitelistAddress,
    whitelisterPrivateKey,
    nonce
  );

  console.log("Adding the signature to DB", {
    whitelistAddress,
    lootbox: lootbox.id,
    signerAddress: signer.address,
    digest: digest,
  });
  const signatureDB = await createMintWhitelistSignature({
    signature,
    signer: signer.address as Address,
    whitelistedAddress: whitelistAddress as Address,
    lootboxId: lootbox.id as LootboxID,
    lootboxAddress: lootbox.address as Address,
    nonce,
    claim,
    digest,
  });

  return signatureDB;
};

interface EditLootboxServiceRequest {
  backgroundImage?: string | null;
  description?: string | null;
  isExclusiveLootbox?: boolean | null;
  joinCommunityUrl?: string | null;
  logo?: string | null;
  maxTickets?: number | null;
  maxTicketsPerUser?: number | null;
  name?: string | null;
  nftBountyValue?: string | null;
  status?: LootboxStatus | null;
  symbol?: string | null;
  themeColor?: string | null;
  stampMetadata?: {
    playerHeadshot: string | null | undefined;
    logoURLs: string[] | undefined;
  };
}

export const edit = async (
  id: LootboxID,
  payload: EditLootboxServiceRequest,
  callerUserID: UserID
): Promise<Lootbox_Firestore> => {
  const [user, lootbox] = await Promise.all([
    getUser(callerUserID),
    getLootbox(id as LootboxID),
  ]);
  if (!user || !!user.deletedAt) {
    throw new Error("User not found");
  }
  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }
  if (!doesUserHaveLootboxEditPermission(lootbox, callerUserID)) {
    throw new Error("You do not have permission to edit this Lootbox");
  }

  const request: EditLootboxPayload = {
    name: payload.name ?? undefined,
    description: payload.description ?? undefined,
    maxTickets: payload.maxTickets ?? undefined,
    nftBountyValue: payload.nftBountyValue ?? undefined,
    // symbol: payload.symbol || undefined,
    joinCommunityUrl: payload.joinCommunityUrl ?? undefined,
    status: payload.status
      ? convertLootboxStatusGQLToDB(payload.status)
      : undefined,
    logo: payload.logo ?? undefined,
    backgroundImage: payload.backgroundImage ?? undefined,
    themeColor: payload.themeColor ?? undefined,
    isExclusiveLootbox: payload.isExclusiveLootbox ?? undefined,
    maxTicketsPerUser: payload.maxTicketsPerUser
      ? Math.round(payload.maxTicketsPerUser)
      : undefined,
    stampMetadata: payload.stampMetadata ?? undefined,
  };

  validateEditLootboxRequest(request);

  const updatedLootbox = await editLootbox(id, request);

  return updatedLootbox;
};

const validateEditLootboxRequest = (payload: EditLootboxPayload) => {
  if (
    payload.status &&
    Object.values(LootboxStatus_Firestore).indexOf(payload.status) === -1
  ) {
    throw new Error("Invalid Status");
  }

  if (payload.maxTicketsPerUser != undefined && payload.maxTicketsPerUser < 1) {
    throw new Error("Max Tickets Per User must be greater than 0");
  }
  if (payload.maxTicketsPerUser && !isInteger(payload.maxTicketsPerUser)) {
    throw new Error("Max Tickets Per User must be an integer");
  }

  if (payload.maxTickets != undefined && payload.maxTickets < 0) {
    throw new Error("Max Tickets must be equal greater than 0");
  }

  if (payload.maxTickets != undefined && !isInteger(payload.maxTickets)) {
    throw new Error("Max Tickets must be an integer");
  }

  if (
    payload.isExclusiveLootbox != undefined &&
    typeof payload.isExclusiveLootbox !== "boolean"
  ) {
    throw new Error("isExclusiveLootbox must be a boolean");
  }

  return true;
};

const validateCreateLootboxPayload = (
  payload: CreateLootboxPayloadLocalType
) => {
  if (
    payload.variant != undefined &&
    Object.values(LootboxVariant_Firestore).indexOf(payload.variant) === -1
  ) {
    throw new Error("Invalid Variant");
  }
  if (
    payload.type != undefined &&
    Object.values(LootboxType).indexOf(payload.type) === -1
  ) {
    throw new Error("Invalid Type");
  }

  if (payload.maxTicketsPerUser && !isInteger(payload.maxTicketsPerUser)) {
    throw new Error("maxTicketsPerUser must be an integer");
  }
  if (payload.maxTicketsPerUser && payload.maxTicketsPerUser < 0) {
    throw new Error("maxTicketsPerUser must be equal or greater than 0");
  }
  if (payload.maxTickets < 0) {
    throw new Error("maxTickets must be equal or greater than 0");
  }
  if (!isInteger(payload.maxTickets)) {
    throw new Error("maxTickets must be an integer");
  }

  return true;
};
