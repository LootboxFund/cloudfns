import {
  getAllClaimsForLootbox,
  getAllClaimsForTournament,
  getLootbox,
  getLootboxTournamentSnapshotByLootboxID,
  getOffer,
  getTournamentById,
  getUser,
} from "../api/firestore";
import {
  AffiliateID,
  ClaimType_Firestore,
  Claim_Firestore,
  LootboxID,
  Lootbox_Firestore,
  OfferID,
  TournamentID,
  UserID,
  User_Firestore,
} from "@wormgraph/helpers";
import {
  baseLootboxStatistics,
  campaignClaimsForLootbox,
  claimerStatsForLootboxTournament,
  referrerClaimsForLootbox,
  claimerStatsForTournament,
  getOfferEventActivations,
  getOfferActivations,
} from "../api/analytics";
import { manifest } from "../manifest";
import {
  FanListRowForLootbox,
  FanListRowForTournament,
  QueryFansListForLootboxArgs,
  QueryFansListForTournamentArgs,
  ViewAdResponseSuccess,
} from "../graphql/generated/types";
import * as _ from "lodash";
import {
  checkIfUserIdpMatchesAdvertiser,
  checkIfUserIdpMatchesAffiliate,
} from "../api/identityProvider/firebase";
import { UserIdpID } from "@wormgraph/helpers";

interface BaseClaimStatsForLootboxRequest {
  lootboxID: LootboxID;
  eventID: TournamentID;
}

export interface BaseLootboxStatisticsServiceResponse {
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  bonusRewardClaimCount: number;
  oneTimeClaimCount: number;
  completionRate: number;
  maxTickets: number;
}
export const baseClaimStatsForLootbox = async (
  request: BaseClaimStatsForLootboxRequest,
  callerUserID: UserID
): Promise<BaseLootboxStatisticsServiceResponse> => {
  const [lootbox, lootboxSnapshot, event] = await Promise.all([
    getLootbox(request.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(request.eventID, request.lootboxID),
    getTournamentById(request.eventID),
  ]);
  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }
  if (!event || !!event.timestamps.deletedAt) {
    throw new Error("Event not found");
  }

  if (!lootboxSnapshot || !!lootboxSnapshot.timestamps.deletedAt) {
    throw new Error("Lootbox snapshot not found");
  }

  if (lootbox.creatorID !== callerUserID && event.creatorId !== callerUserID) {
    // Only allow lootbox creator or event creator to view stats
    throw new Error("Unauthorized");
  }

  try {
    const data = await baseLootboxStatistics({
      queryParams: { lootboxID: request.lootboxID },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      lootboxTable:
        manifest.bigQuery.datasets.firestoreExport.tables.lootbox.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      ...data,
    };
  } catch (err) {
    console.error("error fetching base lootbox stats", err);
    throw new Error("An error occurred");
  }
};

interface LootboxReferrerStatisticsRequest {
  lootboxID: LootboxID;
  eventID: TournamentID;
}

export type ReferrerClaimsForLootboxServiceResponse = {
  userName: string;
  userAvatar: string;
  userID: string;
  claimCount: number;
}[];

export const lootboxReferrerStatistics = async (
  request: LootboxReferrerStatisticsRequest,
  callerUserID: UserID
): Promise<ReferrerClaimsForLootboxServiceResponse> => {
  const [lootbox, lootboxSnapshot, event] = await Promise.all([
    getLootbox(request.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(request.eventID, request.lootboxID),
    getTournamentById(request.eventID),
  ]);

  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }

  if (!event || !!event.timestamps.deletedAt) {
    throw new Error("Event not found");
  }

  if (!lootboxSnapshot || !!lootboxSnapshot.timestamps.deletedAt) {
    throw new Error("Lootbox snapshot not found");
  }

  if (lootbox.creatorID !== callerUserID && event.creatorId !== callerUserID) {
    // Only allow lootbox creator or event creator to view stats
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await referrerClaimsForLootbox({
      queryParams: {
        lootboxID: request.lootboxID,
        tournamentID: request.eventID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return data;
  } catch (err) {
    console.error("error fetching referrer lootbox stats", err);
    throw new Error("An error occurred");
  }
};

interface LootboxCampaignStatisticsRequest {
  lootboxID: LootboxID;
  eventID: TournamentID;
}
interface LootboxCampaignStatisticsResponse {
  data: {
    referralCampaignName: string;
    referralSlug: string;
    userAvatar: string;
    username: string;
    userID: string;
    claimCount: number;
  }[];
}
export const lootboxCampaignStatistics = async (
  request: LootboxCampaignStatisticsRequest,
  callerUserID: UserID
): Promise<LootboxCampaignStatisticsResponse> => {
  const [lootbox, lootboxSnapshot, event] = await Promise.all([
    getLootbox(request.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(request.eventID, request.lootboxID),
    getTournamentById(request.eventID),
  ]);

  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }

  if (!event || !!event.timestamps.deletedAt) {
    throw new Error("Event not found");
  }

  if (!lootboxSnapshot || !!lootboxSnapshot.timestamps.deletedAt) {
    throw new Error("Lootbox snapshot not found");
  }

  if (lootbox.creatorID !== callerUserID && event.creatorId !== callerUserID) {
    // Only allow lootbox creator or event creator to view stats
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await campaignClaimsForLootbox({
      queryParams: {
        lootboxID: request.lootboxID,
        tournamentID: request.eventID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      data,
    };
  } catch (err) {
    console.error("error fetching referrer lootbox stats", err);
    throw new Error("An error occurred");
  }
};

export interface ClaimerStatsForTournamentServiceRow {
  claimerUserID: UserID | "";
  username: string;
  userAvatar: string;
  claimCount: number;
  claimType: string;
  totalUserClaimCount: number;
  referralType: string;
}

export interface ClaimerStatsForTournamentSeviceResponse {
  data: ClaimerStatsForTournamentServiceRow[];
}

export const claimerStatisticsForTournament = async (
  request: { eventID: TournamentID },
  callerUserID: UserID
): Promise<ClaimerStatsForTournamentSeviceResponse> => {
  const tournament = await getTournamentById(request.eventID);

  if (!tournament) {
    throw new Error("Event not Found");
  }

  if (tournament.creatorId !== callerUserID) {
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await claimerStatsForTournament({
      queryParams: {
        eventID: request.eventID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      data,
    };
  } catch (err) {
    console.error("error fetching claimer stats for event", err);
    throw new Error("An error occurred");
  }
};

export interface ClaimerStatsForLootboxTournamentServiceRow {
  claimerUserID: UserID | "";
  lootboxID: LootboxID;
  username: string;
  userAvatar: string;
  claimCount: number;
  claimType: string;
  totalUserClaimCount: number;
  referralType: string;
}

export interface ClaimerStatsForLootboxTournamentSeviceResponse {
  data: ClaimerStatsForLootboxTournamentServiceRow[];
}

export const claimerStatisticsForLootboxTournament = async (
  request: { eventID: TournamentID; lootboxID: LootboxID },
  callerUserID: UserID
): Promise<ClaimerStatsForLootboxTournamentSeviceResponse> => {
  const [tournament, lootbox] = await Promise.all([
    getTournamentById(request.eventID),
    getLootbox(request.lootboxID),
  ]);

  if (!tournament) {
    throw new Error("Event not Found");
  }

  if (!lootbox) {
    throw new Error("Lootbox not Found");
  }

  if (
    tournament.creatorId !== callerUserID &&
    callerUserID !== lootbox.creatorID
  ) {
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await claimerStatsForLootboxTournament({
      queryParams: {
        eventID: request.eventID,
        lootboxID: request.lootboxID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      data: data.map((row) => ({
        ...row,
        lootboxID: request.lootboxID,
      })),
    };
  } catch (err) {
    console.error("error fetching claimer stats for event", err);
    throw new Error("An error occurred");
  }
};

export const fansListForTournament = async (
  payload: QueryFansListForTournamentArgs,
  userID: UserIdpID
) => {
  const tournament = await getTournamentById(
    payload.tournamentID as TournamentID
  );
  if (!tournament || !tournament.organizer) {
    throw new Error("Tournament not found");
  }
  // only allow the tournament owner to view this data
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userID,
    tournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions to get analytics for this tournament`
    );
  }
  // get all claims for tournament
  const claims = await getAllClaimsForTournament(
    payload.tournamentID as TournamentID
  );
  claims.forEach((c) => console.log(`c = ${c.id}, c.u = ${c.claimerUserId}`));
  // console.log(`claims count = ${claims.length}`);
  // get unique users
  const recentSortedClaims = claims
    .sort((a, b) => a.timestamps.createdAt - b.timestamps.createdAt)
    .filter((c) => c.claimerUserId);
  // console.log(`recentSortedClaims count = ${recentSortedClaims.length}`);
  const uniqueClaimersSortedByDate: Claim_Firestore[] = _.uniqBy(
    recentSortedClaims,
    "claimerUserId"
  );
  console.log(`uniqueClaimersSortedByDate`);
  console.log(uniqueClaimersSortedByDate.map((c) => c.claimerUserId));
  const uniqueClaimsByLootbox: Claim_Firestore[] = _.uniqBy(
    claims,
    "lootboxID"
  ).filter((c) => c.lootboxID);
  const uniqueLootboxes = await Promise.all(
    uniqueClaimsByLootbox.map((u) => {
      // @ts-ignore
      return getLootbox(u.lootboxID);
    })
  );
  // console.log(`uniqueLootboxes count = ${uniqueLootboxes.length}`);
  const uniqueLootboxesHash = uniqueLootboxes.reduce((acc, cur) => {
    // console.log(`>> cur = ${cur?.id}`);
    if (cur) {
      return {
        ...acc,
        [cur.id]: cur,
      };
    }
    return acc;
  }, {} as Record<LootboxID, Lootbox_Firestore>);
  const usersByLootboxCount = claims.reduce((acc, cur) => {
    // console.log(`++ cur = ${cur?.id}`);
    if (!cur.claimerUserId || !cur.lootboxID) return acc;
    const prev = acc[cur.claimerUserId] ? acc[cur.claimerUserId] : {};
    return {
      ...acc,
      [cur.claimerUserId]: {
        ...prev,
        [cur.lootboxID]:
          acc[cur.claimerUserId] && acc[cur.claimerUserId][cur.lootboxID]
            ? acc[cur.claimerUserId][cur.lootboxID] + 1
            : 1,
      },
    };
  }, {} as Record<UserID, Record<LootboxID, number>>);
  // console.log(`usersByLootboxCount`);
  // console.log(usersByLootboxCount);
  // console.log(
  //   `uniqueClaimersSortedByDate count = ${uniqueClaimersSortedByDate.length}`
  // );
  console.log(`
  
  -
  -
  -
  -
  -
  
  `);
  // uniqueClaimersSortedByDate.forEach((c) =>
  //   console.log(`c = ${c.id}, c.u = ${c.claimerUserId}`)
  // );
  const users = (
    await Promise.all(
      uniqueClaimersSortedByDate.map((claim) => {
        // @ts-ignore
        return getUser(claim.claimerUserId);
      })
    )
  )
    .map((u) => {
      // console.log(`u = ${u?.username}`);
      return u;
    })
    .filter((u) => u) as User_Firestore[];
  // console.log(`users count = ${users.length}`);
  const usersMap = users.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {} as Record<UserID, User_Firestore>);
  // convert it into rows data format
  let count = 0;
  const claimsBreakdown = uniqueClaimersSortedByDate.reduce((acc, claim) => {
    count++;
    // console.log(
    //   `#${count} - breakdown c = ${
    //     claim.id
    //   }, !claim.claimerUserId = ${!claim.claimerUserId}`
    // );
    if (!claim.claimerUserId) return acc;
    const accCurr = acc[claim.claimerUserId]
      ? acc[claim.claimerUserId]
      : {
          userID: claim.claimerUserId,
          claimsCount: 0,
          referralsCount: 0,
          participationRewardsCount: 0,
        };
    const incrClaimsCount = claim.claimerUserId === accCurr.userID ? 1 : 0;
    const incrReferralsCount =
      claim.referrerId === accCurr.userID &&
      claim.type === ClaimType_Firestore.referral
        ? 1
        : 0;
    const incrParticipationRewardsCount =
      claim.claimerUserId === accCurr.userID &&
      claim.type === ClaimType_Firestore.reward
        ? 1
        : 0;
    return {
      ...acc,
      [claim.claimerUserId]: {
        ...accCurr,
        userID: claim.claimerUserId,
        claimsCount: accCurr.claimsCount + incrClaimsCount,
        referralsCount: accCurr.referralsCount + incrReferralsCount,
        participationRewardsCount:
          accCurr.participationRewardsCount + incrParticipationRewardsCount,
      },
    };
  }, {} as Record<UserID, FanRowStatSum>);
  // console.log(claimsBreakdown);
  // console.log(Object.keys(claimsBreakdown));
  type FanRowStatSum = {
    userID: UserID;
    claimsCount: number;
    referralsCount: number;
    participationRewardsCount: number;
  };

  // console.log(`claimsBreakdown count = ${Object.keys(claimsBreakdown).length}`);
  const rows = uniqueClaimersSortedByDate
    .filter((c) => c.claimerUserId && usersMap[c.claimerUserId])
    .map((claim) => {
      // console.log(`}} claim === ${claim.id}`);
      if (!claim.claimerUserId) return null;
      // console.log(`}} --> a`);
      const earliestClaim = claim;
      if (!earliestClaim) return null;
      // console.log(`}} --> b`);
      const user = usersMap[claim.claimerUserId];
      if (!user) return null;
      // console.log(`}} --> c`);
      const userSortedLootboxes = Object.keys(
        usersByLootboxCount[claim.claimerUserId] || {}
      )
        .map((lid, i) => {
          // console.log(`}} --> d = ${i}`);
          if (!claim.claimerUserId) {
            return {
              lootboxID: lid,
              count: 1,
            };
          }
          return {
            lootboxID: lid,
            count:
              usersByLootboxCount[claim.claimerUserId] &&
              usersByLootboxCount[claim.claimerUserId][lid]
                ? usersByLootboxCount[claim.claimerUserId][lid]
                : 1,
          };
        })
        .slice()
        .sort((a, b) => a.count - b.count);
      // console.log(`userSortedLootboxes.length = ${userSortedLootboxes.length}`);
      // console.log(
      //   `userSortedLootboxes[0].lootboxID = ${userSortedLootboxes[0]?.lootboxID}`
      // );
      const favoriteLootbox =
        userSortedLootboxes[0] &&
        userSortedLootboxes[0].lootboxID &&
        uniqueLootboxesHash[userSortedLootboxes[0].lootboxID as LootboxID]
          ? uniqueLootboxesHash[userSortedLootboxes[0].lootboxID as LootboxID]
          : null;
      // console.log(`favoriteLootbox.id = ${favoriteLootbox?.id}`);
      if (!favoriteLootbox) return null;
      const fanRow: FanListRowForTournament = {
        userID: claim.claimerUserId,
        username: user.username || "",
        avatar: user.avatar || "",
        claimsCount: claimsBreakdown[claim.claimerUserId].claimsCount,
        referralsCount: claimsBreakdown[claim.claimerUserId].referralsCount,
        participationRewardsCount:
          claimsBreakdown[claim.claimerUserId].participationRewardsCount,
        joinedDate: earliestClaim.timestamps.createdAt,
        favoriteLootbox: favoriteLootbox
          ? {
              lootboxID: favoriteLootbox.id,
              stampImage: favoriteLootbox.stampImage,
              name: favoriteLootbox.name,
              count: userSortedLootboxes[0].count,
            }
          : undefined,
      };
      return fanRow;
    })
    .filter((c) => c) as FanListRowForTournament[];
  return rows;
};

export const fansListForLootbox = async (
  payload: QueryFansListForLootboxArgs,
  userID: UserIdpID
) => {
  const lootbox = await getLootbox(payload.lootboxID as LootboxID);
  if (!lootbox) {
    throw new Error("Lootbox not found");
  }
  if (!lootbox.tournamentID) {
    throw Error(
      `This old lootbox ${lootbox.id} does not have an associated tournamentID and thus cannot render a fan list. Try with a newer lootbox`
    );
  }
  const tournament = await getTournamentById(
    lootbox.tournamentID as TournamentID
  );
  if (!tournament || !tournament.organizer) {
    throw new Error("Tournament not found");
  }
  // only allow the tournament owner to view this data
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userID,
    tournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions to get analytics for this tournament`
    );
  }
  // get all claims for tournament
  const claims = await getAllClaimsForLootbox(payload.lootboxID as LootboxID);
  claims.forEach((c) => console.log(`c = ${c.id}, c.u = ${c.claimerUserId}`));
  // console.log(`claims count = ${claims.length}`);
  // get unique users
  const recentSortedClaims = claims
    .sort((a, b) => a.timestamps.createdAt - b.timestamps.createdAt)
    .filter((c) => c.claimerUserId);
  // console.log(`recentSortedClaims count = ${recentSortedClaims.length}`);
  const uniqueClaimersSortedByDate: Claim_Firestore[] = _.uniqBy(
    recentSortedClaims,
    "claimerUserId"
  );
  // console.log(`uniqueClaimersSortedByDate`);
  // console.log(uniqueClaimersSortedByDate.map((c) => c.claimerUserId));
  // console.log(`usersByLootboxCount`);
  // console.log(usersByLootboxCount);
  // console.log(
  //   `uniqueClaimersSortedByDate count = ${uniqueClaimersSortedByDate.length}`
  // );
  console.log(`
  
  -
  -
  -
  -
  -
  
  `);
  // uniqueClaimersSortedByDate.forEach((c) =>
  //   console.log(`c = ${c.id}, c.u = ${c.claimerUserId}`)
  // );
  const users = (
    await Promise.all(
      uniqueClaimersSortedByDate.map((claim) => {
        // @ts-ignore
        return getUser(claim.claimerUserId);
      })
    )
  )
    .map((u) => {
      // console.log(`u = ${u?.username}`);
      return u;
    })
    .filter((u) => u) as User_Firestore[];
  // console.log(`users count = ${users.length}`);
  const usersMap = users.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.id]: curr,
    };
  }, {} as Record<UserID, User_Firestore>);
  // convert it into rows data format
  let count = 0;
  const claimsBreakdown = uniqueClaimersSortedByDate.reduce((acc, claim) => {
    count++;
    // console.log(
    //   `#${count} - breakdown c = ${
    //     claim.id
    //   }, !claim.claimerUserId = ${!claim.claimerUserId}`
    // );
    if (!claim.claimerUserId) return acc;
    const accCurr = acc[claim.claimerUserId]
      ? acc[claim.claimerUserId]
      : {
          userID: claim.claimerUserId,
          claimsCount: 0,
          referralsCount: 0,
          participationRewardsCount: 0,
        };
    const incrClaimsCount = claim.claimerUserId === accCurr.userID ? 1 : 0;
    const incrReferralsCount =
      claim.referrerId === accCurr.userID &&
      claim.type === ClaimType_Firestore.referral
        ? 1
        : 0;
    const incrParticipationRewardsCount =
      claim.claimerUserId === accCurr.userID &&
      claim.type === ClaimType_Firestore.reward
        ? 1
        : 0;
    return {
      ...acc,
      [claim.claimerUserId]: {
        ...accCurr,
        userID: claim.claimerUserId,
        claimsCount: accCurr.claimsCount + incrClaimsCount,
        referralsCount: accCurr.referralsCount + incrReferralsCount,
        participationRewardsCount:
          accCurr.participationRewardsCount + incrParticipationRewardsCount,
      },
    };
  }, {} as Record<UserID, FanRowStatSum>);
  // console.log(claimsBreakdown);
  // console.log(Object.keys(claimsBreakdown));
  type FanRowStatSum = {
    userID: UserID;
    claimsCount: number;
    referralsCount: number;
    participationRewardsCount: number;
  };

  // console.log(`claimsBreakdown count = ${Object.keys(claimsBreakdown).length}`);
  const rows = uniqueClaimersSortedByDate
    .filter((c) => c.claimerUserId && usersMap[c.claimerUserId])
    .map((claim) => {
      // console.log(`}} claim === ${claim.id}`);
      if (!claim.claimerUserId) return null;
      // console.log(`}} --> a`);
      const earliestClaim = claim;
      if (!earliestClaim) return null;
      // console.log(`}} --> b`);
      const user = usersMap[claim.claimerUserId];
      if (!user) return null;

      const fanRow: FanListRowForLootbox = {
        userID: claim.claimerUserId,
        username: user.username || "",
        avatar: user.avatar || "",
        claimsCount: claimsBreakdown[claim.claimerUserId].claimsCount,
        referralsCount: claimsBreakdown[claim.claimerUserId].referralsCount,
        participationRewardsCount:
          claimsBreakdown[claim.claimerUserId].participationRewardsCount,
        joinedDate: earliestClaim.timestamps.createdAt,
      };
      return fanRow;
    })
    .filter((c) => c) as FanListRowForLootbox[];
  return rows;
};
interface OfferEventActivationsServiceRow {
  activationName: string;
  adEventCount: number;
  activationDescription: string;
  activationID: string;
}
export interface OfferActivationsForEventServiceRequest {
  eventID: TournamentID;
  offerID: OfferID;
  callerUserID: UserID;
}
export const offerActivationsForEvent = async (
  payload: OfferActivationsForEventServiceRequest
): Promise<OfferEventActivationsServiceRow[]> => {
  const tournament = await getTournamentById(payload.eventID);

  if (!tournament || !tournament.organizer) {
    throw new Error("Tournament not found");
  }

  // only allow the tournament owner to view this data
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    payload.callerUserID as unknown as UserIdpID,
    tournament.organizer as AffiliateID
  );

  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions to get analytics for this tournament`
    );
  }

  const data = await getOfferEventActivations({
    queryParams: { eventID: payload.eventID, offerID: payload.offerID },
    activationTable:
      manifest.bigQuery.datasets.firestoreExport.tables.activation.id,
    adEventTable: manifest.bigQuery.datasets.firestoreExport.tables.adEvent.id,
    flightTable: manifest.bigQuery.datasets.firestoreExport.tables.flight.id,
    location: manifest.bigQuery.datasets.firestoreExport.location,
  });

  return data;
};

interface OfferActivationsServiceRow {
  activationName: string;
  adEventCount: number;
  activationDescription: string;
  activationID: string;
}

export interface OfferActivationsServiceRequest {
  offerID: OfferID;
  callerUserID: UserID;
}
export const offerActivations = async (
  payload: OfferActivationsServiceRequest
): Promise<OfferActivationsServiceRow[]> => {
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

  const data = await getOfferActivations({
    queryParams: { offerID: payload.offerID },
    activationTable:
      manifest.bigQuery.datasets.firestoreExport.tables.activation.id,
    adEventTable: manifest.bigQuery.datasets.firestoreExport.tables.adEvent.id,
    flightTable: manifest.bigQuery.datasets.firestoreExport.tables.flight.id,
    location: manifest.bigQuery.datasets.firestoreExport.location,
  });

  return data;
};
