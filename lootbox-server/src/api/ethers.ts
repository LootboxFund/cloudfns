import { ethers, VoidSigner } from "ethers";
import { Address } from "@wormgraph/helpers";

interface ValidateSignatureOutput {
  address: Address;
  nonce: string;
}

interface ValidatePartyBasketSignatureOutput {
  address: Address;
  nonce: string;
  partyBasket: Address;
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

/**
 * Throws if signature is not valid. Takes an assumed signature of the form:
 *
 * Welcome! Sign this message to login to Lootbox. This doesn't cost you anything and is free of any gas fees.\n
 * Address: {address}\n
 * Party Basket: {address}\n
 * Nonce: {nonce}\n
 */
export const validatePartyBasketSignature = async (
  message: string,
  signedMessage: string
): Promise<ValidatePartyBasketSignatureOutput> => {
  const signerAddress = ethers.utils.verifyMessage(message, signedMessage);

  const [_welcomePart, addressPart, partyBasketPart, noncePart] =
    message.split("\n");

  const addressFromMessage = addressPart?.split(":")[1]?.trim();

  const nonceFromMessage = noncePart?.split(":")[1]?.trim();

  const partyBasketFromMessage = partyBasketPart?.split(":")[1]?.trim();

  if (!ethers.utils.isAddress(partyBasketFromMessage)) {
    throw new Error("Invalid Party Basket address");
  }

  if (!addressFromMessage || !nonceFromMessage) {
    throw new Error("Invalid message");
  }

  if (signerAddress !== addressFromMessage) {
    // this means that the message was not signed
    throw new Error("Signers do not match");
  }

  // TODO: validate nonce is not reused

  return {
    address: signerAddress as Address,
    nonce: nonceFromMessage,
    partyBasket: partyBasketFromMessage as Address,
  };
};

export const whitelistPartyBasketSignature = async (
  chainId: string, // Decimal chainId
  contractAddress: string,
  mintingAddress: string,
  whitelisterPrivateKey: string,
  nonce: string // String version of uint 256 number
): Promise<string> => {
  // Domain data should match whats specified in the DOMAIN_SEPARATOR constructed in the contract
  // https://github.com/msfeldstein/EIP712-whitelisting/blob/main/contracts/EIP712Whitelisting.sol#L33-L43
  const domain = {
    name: "PartyBasket",
    version: "1",
    chainId,
    verifyingContract: contractAddress,
  };

  // The types should match the TYPEHASH specified in the contract
  // https://github.com/msfeldstein/EIP712-whitelisting/blob/main/contracts/EIP712Whitelisting.sol#L27-L28
  const types = {
    Minter: [
      { name: "wallet", type: "address" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const signer = new ethers.Wallet(whitelisterPrivateKey);
  const signature = signer._signTypedData(domain, types, {
    wallet: mintingAddress,
    nonce,
  });

  return signature;
};

export const whitelistLootboxMintSignature = async (
  chainId: string, // Decimal chainId
  contractAddress: string,
  mintingAddress: string,
  whitelisterPrivateKey: string,
  nonce: string // String version of uint 256 number
): Promise<string> => {
  // Domain data should match whats specified in the DOMAIN_SEPARATOR constructed in the contract
  // https://github.com/msfeldstein/EIP712-whitelisting/blob/main/contracts/EIP712Whitelisting.sol#L33-L43
  const domain = {
    name: "LootboxCosmic",
    version: "1",
    chainId,
    verifyingContract: contractAddress,
  };

  // The types should match the TYPEHASH specified in the contract
  // https://github.com/msfeldstein/EIP712-whitelisting/blob/main/contracts/EIP712Whitelisting.sol#L27-L28
  const types = {
    Minter: [
      { name: "wallet", type: "address" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const signer = new ethers.Wallet(whitelisterPrivateKey);
  const signature = signer._signTypedData(domain, types, {
    wallet: mintingAddress,
    nonce,
  });

  return signature;
};
