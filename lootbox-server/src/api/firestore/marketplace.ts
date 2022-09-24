import {
  Activation_Firestore,
  Collection,
  OfferStatus,
  Offer_Firestore,
  OrganizerRank,
  rankInfoTable,
} from "@wormgraph/helpers";
import { Query } from "firebase-admin/firestore";
import * as _ from "lodash";
import {
  MarketplacePreviewAffiliate,
  MarketplacePreviewOffer,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import { getAdvertiser } from "./advertiser";
import { Advertiser_Firestore } from "./advertiser.type";
import { Affiliate_Firestore } from "./affiliate.type";
import { listActiveActivationsForOffer } from "./offer";

export const browseAllAffiliates = async (): Promise<
  MarketplacePreviewAffiliate[]
> => {
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .where(
      "organizerRank",
      "!=",
      OrganizerRank.GhostRank0
    ) as Query<Affiliate_Firestore>;

  const affiliateCollectionItems = await affiliateRef.get();

  if (affiliateCollectionItems.empty) {
    return [];
  }
  const affiliates = affiliateCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      description: data.description,
      rank: data.organizerRank,
    };
  });
  return affiliates;
};

export const browseActiveOffers = async (
  rank: OrganizerRank
): Promise<MarketplacePreviewOffer[]> => {
  const offerRef = db
    .collection(Collection.Offer)
    .where("status", "==", OfferStatus.Active) as Query<Offer_Firestore>;

  const offerCollectionItems = await offerRef.get();

  if (offerCollectionItems.empty) {
    return [];
  }
  const rankInfo = rankInfoTable[rank];
  const offers = offerCollectionItems.docs.map((doc) => doc.data());
  const uniqueAdvertiserIDs = _.uniq(offers.map((o) => o.advertiserID));
  const [advertisers, activations]: [
    advertisers: (Advertiser_Firestore | undefined)[],
    activations: Activation_Firestore[][]
  ] = await Promise.all([
    Promise.all(
      uniqueAdvertiserIDs.map((aid) => {
        return getAdvertiser(aid);
      })
    ),
    Promise.all(
      offers.map((offer) => {
        return listActiveActivationsForOffer(offer.id);
      })
    ),
  ]);
  const allActivations: Activation_Firestore[] = _.flatten(activations);
  const offerPreviewInMarketplace = offers.map((offer) => {
    const advertiser = (
      advertisers.filter((a) => a) as Advertiser_Firestore[]
    ).find((a) => a.id === offer.advertiserID);
    const activationsRelated = allActivations.filter(
      (a) => a.offerID === offer.id
    );
    const lowerEarn =
      (_.min(activationsRelated.map((a) => a.pricing)) || 0) *
      rankInfo.revenueShare;
    const upperEarn =
      (_.sum(activationsRelated.map((a) => a.pricing)) || 0) *
      rankInfoTable.DiamondRank7.revenueShare;
    return {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      image: offer.image,
      advertiserID: offer.advertiserID,
      advertiserName: advertiser?.name || "",
      advertiserAvatar: advertiser?.avatar || "",
      lowerEarn,
      upperEarn,
    };
  });
  return offerPreviewInMarketplace;
};
