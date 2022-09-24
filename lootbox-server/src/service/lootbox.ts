import {
  Address,
  ClaimID,
  LootboxID,
  UserID,
  LootboxMintWhitelistID,
  LootboxTicketID_Web3,
} from "@wormgraph/helpers";
import { ethers } from "ethers";
import { whitelistLootboxMintSignature } from "../api/ethers";
import { createMintWhitelistSignature, finalizeMint } from "../api/firestore";
import { Lootbox, LootboxTicket } from "../graphql/generated/types";
import {
  convertLootboxGQLToDB,
  convertLootboxTicketDBToLootboxTicket,
  convertLootboxToTicketMetadata,
} from "../lib/lootbox";
import { getStampSecret, getWhitelisterPrivateKey } from "../api/secrets";
import { generateNonce } from "../lib/whitelist";
import { stampNewTicket } from "../api/stamp";

export const bulkSignMintWhitelistSignatures = async (
  whitelistAddresses: Address[],
  lootbox: Lootbox
): Promise<{ signatures: (string | null)[]; errors: (string | null)[] }> => {
  const whitelisterPrivateKey = await getWhitelisterPrivateKey();

  const signer = new ethers.Wallet(whitelisterPrivateKey);

  const res = await Promise.allSettled(
    whitelistAddresses.map(async (whitelistAddress) => {
      if (!ethers.utils.isAddress(whitelistAddress)) {
        throw new Error("Invalid Address");
      }
      const nonce = generateNonce();

      const signature = await whitelistLootboxMintSignature(
        lootbox.chainIdHex,
        lootbox.address,
        whitelistAddress,
        whitelisterPrivateKey,
        nonce
      );

      await createMintWhitelistSignature({
        signature,
        signer: signer.address as Address,
        whitelistedAddress: whitelistAddress as Address,
        lootboxId: lootbox.id as LootboxID,
        lootboxAddress: lootbox.address as Address,
        nonce,
      });

      return signature;
    })
  );

  const signatures: (string | null)[] = [];
  const partialErrors: (string | null)[] = [];
  res.forEach((result) => {
    if (result.status === "fulfilled") {
      signatures.push(result.value);
      partialErrors.push(null);
    } else {
      partialErrors.push(result.reason);
      signatures.push(null);
    }
  });

  return { signatures: signatures, errors: partialErrors };
};

interface MintNewTicketCallbackRequest {
  lootbox: Lootbox;
  payload: {
    minterUserID: UserID;
    ticketID: LootboxTicketID_Web3;
    minterAddress: Address;
    mintWhitelistID: LootboxMintWhitelistID;
    claimID?: ClaimID;
  };
}
export const mintNewTicketCallback = async ({
  lootbox,
  payload,
}: MintNewTicketCallbackRequest): Promise<LootboxTicket> => {
  // get the stamp secret
  const secret = await getStampSecret();

  // stamp the new ticket
  const { stampURL, metadataURL } = await stampNewTicket(secret, {
    backgroundImage: lootbox.backgroundImage,
    badgeImage: lootbox.badgeImage ? lootbox.badgeImage : undefined,
    logoImage: lootbox.logo,
    themeColor: lootbox.themeColor,
    name: lootbox.name,
    ticketID: payload.ticketID,
    lootboxAddress: lootbox.address as Address,
    chainIdHex: lootbox.chainIdHex,
    numShares: "1000",
    metadata: convertLootboxToTicketMetadata(
      payload.ticketID,
      convertLootboxGQLToDB(lootbox)
    ),
  });

  const ticketDB = await finalizeMint({
    minterUserID: payload.minterUserID,
    lootboxID: lootbox.id as LootboxID,
    lootboxAddress: lootbox.address as Address,
    ticketID: payload.ticketID as LootboxTicketID_Web3,
    minterAddress: payload.minterAddress as Address,
    mintWhitelistID: payload.mintWhitelistID,
    stampImage: stampURL,
    metadataURL: metadataURL,
    claimID: payload.claimID,
  });

  const ticket = convertLootboxTicketDBToLootboxTicket(ticketDB);

  return ticket;
};
