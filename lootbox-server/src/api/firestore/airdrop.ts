import {
  AffiliateID,
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  Collection,
  LootboxID,
  OfferID,
  QuestionAnswerID,
  ReferralID,
  ReferralSlug,
  ReferralType_Firestore,
  TournamentID,
  UserID,
  User_Firestore,
} from "@wormgraph/helpers";
import { Query } from "firebase-admin/firestore";
import { db } from "../firebase";
import { getOffer, getQuestionByID } from "./offer";
import * as _ from "lodash";
import { getUser } from "./user";

import {
  UserIdpID,
  Offer_Firestore,
  Lootbox_Firestore,
} from "@wormgraph/helpers";
import { checkIfUserIdpMatchesAffiliate } from "../identityProvider/firebase";
import {
  ListPotentialAirdropClaimersResponseSuccess,
  PotentialAirdropClaimer,
  QuestionAnswerPreview,
} from "../../graphql/generated/types";
import { getTournamentById } from "./tournament";
import { _createAirdropClaim, _createClaim } from "./referral";
import { ClaimRedemptionStatus } from "../../graphql/generated/types";

export const listPotentialAirdropClaimers = async (
  {
    tournamentID,
    offerID,
  }: {
    tournamentID: TournamentID;
    offerID: OfferID;
  },
  userIdpID: UserIdpID
): Promise<Omit<ListPotentialAirdropClaimersResponseSuccess, "__typename">> => {
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
  if (!tournament || !tournament.organizer) {
    throw new Error("Tournament not found");
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
  const uniqueUsers = (
    await Promise.all(uniqueClaimersByUserID.map((u) => getUser(u)))
  ).filter((u) => u) as User_Firestore[];
  const questionsFilled = offer.airdropMetadata
    ? await Promise.all(
        offer.airdropMetadata.questions.map((qid) =>
          getQuestionByID(qid as QuestionAnswerID)
        )
      )
    : [];
  const questionsTrimmed = questionsFilled
    .filter((q) => q)
    // @ts-ignore
    .map((q: QuestionAnswer_Firestore) => ({
      id: q.id,
      batch: q.batch,
      question: q.question,
      type: q.type,
    })) as QuestionAnswerPreview[];
  // exclude the user who have received a past airdrop from the offer's airdrop exclusion list
  // const airdropOffersToExclude = offer.airdropMetadata?.excludedOffers || [];
  // const uniquePotentialUsers = uniqueUsers.filter((u) => {
  //   if (!u || !u.airdropsReceived) return true;
  //   return !u.airdropsReceived.some((r) => airdropOffersToExclude.includes(r));
  // });
  const uniquePotentialUsers = uniqueUsers;
  const uniquePotentialClaimers = uniquePotentialUsers
    .map((u) => {
      const firstClaimForUser = claimsOfThisAirdropOffer.find(
        (c) => c.claimerUserId === u.id
      );
      const airdroppedClaimForUser = claimsOfThisAirdropOffer.find(
        (c) =>
          c.claimerUserId === u.id && c.airdropMetadata?.offerID === offerID
      );
      const claimForUser = airdroppedClaimForUser || firstClaimForUser;
      const potentialClaimer: PotentialAirdropClaimer = {
        userID: u.id,
        username: u.username || "Anon User",
        avatar: u.avatar,
        tournamentID: tournamentID,
        advertiserID: offer.advertiserID,
        offerID: offerID,
      };
      if (claimForUser && claimForUser.airdropMetadata) {
        potentialClaimer.status = claimForUser.redemptionStatus;
        potentialClaimer.lootboxID = claimForUser.airdropMetadata.lootboxID;
        potentialClaimer.lootboxAddress =
          claimForUser.airdropMetadata.lootboxAddress;
        potentialClaimer.batchAlias = claimForUser.airdropMetadata.batchAlias;
      }
      return potentialClaimer;
    })
    .filter((u) => u);
  const offerAirdropPromoterView = {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    image: offer.image,
    advertiserID: offer.advertiserID,
    airdropMetadata: {
      oneLiner: offer.airdropMetadata?.oneLiner,
      value: offer.airdropMetadata?.value || "",
      instructionsLink: offer.airdropMetadata?.instructionsLink,
      excludedOffers: offer.airdropMetadata?.excludedOffers || [],
      batchCount: offer.airdropMetadata?.batchCount,
      questions: questionsTrimmed,
      lootboxTemplateID: offer.airdropMetadata?.lootboxTemplateID as LootboxID,
      lootboxTemplateStamp: offer.airdropMetadata?.lootboxTemplateStamp || "",
    },
  };
  return {
    offer: offerAirdropPromoterView,
    potentialClaimers: uniquePotentialClaimers,
  };
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
    .collectionGroup(Collection.Claim)
    .where("airdropMetadata.offerID", "==", offerID) as Query<Claim_Firestore>;
  const claimCollectionItems = await claimRef.get();

  if (claimCollectionItems.empty) {
    return [];
  }
  return claimCollectionItems.docs.map((doc) => doc.data());
};

export const createAirdropClaim = async (
  req: Claim_Firestore,
  airdropLootbox: Lootbox_Firestore,
  offerID: OfferID
): Promise<Claim_Firestore> => {
  return await _createAirdropClaim({
    referralId: req.referralId,
    tournamentId: req.tournamentId,
    referrerId: req.referrerId as unknown as UserID,
    promoterId: req.promoterId,
    referralSlug: req.referralSlug,
    referralCampaignName: req.referralCampaignName || "",
    tournamentName: req.tournamentName,
    status: ClaimStatus_Firestore.complete,
    type: ClaimType_Firestore.airdrop,
    referralType: req.referralType,
    completed: true,
    originLootboxId: req.lootboxID,
    isPostCosmic: true,
    claimerUserId: req.claimerUserId,
    rewardFromClaim: req.rewardFromClaim,
    lootboxID: airdropLootbox.id,
    lootboxName: airdropLootbox.name,
    lootboxAddress: airdropLootbox.address || undefined,
    rewardFromFriendReferred: req.rewardFromFriendReferred,
    airdropMetadata: {
      lootboxID: airdropLootbox.id,
      lootboxAddress: airdropLootbox.address || undefined,
      offerID: offerID,
      // @ts-ignore
      batchAlias: `Batch ${airdropLootbox.airdropMetadata.batch}`,
      answers: [],
    },
  });
};

export const determineAirdropClaimWithReferrerCredit = async (
  claimers: UserID[],
  tournamentID?: TournamentID
): Promise<Claim_Firestore[]> => {
  if (tournamentID) {
    const claimsOfThisTournament = await listClaimsInTournament(tournamentID);

    // get unique users from list of tournament claims
    const uniqueClaimsByUserID = _.uniq(
      claimsOfThisTournament.filter((c) => c.claimerUserId)
    ) as Claim_Firestore[];
    const usersHashMap = claimers.reduce((acc, curr: UserID) => {
      return {
        ...acc,
        [curr]: false,
      };
    }, {} as Record<UserID, any>);
    uniqueClaimsByUserID.forEach((c) => {
      if (c.claimerUserId && !usersHashMap[c.claimerUserId]) {
        usersHashMap[c.claimerUserId] = c;
      }
    });

    const claimersWithReferrerCredit = Object.keys(usersHashMap)
      .map((u) => usersHashMap[u])
      .filter(
        (u) => u.referralId && claimers.includes(u.claimerUserId)
      ) as Claim_Firestore[];

    return claimersWithReferrerCredit;
  }
  return [];
};
