import {
  ActivationID,
  ActivationPricingID,
  AdTargetTag,
  AffiliateBaseLinkID,
  AffiliateID,
  AffiliateType,
  MeasurementPartnerType,
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
  currency: Currency;
  startDate: Date;
  endDate: Date;
  status: OfferStatus;
  affiliateBaseLink: AffiliateBaseLinkID;
  mmp: MeasurementPartnerType;
  activations: Activation_Firestore[];
  targetingTags: AdTargetTag[];
  // adSets: AdSet[];
}

export interface Activation_Firestore {
  id: ActivationID;
  name: string;
  description: string;
  masterPricing: ActivationPricing_Firestore;
}

export interface ActivationPricing_Firestore {
  id: ActivationPricingID;
  activationID: ActivationID;
  pricing: number;
  currency: Currency;
  percentage: number;
  affiliateID: AffiliateID;
  affiliateType: AffiliateType;
}
