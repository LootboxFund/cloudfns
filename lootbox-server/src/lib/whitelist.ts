import { ethers, VoidSigner } from "ethers";
import {
  Address,
  ChainIDHex,
  LootboxMintSignatureNonce,
  LootboxTicketDigest,
} from "@wormgraph/helpers";
import { randomBytes } from "crypto";

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

/** @deprecated, use whitelistLootboxMintSignature */
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

/** @deprecated */
export const generateNonceV1 = (): LootboxMintSignatureNonce => {
  const hexToDec = (s: string) => {
    var i,
      j,
      digits = [0],
      carry;
    for (i = 0; i < s.length; i += 1) {
      carry = parseInt(s.charAt(i), 16);
      for (j = 0; j < digits.length; j += 1) {
        digits[j] = digits[j] * 16 + carry;
        carry = (digits[j] / 10) | 0;
        digits[j] %= 10;
      }
      while (carry > 0) {
        digits.push(carry % 10);
        carry = (carry / 10) | 0;
      }
    }
    return digits.reverse().join("");
  };
  const bytes = randomBytes(16);
  return hexToDec(bytes.toString("hex")) as LootboxMintSignatureNonce;
};

export const generateNonce = (): LootboxMintSignatureNonce => {
  const bytes = randomBytes(16);
  return hexToDecimalString(bytes.toString("hex"));
};

export const generateTicketDigest = (params: {
  minterAddress: Address;
  lootboxAddress: Address;
  nonce: LootboxMintSignatureNonce; // String version of uint 256 number
  chainIDHex: ChainIDHex;
}): LootboxTicketDigest => {
  const domainSeparator = generateLootboxCosmicDomainSignature(
    params.lootboxAddress,
    params.chainIDHex
  );

  const MINTER_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Minter(address wallet,uint256 nonce)")
  );

  const structHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "address", "uint256"],
      [MINTER_TYPEHASH, params.minterAddress, params.nonce]
    )
  );

  const expectedDigest = ethers.utils.keccak256(
    ethers.utils.concat([
      ethers.utils.toUtf8Bytes("\x19\x01"),
      ethers.utils.arrayify(domainSeparator),
      ethers.utils.arrayify(structHash),
    ])
  );

  return expectedDigest as LootboxTicketDigest;
};

const hexToDecimalString = (s: string): LootboxMintSignatureNonce => {
  const digits = [0];
  let carry: number;
  for (let i = 0; i < s.length; i += 1) {
    carry = parseInt(s.charAt(i), 16);
    for (let j = 0; j < digits.length; j += 1) {
      digits[j] = digits[j] * 16 + carry;
      carry = (digits[j] / 10) | 0;
      digits[j] %= 10;
    }
    while (carry > 0) {
      digits.push(carry % 10);
      carry = (carry / 10) | 0;
    }
  }
  return digits.reverse().join("") as LootboxMintSignatureNonce;
};

export const generateLootboxCosmicDomainSignature = (
  address: Address,
  chainIDHex: ChainIDHex
) => {
  const chain = hexToDecimalString(chainIDHex.replace("0x", ""));
  const domainSeparator = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
          )
        ),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LootboxCosmic")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("1")),
        chain,
        address,
      ]
    )
  );
  return domainSeparator;
};
