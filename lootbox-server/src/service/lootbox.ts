import {
  Address,
  Claim_Firestore,
  Collection,
  ContractAddress,
  LootboxID,
  LootboxTicketDigest,
  LootboxVariant_Firestore,
  Lootbox_Firestore,
  MintWhitelistSignature_Firestore,
  TournamentID,
  Tournament_Firestore,
  UserID,
} from "@wormgraph/helpers";
import { stampNewLootbox } from "../api/stamp";
import {
  createLootbox,
  createLootboxTournamentSnapshot,
  createMintWhitelistSignature,
  getTournamentById,
  getWhitelistByDigest,
} from "../api/firestore";
import { getStampSecret } from "../api/secrets";
import { db } from "../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";
import { ethers } from "ethers";
import { generateNonce, generateTicketDigest } from "../lib/whitelist";
import { whitelistLootboxMintSignature } from "../lib/whitelist";
import {
  LootboxType,
  AirdropMetadataCreateInput,
  Tournament,
} from "../graphql/generated/types";

export interface CreateLootboxRequest {
  // passed in variables
  lootboxDescription: string;
  backgroundImage: string;
  logoImage: string;
  themeColor: string;
  nftBountyValue: string;
  maxTickets: number;
  joinCommunityUrl?: string;
  symbol: string;
  creatorID: UserID;
  lootboxName: string;
  tournamentID: TournamentID;
  type?: LootboxType;
  airdropMetadata?: AirdropMetadataCreateInput;
  isSharingDisabled?: boolean;
}

export const create = async (
  request: CreateLootboxRequest
): Promise<Lootbox_Firestore> => {
  console.log("creating lootbox", request);

  // Make sure the tournament exists
  let tournament: Tournament_Firestore | undefined = undefined;
  if (request.tournamentID) {
    tournament = await getTournamentById(request.tournamentID as TournamentID);
    if (!tournament || !!tournament.timestamps.deletedAt) {
      throw new Error(
        "Could not create Lootbox. The Requested tournament was not found."
      );
    }
  }

  const stampSecret = await getStampSecret();
  const lootboxDocumentRef = db
    .collection(Collection.Lootbox)
    .doc() as DocumentReference<Lootbox_Firestore>;

  // stamp lootbox image
  const stampImageUrl = await stampNewLootbox(stampSecret, {
    backgroundImage: request.backgroundImage,
    logoImage: request.logoImage,
    themeColor: request.themeColor,
    name: request.lootboxName,
    lootboxID: lootboxDocumentRef.id as LootboxID,
  });

  const createdLootbox = await createLootbox(
    {
      variant: LootboxVariant_Firestore.cosmic,
      creatorID: request.creatorID,
      stampImage: stampImageUrl,
      logo: request.logoImage,
      symbol: request.symbol,
      name: request.lootboxName,
      tournamentID: request.tournamentID,
      description: request.lootboxDescription,
      nftBountyValue: request.nftBountyValue,
      maxTickets: request.maxTickets,
      backgroundImage: request.backgroundImage,
      themeColor: request.themeColor,
      joinCommunityUrl: request.joinCommunityUrl,
      type: request.type,
      airdropMetadata: request.airdropMetadata,
      maxTicketsPerUser:
        tournament?.safetyFeatures?.seedMaxLootboxTicketsPerUser,
      isSharingDisabled: request.isSharingDisabled,
    },
    lootboxDocumentRef
  );

  if (request.tournamentID) {
    // console.log("Checking to add tournament snapshot", {
    //   tournamentID: request.tournamentID,
    //   lootboxID: createdLootbox.id,
    // });
    // Make sure tournament exists
    const tournament = await getTournamentById(request.tournamentID);
    if (tournament != null) {
      // console.log("creating tournament snapshot", {
      //   tournamentID: request.tournamentID,
      //   lootboxID: createdLootbox.id,
      // });
      await createLootboxTournamentSnapshot({
        tournamentID: request.tournamentID,
        lootboxID: createdLootbox.id,
        lootboxAddress: createdLootbox.address || null,
        creatorID: request.creatorID,
        lootboxCreatorID: request.creatorID,
        description: createdLootbox.description,
        name: createdLootbox.name,
        stampImage: createdLootbox.stampImage,
        type: createdLootbox.type,
      });
    }
  }

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
