import { ethers } from "ethers";
import { Address } from "@wormgraph/helpers";

interface ValidateSignatureOutput {
  address: Address;
  nonce: string;
}

/**
 * Throws if signature is not valid. Takes an assumed signature of the form:
 *
 * Welcome! Sign this message to login to Lootbox. This doesn't cost you anything and is free of any gas fees.\n
 * Address: {address}\n
 * Nonce: {nonce}\n
 */
export const validateSignature = async (
  message: string,
  signedMessage: string
): Promise<ValidateSignatureOutput> => {
  const signerAddress = ethers.utils.verifyMessage(message, signedMessage);

  const [_welcomePart, addressPart, noncePart] = message.split("\n");

  const addressFromMessage = addressPart?.split(":")[1]?.trim();

  const nonceFromMessage = noncePart?.split(":")[1]?.trim();

  if (!addressFromMessage || !nonceFromMessage) {
    throw new Error("Invalid message");
  }

  if (signerAddress !== addressFromMessage) {
    // this means that the message was not signed
    throw new Error("Signers do not match");
  }

  // TODO: validate nonce is not reused

  return { address: signerAddress as Address, nonce: nonceFromMessage };
};
