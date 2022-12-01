import { OfferStrategy, Offer_Firestore } from "@wormgraph/helpers";

export interface OfferPreview
  extends Omit<
    Offer_Firestore,
    "affiliateBaseLink" | "mmp" | "activations" | "adSets"
  > {
  strategy: OfferStrategy;
}

export type OfferPreviewForOrganizer = Omit<
  Offer_Firestore,
  "affiliateBaseLink" | "mmp" | "activations" | "createdByUser"
>;
