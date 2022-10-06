import { Address, LootboxID, Lootbox_Firestore } from "@wormgraph/helpers";
import { ethers } from "ethers";
import { whitelistLootboxMintSignature } from "../api/ethers";
import { createMintWhitelistSignature } from "../api/firestore";
import { getWhitelisterPrivateKey } from "../api/secrets";
import { generateNonce } from "../lib/whitelist";
import { generateTicketDigest } from "../lib/lootbox";

export const bulkSignMintWhitelistSignatures = async (
  whitelistAddresses: Address[],
  lootbox: Lootbox_Firestore
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

      const digest = generateTicketDigest({
        minterAddress: whitelistAddress,
        lootboxAddress: lootbox.address as Address,
        nonce,
        chainIDHex: lootbox.chainIdHex,
      });

      await createMintWhitelistSignature({
        signature,
        signer: signer.address as Address,
        whitelistedAddress: whitelistAddress,
        lootboxId: lootbox.id,
        lootboxAddress: lootbox.address,
        nonce,
        digest,
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
