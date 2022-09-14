import {
  ActivationID,
  ActivationPricingID,
  AdTargetTag,
  AffiliateBaseLink,
  AffiliateID,
  AffiliateType,
  MeasurementPartnerType,
  UserID,
  AdSetID,
  ActivationStatus,
} from "@wormgraph/helpers";
import { AdvertiserID, Currency, OfferID, OfferStatus } from "../../lib/types";

export interface Offer_Firestore {
  id: OfferID;
  title: string;
  description: string;
  image: string;
  advertiserID: AdvertiserID;
  spentBudget: number;
  maxBudget: number;
  // currency: Currency;
  startDate: number;
  endDate: number;
  status: OfferStatus;
  affiliateBaseLink: AffiliateBaseLink;
  mmp: MeasurementPartnerType;
  activations: Activation_Firestore[];
  // targetingTags: AdTargetTag[];
  adSets: AdSetID[];
}

export type OfferPreview = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "adSets"
>;

export type OfferPreviewForOrganizer = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "createdByUser"
>;

export interface Activation_Firestore {
  id: ActivationID;
  name: string;
  description: string;
  pricing: number;
  status: ActivationStatus;
  count?: number;
}
