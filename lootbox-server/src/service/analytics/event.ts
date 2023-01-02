import {
  AffiliateID,
  OfferID,
  TournamentID,
  Tournament_Firestore,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import {
  getEventOfferClaimsWithQAByEvent,
  EventOfferClaimWithQARow,
} from "../../api/analytics";
import { getTournamentById } from "../../api/firestore";
import { checkIfUserIdpMatchesAffiliate } from "../../api/identityProvider/firebase";
import { manifest } from "../../manifest";

interface getOfferClaimsWithQARequest {
  eventID: TournamentID;
  offerID: OfferID;
  callerUserID: UserIdpID;
}
export const eventOfferClaimsWithQA = async (
  payload: getOfferClaimsWithQARequest
): Promise<{
  data: EventOfferClaimWithQARow[];
  tournament: Tournament_Firestore;
}> => {
  const [tournament] = await Promise.all([getTournamentById(payload.eventID)]);
  if (!tournament || !tournament.organizer) {
    throw new Error("Tournament not found");
  }
  if (!tournament?.offers || !tournament.offers[payload.offerID]) {
    throw new Error("Offer not found");
  }
  // only allow the tournament owner to view this data
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    payload.callerUserID as unknown as UserIdpID,
    tournament.organizer as AffiliateID
  );
  if (
    !isValidUserAffiliate ||
    tournament.creatorId !== (payload.callerUserID as unknown as UserID)
  ) {
    throw Error(
      `Unauthorized. User do not have permissions to get analytics for this tournament`
    );
  }

  const data = await getEventOfferClaimsWithQAByEvent({
    queryParams: {
      eventID: tournament.id as TournamentID,
      offerID: payload.offerID as OfferID,
    },
    questionAnswerTable:
      manifest.bigQuery.datasets.firestoreExport.tables.questionAnswer.id,
    offerTable: manifest.bigQuery.datasets.firestoreExport.tables.offer.id,
    flightTable: manifest.bigQuery.datasets.firestoreExport.tables.flight.id,
    location: manifest.bigQuery.datasets.firestoreExport.location,
    claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
    userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
    claimPrivacyTable:
      manifest.bigQuery.datasets.firestoreExport.tables.claimPrivacy.id,
  });

  return { data, tournament };
};
