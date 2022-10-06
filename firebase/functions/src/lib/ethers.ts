import { ethers } from "ethers";
import { randomBytes } from "crypto";
import { Address, ChainIDHex, LootboxMintSignatureNonce, LootboxTicketDigest } from "@wormgraph/helpers";

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

export const generateLootboxCosmicDomainSignature = (address: Address, chainIDHex: ChainIDHex) => {
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

export const generateTicketDigest = (params: {
    minterAddress: Address;
    lootboxAddress: Address;
    nonce: LootboxMintSignatureNonce; // String version of uint 256 number
    chainIDHex: ChainIDHex;
}): LootboxTicketDigest => {
    const domainSeparator = generateLootboxCosmicDomainSignature(params.lootboxAddress, params.chainIDHex);

    const MINTER_TYPEHASH = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Minter(address wallet,uint256 nonce)"));

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
