import {
  ContractAddress,
  Lootbox_Firestore,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import { stampNewLootbox } from "../api/stamp";
import {
  createLootbox,
  createLootboxTournamentSnapshot,
  getTournamentById,
} from "../api/firestore";
import { getStampSecret } from "../api/secrets";

interface CreateLootboxRequest {
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
  tournamentID?: TournamentID;
}

export const create = async (
  request: CreateLootboxRequest
): Promise<Lootbox_Firestore> => {
  console.log("creating lootbox", request);
  const stampSecret = await getStampSecret();

  // stamp lootbox image
  const stampImageUrl = await stampNewLootbox(stampSecret, {
    backgroundImage: request.backgroundImage,
    logoImage: request.logoImage,
    themeColor: request.themeColor,
    name: request.lootboxName,
    // TODO FIX THESE:
    lootboxAddress: "0x0" as unknown as ContractAddress,
    chainIdHex: "0x89", // DEFAULT POLYGON?
    // lootboxAddress: request.lootboxAddress as unknown as ContractAddress,
    // chainIdHex: chain.chainIdHex,
  });

  const createdLootbox = await createLootbox({
    creatorID: request.creatorID,
    stampImage: stampImageUrl,
    logo: request.logoImage,
    symbol: request.symbol,
    name: request.lootboxName,
    description: request.lootboxDescription,
    nftBountyValue: request.nftBountyValue,
    maxTickets: request.maxTickets,
    backgroundImage: request.backgroundImage,
    themeColor: request.themeColor,
    joinCommunityUrl: request.joinCommunityUrl,
  });

  if (request.tournamentID) {
    console.log("Checking to add tournament snapshot", {
      tournamentID: request.tournamentID,
      lootboxID: createdLootbox.id,
    });
    // Make sure tournament exists
    const tournament = await getTournamentById(request.tournamentID);
    if (tournament != null) {
      console.log("creating tournament snapshot", {
        tournamentID: request.tournamentID,
        lootboxID: createdLootbox.id,
      });
      await createLootboxTournamentSnapshot({
        tournamentID: request.tournamentID,
        lootboxID: createdLootbox.id,
        lootboxAddress: createdLootbox.address || null,
        creatorID: request.creatorID,
        lootboxCreatorID: request.creatorID,
        description: createdLootbox.description,
        name: createdLootbox.name,
        stampImage: createdLootbox.stampImage,
      });
    }
  }

  return createdLootbox;
};

// import { Address, LootboxID, Lootbox_Firestore } from "@wormgraph/helpers";
// import { ethers } from "ethers";
// import { whitelistLootboxMintSignature } from "../api/ethers";
// import { createMintWhitelistSignature } from "../api/firestore";
// import { getWhitelisterPrivateKey } from "../api/secrets";
// import { generateNonce } from "../lib/whitelist";
// import { generateTicketDigest } from "../lib/lootbox";

// export const bulkSignMintWhitelistSignatures = async (
//   whitelistAddresses: Address[],
//   lootbox: Lootbox_Firestore
// ): Promise<{ signatures: (string | null)[]; errors: (string | null)[] }> => {
//   const whitelisterPrivateKey = await getWhitelisterPrivateKey();

//   const signer = new ethers.Wallet(whitelisterPrivateKey);

//   const res = await Promise.allSettled(
//     whitelistAddresses.map(async (whitelistAddress) => {
//       if (!ethers.utils.isAddress(whitelistAddress)) {
//         throw new Error("Invalid Address");
//       }
//       const nonce = generateNonce();

//       const signature = await whitelistLootboxMintSignature(
//         lootbox.chainIdHex,
//         lootbox.address,
//         whitelistAddress,
//         whitelisterPrivateKey,
//         nonce
//       );

//       const digest = generateTicketDigest({
//         minterAddress: whitelistAddress,
//         lootboxAddress: lootbox.address as Address,
//         nonce,
//         chainIDHex: lootbox.chainIdHex,
//       });

//       await createMintWhitelistSignature({
//         signature,
//         signer: signer.address as Address,
//         whitelistedAddress: whitelistAddress,
//         lootboxId: lootbox.id,
//         lootboxAddress: lootbox.address,
//         nonce,
//         digest,
//         userID: null,
//       });

//       return signature;
//     })
//   );

//   const signatures: (string | null)[] = [];
//   const partialErrors: (string | null)[] = [];
//   res.forEach((result) => {
//     if (result.status === "fulfilled") {
//       signatures.push(result.value);
//       partialErrors.push(null);
//     } else {
//       partialErrors.push(result.reason);
//       signatures.push(null);
//     }
//   });

//   return { signatures: signatures, errors: partialErrors };
// };
