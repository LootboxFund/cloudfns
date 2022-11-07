import {
  AffiliateID,
  Claim_Firestore,
  Collection,
  OfferID,
  TournamentID,
} from "@wormgraph/helpers";
import { Query } from "firebase-admin/firestore";
import { db } from "../firebase";
import { getOffer } from "./offer";
import * as _ from "lodash";
import { getUser } from "./user";

import {
  UserIdpID,
  Offer_Firestore,
  Lootbox_Firestore,
} from "@wormgraph/helpers";
import { checkIfUserIdpMatchesAffiliate } from "../identityProvider/firebase";
import { PotentialAirdropClaimer } from "../../graphql/generated/types";
import { getTournamentById } from "./tournament";

export const listPotentialAirdropClaimers = async (
  {
    tournamentID,
    offerID,
  }: {
    tournamentID: TournamentID;
    offerID: OfferID;
  },
  userIdpID: UserIdpID
): Promise<PotentialAirdropClaimer[]> => {
  console.log(`
  
    tournamentID: ${tournamentID}
    offerID: ${offerID}

  `);
  // get all claims from tournament
  // get the offer details
  // get the tournament details
  const [tournament, claimsOfThisTournament, offer, claimsOfThisAirdropOffer] =
    await Promise.all([
      getTournamentById(tournamentID),
      listClaimsInTournament(tournamentID),
      getOffer(offerID),
      listClaimsOfAirdropOffer(offerID),
    ]);
  if (!offer) {
    throw new Error("Offer not found");
  }
  console.log(`tournament === ${tournament?.id}`);
  console.log(`--- claims of tournament ---`);
  console.log(
    claimsOfThisTournament.map(
      (c) => `${c.id} = ${c.status} owned by ${c.claimerUserId}`
    )
  );
  console.log(`offer === ${offer?.id}`);
  console.log(`--- claimers of airdrop offer ---`);
  console.log(
    claimsOfThisAirdropOffer.map(
      (c) => `${c.id} = ${c.status} owned by ${c.claimerUserId}`
    )
  );
  if (!tournament || !tournament.organizer) {
    throw new Error("Tournament not found bruh");
  }
  // only allow the tournament owner to view this data
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    tournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  // get unique users from list of tournament claims
  const uniqueClaimersByUserID = _.uniq(
    claimsOfThisTournament
      .filter((c) => c.claimerUserId)
      .map((c) => c.claimerUserId)
  );
  const uniqueUsers = await Promise.all(
    uniqueClaimersByUserID.map((u) => getUser(u))
  );
  console.log(`--- uniqueUsers ---`);
  console.log(uniqueUsers.map((c) => c.id));
  // exclude the user who have received a past airdrop from the offer's airdrop exclusion list
  const airdropOffersToExclude = offer.airdropMetadata?.excludedOffers || [];
  const uniquePotentialUsers = uniqueUsers.filter((u) => {
    console.log(u.airdropsReceived);
    if (!u.airdropsReceived) return true;
    return !u.airdropsReceived.some((r) => airdropOffersToExclude.includes(r));
  });
  console.log(`--- uniquePotentialUsers ---`);
  console.log(uniquePotentialUsers.map((c) => c.id));
  const uniquePotentialClaimers = uniquePotentialUsers
    .map((u) => {
      const claimForUser = claimsOfThisAirdropOffer.find(
        (c) => c.claimerUserId === u.id
      );
      console.log(`--- claimForUser ---
      
      claim = ${claimForUser?.id}
      user = ${u.id}
      
      `);
      const potentialClaimer: PotentialAirdropClaimer = {
        userID: u.id,
        username: u.username,
        avatar: u.avatar,
        tournamentID: tournamentID,
        advertiserID: offer.advertiserID,
        offerID: offerID,
      };
      if (claimForUser && claimForUser.airdropMetadata) {
        potentialClaimer.status = claimForUser.airdropMetadata.claimStatus;
        potentialClaimer.lootboxID = claimForUser.airdropMetadata.lootboxID;
        potentialClaimer.lootboxAddress =
          claimForUser.airdropMetadata.lootboxAddress;
        potentialClaimer.batchAlias = claimForUser.airdropMetadata.batchAlias;
      }
      return potentialClaimer;
    })
    .filter((u) => u);
  return uniquePotentialClaimers;
};

export const listClaimsInTournament = async (
  tournamentID: TournamentID
): Promise<Claim_Firestore[]> => {
  const claimRef = db
    .collectionGroup(Collection.Claim)
    .where("tournamentId", "==", tournamentID) as Query<Claim_Firestore>;
  const claimCollectionItems = await claimRef.get();
  if (claimCollectionItems.empty) {
    return [];
  }
  return claimCollectionItems.docs.map((doc) => doc.data());
};

export const listClaimsOfAirdropOffer = async (
  offerID: OfferID
): Promise<Claim_Firestore[]> => {
  const claimRef = db
    .collection(Collection.Claim)
    .where("airdropMetadata.offerID", "==", offerID) as Query<Claim_Firestore>;
  const claimCollectionItems = await claimRef.get();
  if (claimCollectionItems.empty) {
    return [];
  }
  return claimCollectionItems.docs.map((doc) => doc.data());
};
