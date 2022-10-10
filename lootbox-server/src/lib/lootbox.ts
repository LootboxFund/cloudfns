import {
  Address,
  LootboxID,
  UserID,
  LootboxTicket_Firestore,
  Lootbox_Firestore,
  LootboxVariant_Firestore,
  LootboxStatus_Firestore,
  MintWhitelistSignature_Firestore,
} from "@wormgraph/helpers";
import { LootboxDeprecated_Firestore } from "../api/firestore/lootbox.types";
import {
  Lootbox,
  LootboxSnapshot,
  LootboxStatus,
  LootboxTicket,
  LootboxVariant,
  MintWhitelistSignature,
} from "../graphql/generated/types";

export const parseMintWhitelistSignature = (
  data: MintWhitelistSignature_Firestore
): MintWhitelistSignature_Firestore => {
  const res: MintWhitelistSignature_Firestore = {
    id: data.id,
    signature: data.signature,
    signer: data.signer,
    whitelistedAddress: data.whitelistedAddress,
    lootboxAddress: data.lootboxAddress,
    isRedeemed: data.isRedeemed,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt || null,
    nonce: data.nonce,
    lootboxTicketID: data.lootboxTicketID,
    lootboxID: data.lootboxID,
    digest: data.digest,
    userID: data.userID,
  };

  return res;
};

export const convertLootboxTicketDBToGQL = (
  ticketDB: LootboxTicket_Firestore
): LootboxTicket => {
  const ticket: LootboxTicket = {
    id: ticketDB.id,
    lootboxID: ticketDB.lootboxID,
    lootboxAddress: ticketDB.lootboxAddress,
    minterUserID: ticketDB.minterUserID,
    minterAddress: ticketDB.minterAddress,
    createdAt: ticketDB.createdAt,
    metadataURL: ticketDB.metadataURL,
    mintWhitelistID: ticketDB.mintWhitelistID,
    stampImage: ticketDB.stampImage,
    ticketID: ticketDB.ticketID,
    nonce: ticketDB.nonce,
    digest: ticketDB.digest,
  };

  return ticket;
};

export const parseLootboxDB = (
  lootbox: Lootbox_Firestore
): Lootbox_Firestore => {
  const lootboxDB: Lootbox_Firestore = {
    id: lootbox.id,
    address: lootbox.address,
    factory: lootbox.factory,
    creatorAddress: lootbox.creatorAddress,
    chainIdHex: lootbox.chainIdHex,
    variant: lootbox.variant,
    creatorID: lootbox.creatorID,
    chainIdDecimal: lootbox.chainIdDecimal,
    chainName: lootbox.chainName,
    transactionHash: lootbox.transactionHash,
    blockNumber: lootbox.blockNumber,
    name: lootbox.name,
    description: lootbox.description,
    status: lootbox.status,
    nftBountyValue: lootbox.nftBountyValue,
    joinCommunityUrl: lootbox.joinCommunityUrl,
    maxTickets: lootbox.maxTickets,
    stampImage: lootbox.stampImage,
    logo: lootbox.logo,
    backgroundImage: lootbox.backgroundImage,
    themeColor: lootbox.themeColor,
    symbol: lootbox.symbol,
    baseTokenURI: lootbox.baseTokenURI,
    timestamps: {
      createdAt: lootbox.timestamps.createdAt,
      updatedAt: lootbox.timestamps.updatedAt,
      deletedAt: lootbox.timestamps.deletedAt || null,
    },
    metadata: lootbox.metadata, // deprecated, dont use
    runningCompletedClaims: lootbox.runningCompletedClaims || 0,
  };

  return lootboxDB;
};

export const convertLootboxVariantDBToGQL = (
  variant: LootboxVariant_Firestore
): LootboxVariant => {
  switch (variant) {
    case LootboxVariant_Firestore.escrow:
      return LootboxVariant.Escrow;
    case LootboxVariant_Firestore.instant:
      return LootboxVariant.Instant;
    case LootboxVariant_Firestore.cosmic:
    default:
      return LootboxVariant.Cosmic;
  }
};

export const convertLootboxVariantGQLToDB = (
  variant: LootboxVariant
): LootboxVariant_Firestore => {
  switch (variant) {
    case LootboxVariant.Escrow:
      return LootboxVariant_Firestore.escrow;
    case LootboxVariant.Instant:
      return LootboxVariant_Firestore.instant;
    case LootboxVariant.Cosmic:
    default:
      return LootboxVariant_Firestore.cosmic;
  }
};

export const convertLootboxStatusDBToGQL = (
  status: LootboxStatus_Firestore
): LootboxStatus => {
  switch (status) {
    case LootboxStatus_Firestore.active:
      return LootboxStatus.Active;
    case LootboxStatus_Firestore.soldOut:
      return LootboxStatus.SoldOut;
    case LootboxStatus_Firestore.disabled:
    default:
      return LootboxStatus.Disabled;
  }
};

export const convertLootboxStatusGQLToDB = (
  status: LootboxStatus
): LootboxStatus_Firestore => {
  switch (status) {
    case LootboxStatus.Active:
      return LootboxStatus_Firestore.active;
    case LootboxStatus.SoldOut:
      return LootboxStatus_Firestore.soldOut;
    case LootboxStatus.Disabled:
    default:
      return LootboxStatus_Firestore.disabled;
  }
};

export const convertLootboxGQLToDB = (lootbox: Lootbox): Lootbox_Firestore => {
  return {
    id: lootbox.id as LootboxID,
    address: lootbox.address as Address,
    factory: lootbox.factory as Address,
    creatorAddress: lootbox.creatorAddress as Address,
    chainIdHex: lootbox.chainIdHex,
    variant: convertLootboxVariantGQLToDB(lootbox.variant),
    creatorID: lootbox.creatorID as UserID,
    timestamps: {
      createdAt: lootbox.timestamps.createdAt,
      updatedAt: lootbox.timestamps.updatedAt,
      deletedAt: lootbox.timestamps.deletedAt || null,
    },
    chainIdDecimal: lootbox.chainIdDecimal,
    chainName: lootbox.chainName,
    transactionHash: lootbox.transactionHash,
    blockNumber: lootbox.blockNumber,
    name: lootbox.name,
    description: lootbox.description,
    status: lootbox.status
      ? convertLootboxStatusGQLToDB(lootbox.status)
      : LootboxStatus_Firestore.disabled,
    nftBountyValue: !!lootbox.nftBountyValue
      ? lootbox.nftBountyValue
      : undefined,
    joinCommunityUrl: !!lootbox.joinCommunityUrl
      ? lootbox.joinCommunityUrl
      : undefined,
    maxTickets: lootbox.maxTickets,
    stampImage: lootbox.stampImage,
    logo: lootbox.logo,
    backgroundImage: lootbox.backgroundImage,
    themeColor: lootbox.themeColor,
    symbol: lootbox.symbol,
    baseTokenURI: lootbox.baseTokenURI,
    runningCompletedClaims: lootbox.runningCompletedClaims || 0,
  };
};

export const convertLootboxDBToGQL = (lootbox: Lootbox_Firestore): Lootbox => {
  if (lootbox.variant === LootboxVariant_Firestore.cosmic) {
    return {
      id: lootbox.id,
      address: lootbox.address,
      factory: lootbox.factory,
      creatorAddress: lootbox.creatorAddress,
      chainIdHex: lootbox.chainIdHex,
      variant: convertLootboxVariantDBToGQL(lootbox.variant),
      creatorID: lootbox.creatorID,
      timestamps: lootbox.timestamps,
      chainIdDecimal: lootbox.chainIdDecimal,
      chainName: lootbox.chainName,
      transactionHash: lootbox.transactionHash,
      blockNumber: lootbox.blockNumber,
      name: lootbox.name,
      description: lootbox.description,
      status: lootbox.status
        ? convertLootboxStatusDBToGQL(lootbox.status)
        : LootboxStatus.Disabled,
      nftBountyValue: lootbox.nftBountyValue,
      joinCommunityUrl: lootbox.joinCommunityUrl,
      maxTickets: lootbox.maxTickets,
      stampImage: lootbox.stampImage,
      logo: lootbox.logo,
      backgroundImage: lootbox.backgroundImage,
      // badgeImage: lootbox.badgeImage,
      themeColor: lootbox.themeColor,
      // version: lootbox.version,
      symbol: lootbox.symbol || "",
      baseTokenURI: lootbox.baseTokenURI,
      runningCompletedClaims: lootbox.runningCompletedClaims || 0,
    };
  } else {
    // this should all be removed soon
    const deprecatedLootbox = lootbox as unknown as LootboxDeprecated_Firestore; // coerce the deprecated type
    return {
      id: "",
      address: deprecatedLootbox.address,
      factory: deprecatedLootbox.factory,
      creatorAddress: "",
      creatorID: "",
      chainIdHex: deprecatedLootbox.chainIdHex,
      variant: convertLootboxVariantDBToGQL(deprecatedLootbox.variant),
      timestamps: deprecatedLootbox.timestamps,
      chainIdDecimal:
        deprecatedLootbox.metadata.lootboxCustomSchema.chain.chainIdDecimal,
      chainName: deprecatedLootbox.metadata.lootboxCustomSchema.chain.chainName,
      transactionHash:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.transactionHash,
      blockNumber:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.blockNumber,
      name: deprecatedLootbox.name,
      description:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.description,
      status: LootboxStatus.Active,
      nftBountyValue: "",
      joinCommunityUrl: "",
      maxTickets: 0,
      stampImage: deprecatedLootbox.metadata.image,
      logo: deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.image,
      backgroundImage:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.backgroundImage,
      // badgeImage:
      //   deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.badgeImage,
      themeColor:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.backgroundColor,
      symbol: "",
      baseTokenURI: "",
      runningCompletedClaims: lootbox.runningCompletedClaims || 0,
    };
  }
};

export const convertMintWhitelistSignatureDBToGQL = (
  data: MintWhitelistSignature_Firestore
): MintWhitelistSignature => {
  const res: MintWhitelistSignature = {
    lootboxID: data.lootboxID,
    id: data.id,
    signature: data.signature,
    signer: data.signer,
    whitelistedAddress: data.whitelistedAddress,
    lootboxAddress: data.lootboxAddress,
    isRedeemed: data.isRedeemed,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt || null,
    nonce: data.nonce,
    digest: data.digest,
    lootboxTicketID: data.lootboxTicketID,
  };

  return res;
};

/** @deprecated this abstract will be removed soon */
export const convertLootboxToSnapshot = (
  lootbox: Lootbox_Firestore | LootboxDeprecated_Firestore
): LootboxSnapshot => {
  if (lootbox.variant === LootboxVariant_Firestore.cosmic) {
    lootbox = lootbox as Lootbox_Firestore;
    return {
      address: lootbox.address,
      issuer: lootbox.creatorAddress,
      name: lootbox.name,
      metadataDownloadUrl: "",
      description: lootbox.description,
      timestamps: {
        updatedAt: lootbox.timestamps.updatedAt,
        createdAt: lootbox.timestamps.createdAt,
      },
      backgroundColor: lootbox.themeColor,
      backgroundImage: lootbox.backgroundImage,
      image: lootbox.logo,
      stampImage: lootbox.stampImage,
    };
  } else {
    // DEPRECATED
    return convertLootboxToSnapshotOld(lootbox as LootboxDeprecated_Firestore);
  }
};

/** @deprecated use convertLootboxToSnapshot */
const convertLootboxToSnapshotOld = (
  data: LootboxDeprecated_Firestore
): LootboxSnapshot => {
  return {
    address: data.address,
    issuer: data.issuer,
    name: data.name,
    metadataDownloadUrl: data.metadataDownloadUrl,
    description:
      data?.metadata?.lootboxCustomSchema?.lootbox?.description || "",
    timestamps: {
      updatedAt: data.timestamps.updatedAt,
      createdAt: data.timestamps.createdAt,
    },
    backgroundColor:
      data?.metadata?.lootboxCustomSchema?.lootbox.backgroundColor || "",
    backgroundImage:
      data?.metadata?.lootboxCustomSchema?.lootbox.backgroundImage || "",
    image: data?.metadata?.lootboxCustomSchema?.lootbox.image || "",
    stampImage: data?.metadata?.image || "",
  };
};

// // WARN: DUPLICATED IN FIREBASE FUNCTIONS
// export const generateLootboxCosmicDomainSignature = (
//   address: Address,
//   chainIDHex: ChainIDHex
// ) => {
//   const chain = convertHexToDecimal(chainIDHex);
//   const domainSeparator = ethers.utils.keccak256(
//     ethers.utils.defaultAbiCoder.encode(
//       ["bytes32", "bytes32", "bytes32", "uint256", "address"],
//       [
//         ethers.utils.keccak256(
//           ethers.utils.toUtf8Bytes(
//             "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
//           )
//         ),
//         ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LootboxCosmic")),
//         ethers.utils.keccak256(ethers.utils.toUtf8Bytes("1")),
//         chain,
//         address,
//       ]
//     )
//   );
//   return domainSeparator;
// };

// // WARN: DUPLICATED IN FIREBASE FUNCTIONS
// export const generateTicketDigest = (params: {
//   minterAddress: Address;
//   lootboxAddress: Address;
//   nonce: LootboxMintSignatureNonce; // String version of uint 256 number
//   chainIDHex: ChainIDHex;
// }): LootboxTicketDigest => {
//   const domainSeparator = generateLootboxCosmicDomainSignature(
//     params.lootboxAddress,
//     params.chainIDHex
//   );

//   const MINTER_TYPEHASH = ethers.utils.keccak256(
//     ethers.utils.toUtf8Bytes("Minter(address wallet,uint256 nonce)")
//   );

//   const structHash = ethers.utils.keccak256(
//     ethers.utils.defaultAbiCoder.encode(
//       ["bytes32", "address", "uint256"],
//       [MINTER_TYPEHASH, params.minterAddress, params.nonce]
//     )
//   );

//   const expectedDigest = ethers.utils.keccak256(
//     ethers.utils.concat([
//       ethers.utils.toUtf8Bytes("\x19\x01"),
//       ethers.utils.arrayify(domainSeparator),
//       ethers.utils.arrayify(structHash),
//     ])
//   );

//   return expectedDigest as LootboxTicketDigest;
// };
