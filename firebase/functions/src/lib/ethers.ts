import { ethers } from "ethers";
import { randomBytes } from "crypto";
import { LootboxMintSignatureNonce } from "@wormgraph/helpers";

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

export const generateNonce = (): LootboxMintSignatureNonce => {
    const bytes = randomBytes(16);
    return hexToDecimalString(bytes.toString("hex"));
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
