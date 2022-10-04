import { Offer_Firestore } from "@wormgraph/helpers";

export type OfferPreview = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "adSets"
>;

export type OfferPreviewForOrganizer = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "createdByUser"
>;
