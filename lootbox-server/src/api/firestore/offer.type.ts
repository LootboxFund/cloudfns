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
  Offer_Firestore,
} from "@wormgraph/helpers";
import { AdvertiserID, Currency, OfferID, OfferStatus } from "../../lib/types";

export type OfferPreview = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "adSets"
>;

export type OfferPreviewForOrganizer = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "createdByUser"
>;
