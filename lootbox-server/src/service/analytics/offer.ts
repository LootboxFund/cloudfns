import { OfferID, Offer_Firestore, UserIdpID } from "@wormgraph/helpers";
import { getOfferClaimsWithQA, OfferClaimWithQARow } from "../../api/analytics";
import { getOffer } from "../../api/firestore";
import { checkIfUserIdpMatchesAdvertiser } from "../../api/identityProvider/firebase";
import { manifest } from "../../manifest";

interface getOfferClaimsWithQARequest {
  offerID: OfferID;
  callerUserID: UserIdpID;
}
export const offerClaimsWithQA = async (
  payload: getOfferClaimsWithQARequest
): Promise<{
  data: OfferClaimWithQARow[];
  offer: Offer_Firestore;
}> => {
  const offer = await getOffer(payload.offerID);
  if (!offer) {
    throw new Error("Offer not found");
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    payload.callerUserID as unknown as UserIdpID,
    offer.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(`Unauthorized. User do not have permissions for this offer`);
  }

  const data = await getOfferClaimsWithQA({
    queryParams: {
      offerID: payload.offerID as OfferID,
    },
    questionAnswerTable:
      manifest.bigQuery.datasets.firestoreExport.tables.questionAnswer.id,
    offerTable: manifest.bigQuery.datasets.firestoreExport.tables.offer.id,
    flightTable: manifest.bigQuery.datasets.firestoreExport.tables.flight.id,
    location: manifest.bigQuery.datasets.firestoreExport.location,
    claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
    userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
    eventTable: manifest.bigQuery.datasets.firestoreExport.tables.tournament.id,
    claimPrivacyTable:
      manifest.bigQuery.datasets.firestoreExport.tables.claimPrivacy.id,
  });

  return { data, offer };
};
