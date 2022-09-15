import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  PartyBasketWhitelistSignature,
  PartyBasket,
  PartyBasketStatus,
} from "../../graphql/generated/types";
import { Address, Collection } from "@wormgraph/helpers";
import {
  UserID,
  UserIdpID,
  PartyBasketID,
  WhitelistSignatureID,
} from "../../lib/types";

export const getUserPartyBasketsForLootbox = async (
  id: UserID,
  lootbox: Address
): Promise<PartyBasket[]> => {
  const partyBaskets = db
    .collection(Collection.PartyBasket)
    .where("creatorId", "==", id)
    .where("lootboxAddress", "==", lootbox)
    .where("timestamps.deletedAt", "==", null) as Query<PartyBasket>;

  const partyBasketSnapshot = await partyBaskets.get();
  if (partyBasketSnapshot.empty) {
    return [];
  } else {
    return partyBasketSnapshot.docs.map((doc) => {
      return doc.data();
    });
  }
};

export const getPartyBasketsForLootbox = async (
  lootbox: Address
): Promise<PartyBasket[]> => {
  const partyBaskets = db
    .collection(Collection.PartyBasket)
    .where("lootboxAddress", "==", lootbox)
    .where("timestamps.deletedAt", "==", null)
    .orderBy("timestamps.createdAt", "asc") as Query<PartyBasket>;

  const partyBasketSnapshot = await partyBaskets.get();
  if (partyBasketSnapshot.empty) {
    return [];
  } else {
    return partyBasketSnapshot.docs.map((doc) => {
      return doc.data();
    });
  }
};

export const getUserPartyBaskets = async (
  id: UserID
): Promise<PartyBasket[]> => {
  const partyBaskets = db
    .collection(Collection.PartyBasket)
    .where("creatorId", "==", id) as Query<PartyBasket>;

  const partyBasketSnapshot = await partyBaskets.get();
  if (partyBasketSnapshot.empty) {
    return [];
  } else {
    return partyBasketSnapshot.docs.map((doc) => {
      return doc.data();
    });
  }
};

export const getPartyBasketById = async (
  id: PartyBasketID
): Promise<PartyBasket | undefined> => {
  const partyBasketRef = db
    .collection(Collection.PartyBasket)
    .doc(id) as DocumentReference<PartyBasket>;

  const partyBasketSnapshot = await partyBasketRef.get();
  if (!partyBasketSnapshot.exists) {
    return undefined;
  } else {
    return partyBasketSnapshot.data();
  }
};

export const getPartyBasketByAddress = async (
  address: Address
): Promise<PartyBasket | undefined> => {
  const collectionRef = db
    .collection(Collection.PartyBasket)
    .where("address", "==", address) as Query<PartyBasket>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return undefined;
  } else {
    const doc = collectionSnapshot.docs[0];
    const data = doc.data();
    return data;
  }
};

export const getWhitelistSignaturesByAddress = async (
  whitelistedAddress: Address,
  partyBasketAddress: Address
): Promise<PartyBasketWhitelistSignature[]> => {
  const collectionRef = db
    .collectionGroup(Collection.WhitelistSignature)
    .where("whitelistedAddress", "==", whitelistedAddress)
    .where(
      "partyBasketAddress",
      "==",
      partyBasketAddress
    ) as Query<PartyBasketWhitelistSignature>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });
  }
};

export const getWhitelistSignature = async (
  id: WhitelistSignatureID,
  partyBasketId: PartyBasketID
): Promise<PartyBasketWhitelistSignature | undefined> => {
  const ref = db
    .collection(Collection.PartyBasket)
    .doc(partyBasketId)
    .collection(Collection.WhitelistSignature)
    .doc(id) as DocumentReference<PartyBasketWhitelistSignature>;

  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return undefined;
  } else {
    return snapshot.data();
  }
};

interface CreateWhitelistSignatureRequest {
  signature: string;
  signer: Address;
  whitelistedAddress: Address;
  partyBasketId: PartyBasketID;
  partyBasketAddress: Address;
  nonce: string;
}
export const createWhitelistSignature = async ({
  signature,
  signer,
  whitelistedAddress,
  partyBasketId,
  partyBasketAddress,
  nonce,
}: CreateWhitelistSignatureRequest): Promise<PartyBasketWhitelistSignature> => {
  const signatureRef = db
    .collection(Collection.PartyBasket)
    .doc(partyBasketId)
    .collection(Collection.WhitelistSignature)
    .doc() as DocumentReference<PartyBasketWhitelistSignature>;

  const signatureDocument: PartyBasketWhitelistSignature = {
    id: signatureRef.id,
    isRedeemed: false,
    partyBasketAddress,
    whitelistedAddress,
    signature,
    signer,
    nonce,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
    },
  };

  await signatureRef.set(signatureDocument);

  return signatureDocument;
};

export const redeemSignature = async (
  signatureId: WhitelistSignatureID,
  partyBasketId: PartyBasketID
): Promise<PartyBasketWhitelistSignature> => {
  const signatureRef = db
    .collection(Collection.PartyBasket)
    .doc(partyBasketId)
    .collection(Collection.WhitelistSignature)
    .doc(signatureId) as DocumentReference<PartyBasketWhitelistSignature>;

  const updatePayload: Partial<PartyBasketWhitelistSignature> = {
    isRedeemed: true,
    // TODO: Update timestamp updatedAt!
  };

  await signatureRef.update(updatePayload);

  return (await signatureRef.get()).data() as PartyBasketWhitelistSignature;
};

interface CreatePartyBasketRequest {
  address: Address;
  factory: Address;
  creatorId: UserIdpID | UserID;
  name: string;
  chainIdHex: string;
  lootboxAddress: Address;
  creatorAddress: Address;
  nftBountyValue?: string;
  joinCommunityUrl?: string;
  maxClaimsAllowed: number;
}
export const createPartyBasket = async ({
  address,
  factory,
  creatorId,
  name,
  chainIdHex,
  lootboxAddress,
  creatorAddress,
  nftBountyValue,
  joinCommunityUrl,
  maxClaimsAllowed,
}: CreatePartyBasketRequest) => {
  const partyBasketRef = db
    .collection(Collection.PartyBasket)
    .doc() as DocumentReference<PartyBasket>;

  const partyBasketDocument: PartyBasket = {
    id: partyBasketRef.id,
    address,
    factory,
    creatorId,
    name,
    lootboxAddress,
    chainIdHex,
    creatorAddress,
    status: PartyBasketStatus.Active,
    maxClaimsAllowed: maxClaimsAllowed,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
  };

  if (nftBountyValue) {
    partyBasketDocument.nftBountyValue = nftBountyValue;
  }

  if (joinCommunityUrl) {
    partyBasketDocument.joinCommunityUrl = joinCommunityUrl;
  }

  await partyBasketRef.set(partyBasketDocument);

  return partyBasketDocument;
};

interface EditPartyBasketRequest {
  id: PartyBasketID;
  name?: string | null;
  nftBountyValue?: string | null;
  joinCommunityUrl?: string | null;
  status?: PartyBasketStatus | null;
  maxClaimsAllowed?: number | null;
}

export const editPartyBasket = async ({
  id,
  name,
  nftBountyValue,
  joinCommunityUrl,
  status,
  maxClaimsAllowed,
}: EditPartyBasketRequest): Promise<PartyBasket> => {
  const partyBasketRef = db
    .collection(Collection.PartyBasket)
    .doc(id) as DocumentReference<PartyBasket>;

  const updatePayload: Partial<PartyBasket> = {};

  if (name != undefined) {
    updatePayload.name = name;
  }
  if (nftBountyValue != undefined) {
    updatePayload.nftBountyValue = nftBountyValue;
  }
  if (joinCommunityUrl != undefined) {
    updatePayload.joinCommunityUrl = joinCommunityUrl;
  }
  if (status != undefined) {
    updatePayload.status = status;
  }

  if (maxClaimsAllowed != undefined) {
    updatePayload.maxClaimsAllowed = maxClaimsAllowed;
  }

  updatePayload["timestamps.updatedAt"] = Timestamp.now().toMillis();

  await partyBasketRef.update(updatePayload);

  return (await partyBasketRef.get()).data() as PartyBasket;
};
