import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  CreateAdPayload,
  CreateAdSetPayload,
  EditAdPayload,
  EditAdSetPayload,
  EditAdSetResponse,
} from "../../graphql/generated/types";
import { AdID, AdvertiserID } from "../../lib/types";
import { db } from "../firebase";
import {
  AdSetStatus,
  AdSet_Firestore,
  AdStatus,
  Ad_Firestore,
  CreativeType,
} from "./ad.types";
import { v4 as uuidv4 } from "uuid";
import {
  AdSetID,
  Collection,
  OfferID,
  Offer_Firestore,
  Placement,
} from "@wormgraph/helpers";

// export const getAdById = async (adId: AdID): Promise<Ad | undefined> => {
//   const adRef = db.collection(Collection.Ad).doc(adId) as DocumentReference<Ad>;
//   const data = await adRef.get();
//   if (data.exists) {
//     return data.data();
//   } else {
//     return undefined;
//   }
// };

export const createAd = async (
  payload: CreateAdPayload
): Promise<Ad_Firestore | undefined> => {
  const adRef = db
    .collection(Collection.Ad)
    .doc() as DocumentReference<Ad_Firestore>;
  const adSchema: Ad_Firestore = {
    id: adRef.id as AdID,
    advertiserID: payload.advertiserID as AdvertiserID,
    status: payload.status as AdStatus,
    name: payload.name,
    description: payload.description || "",
    placement: payload.placement,
    publicInfo: payload.publicInfo || "",
    impressions: 0,
    clicks: 0,
    uniqueClicks: 0,
    creative: {
      adID: adRef.id as AdID,
      advertiserID: payload.advertiserID as AdvertiserID,
      creativeType: payload.creative.creativeType as CreativeType,
      creativeLinks: payload.creative.creativeLinks,
      callToAction: payload.creative.callToAction,
      thumbnail: payload.creative.thumbnail,
      infographicLink: payload.creative.infographicLink || "",
      aspectRatio: payload.creative.aspectRatio,
      themeColor: payload.creative.themeColor || "",
    },
    events: [],
    timestamps: {
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    },
  };
  await adRef.set(adSchema);
  const recentAdRef = db
    .collection(Collection.Ad)
    .doc(adRef.id) as DocumentReference<Ad_Firestore>;
  const recentAdSnapshot = await recentAdRef.get();
  if (!recentAdSnapshot.exists) {
    return undefined;
  }
  return recentAdSnapshot.data();
};

export const editAd = async (
  payload: EditAdPayload
): Promise<Ad_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const adRef = db
    .collection(Collection.Ad)
    .doc(payload.id) as DocumentReference<Ad_Firestore>;
  const adSnapshot = await adRef.get();
  if (!adSnapshot.exists) {
    return undefined;
  }
  const existingAd = adSnapshot.data();
  if (!existingAd) return undefined;
  const updatePayload: Partial<Ad_Firestore> = {};
  // repeat
  if (payload.name != undefined) {
    updatePayload.name = payload.name;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.status != undefined) {
    updatePayload.status = payload.status;
  }
  if (payload.publicInfo != undefined) {
    updatePayload.publicInfo = payload.publicInfo;
  }
  if (payload.placement != undefined) {
    updatePayload.placement = payload.placement;
  }
  if (payload.creative != undefined) {
    updatePayload.creative = {
      ...existingAd.creative,
    };
    if (payload.creative.creativeType != undefined) {
      updatePayload.creative.creativeType = payload.creative
        .creativeType as CreativeType;
    }
    if (payload.creative.creativeLinks != undefined) {
      updatePayload.creative.creativeLinks = payload.creative.creativeLinks;
    }
    if (payload.creative.callToAction != undefined) {
      updatePayload.creative.callToAction = payload.creative.callToAction;
    }
    if (payload.creative.thumbnail != undefined) {
      updatePayload.creative.thumbnail = payload.creative.thumbnail;
    }
    if (payload.creative.infographicLink != undefined) {
      updatePayload.creative.infographicLink = payload.creative.infographicLink;
    }
    if (payload.creative.aspectRatio != undefined) {
      updatePayload.creative.aspectRatio = payload.creative.aspectRatio;
    }
    if (payload.creative.themeColor != undefined) {
      updatePayload.creative.themeColor = payload.creative.themeColor;
    }
  }
  // until done
  await adRef.update(updatePayload);
  return (await adRef.get()).data() as Ad_Firestore;
};

export const createAdSet = async (
  payload: CreateAdSetPayload
): Promise<AdSet_Firestore> => {
  const adSetRef = db
    .collection(Collection.AdSet)
    .doc() as DocumentReference<AdSet_Firestore>;
  const newAdSet: AdSet_Firestore = {
    id: adSetRef.id as AdSetID,
    name: payload.name,
    description: payload.description || "",
    advertiserID: payload.advertiserID as AdvertiserID,
    status: payload.status as AdSetStatus,
    placement: payload.placement as Placement,
    adIDs: payload.adIDs as AdID[],
    offerIDs: payload.offerIDs as OfferID[],
  };
  await adSetRef.set(newAdSet);

  // update the offers
  const offerRefs = payload.offerIDs.map((oid) => {
    return db
      .collection(Collection.Offer)
      .doc(oid) as DocumentReference<Offer_Firestore>;
  });
  const offerSnapshots = await Promise.all(offerRefs.map((ref) => ref.get()));
  const offers = offerSnapshots
    .filter((snap) => snap.exists)
    .map((snapshot) => snapshot.data()) as Offer_Firestore[];
  //
  await Promise.all(
    offers.map((offer, i) => {
      const updatePayload: Partial<Offer_Firestore> = {
        adSets: [...offer.adSets, adSetRef.id as AdSetID],
      };
      return offerRefs[i].update(updatePayload);
    })
  );
  return newAdSet;
};

export const editAdSet = async (
  payload: EditAdSetPayload
): Promise<AdSet_Firestore | undefined> => {
  const adSetRef = db
    .collection(Collection.AdSet)
    .doc(payload.id) as DocumentReference<AdSet_Firestore>;
  const adSetSnapshot = await adSetRef.get();
  if (!adSetSnapshot.exists) {
    return undefined;
  }
  const existingAdSet = adSetSnapshot.data();
  if (!existingAdSet) return undefined;

  // mark the existing offerIDs
  const existingOfferIDs = existingAdSet.offerIDs || [];

  const updatePayload: Partial<AdSet_Firestore> = {};
  // repeat
  if (payload.name != undefined) {
    updatePayload.name = payload.name;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }

  if (payload.status != undefined) {
    updatePayload.status = payload.status;
  }
  if (payload.adIDs != undefined) {
    updatePayload.adIDs = payload.adIDs as AdID[];
  }
  if (payload.offerIDs != undefined) {
    updatePayload.offerIDs = payload.offerIDs as OfferID[];
  }
  // update the ad set
  await adSetRef.update(updatePayload);

  // update the offers
  if (payload.offerIDs != undefined) {
    const offerRefs = payload.offerIDs.map((oid) => {
      return db
        .collection(Collection.Offer)
        .doc(oid) as DocumentReference<Offer_Firestore>;
    });
    const offerSnapshots = await Promise.all(offerRefs.map((ref) => ref.get()));
    const offers = offerSnapshots
      .filter((snap) => snap.exists)
      .map((snapshot) => snapshot.data()) as Offer_Firestore[];

    //
    const offersRemoved: OfferID[] = existingOfferIDs.filter((oid) => {
      return !(payload.offerIDs || []).includes(oid);
    });
    const offerRefsOfRemoved = offersRemoved.map((o) => {
      return db
        .collection(Collection.Offer)
        .doc(o) as DocumentReference<Offer_Firestore>;
    });
    const offersOfRemoved = (
      await Promise.all(
        offerRefsOfRemoved.map((o) => {
          return o.get();
        })
      )
    ).map((o) => o.data()) as Offer_Firestore[];
    await Promise.all(
      offersOfRemoved.map((o, i) => {
        if (o !== undefined) {
          const updatePayload: Partial<Offer_Firestore> = {
            adSets: (o.adSets || []).filter((asi) => asi !== adSetRef.id),
          };
          offerRefsOfRemoved[i].update(updatePayload);
        }
      })
    );

    const newOffersAdded: OfferID[] = (
      (payload.offerIDs || []) as OfferID[]
    ).filter((oid) => {
      return !existingOfferIDs.includes(oid);
    });
    await Promise.all(
      newOffersAdded
        .map((oid) => {
          const offerRef = offerRefs.find((o) => o.id === oid);
          const offer = offers.find((o) => o.id === oid);
          return {
            offerRef,
            offer,
          };
        })
        .filter((o) => o.offerRef && o.offer)
        .map(({ offerRef, offer }) => {
          const updatePayload: Partial<Offer_Firestore> = {
            adSets: ((offer as Offer_Firestore).adSets || []).concat([
              adSetRef.id as AdSetID,
            ]),
          };
          (offerRef as DocumentReference<Offer_Firestore>).update(
            updatePayload
          );
        })
    );
  }
  return (await adSetRef.get()).data() as AdSet_Firestore;
};

export const listAdsOfAdvertiser = async (
  advertiserID: AdvertiserID
): Promise<Ad_Firestore[] | undefined> => {
  const AdRef = db
    .collection(Collection.Ad)
    .where("advertiserID", "==", advertiserID) as Query<Ad_Firestore>;

  const adCollectionItems = await AdRef.get();
  console.log(`adCollectionItems`);
  console.log(adCollectionItems.empty);
  if (adCollectionItems.empty) {
    return [];
  } else {
    return adCollectionItems.docs.map((doc) => {
      console.log(doc.data());
      const data = doc.data();
      return data;
    });
  }
};

export const listAdSetsOfAdvertiser = async (
  advertiserID: AdvertiserID
): Promise<AdSet_Firestore[] | undefined> => {
  const AdSetRef = db
    .collection(Collection.AdSet)
    .where("advertiserID", "==", advertiserID) as Query<AdSet_Firestore>;

  const adSetCollectionItems = await AdSetRef.get();

  if (adSetCollectionItems.empty) {
    return [];
  } else {
    return adSetCollectionItems.docs.map((doc) => {
      const data = doc.data();
      return data;
    });
  }
};

export const getAdsOfAdSet = async (
  adSetIDs: AdID[]
): Promise<Ad_Firestore[]> => {
  if (adSetIDs.length === 0) return [];
  const AdRef = db
    .collection(Collection.Ad)
    .where("id", "in", adSetIDs) as Query<Ad_Firestore>;

  const adCollectionItems = await AdRef.get();

  if (adCollectionItems.empty) {
    return [];
  }
  return adCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
};

export const getAdSet = async (
  adSetID: AdSetID
): Promise<AdSet_Firestore | undefined> => {
  const adSetRef = db
    .collection(Collection.AdSet)
    .doc(adSetID) as DocumentReference<AdSet_Firestore>;
  const adSetSnapshot = await adSetRef.get();

  if (!adSetSnapshot.exists) {
    return undefined;
  } else {
    return adSetSnapshot.data();
  }
};

export const getAd = async (adID: AdID): Promise<Ad_Firestore | undefined> => {
  const adRef = db
    .collection(Collection.Ad)
    .doc(adID) as DocumentReference<Ad_Firestore>;
  const adSnapshot = await adRef.get();

  if (!adSnapshot.exists) {
    return undefined;
  }
  return adSnapshot.data();
};
