import { TournamentID } from "@wormgraph/helpers";
import { parseDate } from "../../lib/parser";
import { manifest } from "../../manifest";
import { bigquery } from "./client";

export interface EventClaimerDataRequest {
  queryParams: {
    eventID: TournamentID;
  };
  claimTable: string;
  userTable: string;
  claimPrivacyTable: string;
  location: string;
}
export interface EventClaimerDataRow {
  userID: string;
  username: string;
  userPublicProfilePage: string;
  timestampFirstJoined: string;
  favoriteLootboxName: string;
  eventName: string;
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  referralBonusClaimCount: number;
  participationRewardCount: number;
  airdropClaimCount: number;
  pendingClaims: number;
  expiredClaims: number;
  originalClaims: number;
  socialTwitter: string;
  socialInstagram: string;
  socialTiktok: string;
  socialFacebook: string;
  socialDiscord: string;
  socialSnapchat: string;
  socialTwitch: string;
  socialWeb: string;
  userEmail: string;
  userPhone: string;
  userAvatar: string;
}
const convertEventUserData = (data: any): EventClaimerDataRow => {
  return {
    userID: data?.userID || "",
    username: data?.username || "",
    userPublicProfilePage: data?.userPublicProfilePage || "",
    timestampFirstJoined: parseDate(data?.timestampFirstJoined),
    favoriteLootboxName: data?.favoriteLootboxName || "",
    eventName: data?.eventName || "",
    totalClaimCount: data?.totalClaimCount || 0,
    completedClaimCount: data?.completedClaimCount || 0,
    viralClaimCount: data?.viralClaimCount || 0,
    referralBonusClaimCount: data?.referralBonusClaimCount || 0,
    participationRewardCount: data?.participationRewardCount || 0,
    airdropClaimCount: data?.airdropClaimCount || 0,
    pendingClaims: data?.pendingClaims || 0,
    expiredClaims: data?.expiredClaims || 0,
    originalClaims: data?.originalClaims || 0,
    socialTwitter: data?.socialTwitter || "",
    socialInstagram: data?.socialInstagram || "",
    socialTiktok: data?.socialTiktok || "",
    socialFacebook: data?.socialFacebook || "",
    socialDiscord: data?.socialDiscord || "",
    socialSnapchat: data?.socialSnapchat || "",
    socialTwitch: data?.socialTwitch || "",
    socialWeb: data?.socialWeb || "",
    userEmail: data?.userEmail || "",
    userPhone: data?.userPhone || "",
    userAvatar: data?.userAvatar || "",
  };
};
export const eventClaimerData = async ({
  queryParams,
  claimTable,
  userTable,
  claimPrivacyTable,
  location,
}: EventClaimerDataRequest): Promise<EventClaimerDataRow[]> => {
  console.log(
    "Querying BigQuery (EVENT USER DATA)",
    `
  
      tournamentID: ${queryParams.eventID}
      claimTable: ${claimTable}
      userTable: ${userTable}
      location: ${location}
    
    `
  );

  /**
   * Queries the claim table to return claims per day
   * Use parameterized queries to prevent SQL injection attacks
   * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
   */
  const query = `
  WITH
    ClaimsWithPermissions AS (
    SELECT
      claims.id AS claimID,
      SUM(CASE
          WHEN p.privacyScope_member = 'DataSharing' THEN 1
        ELSE
        0
      END
        ) > 0 AS DataSharing,
      SUM(CASE
          WHEN p.privacyScope_member = 'MarketingEmails' THEN 1
        ELSE
        0
      END
        ) > 0 AS MarketingEmails,
    FROM
      \`${claimTable}\` AS claims
    INNER JOIN
      \`${claimPrivacyTable}\` AS p
    ON
      claims.id = p.claimID
    WHERE
      claims.tournamentId = @eventID
    GROUP BY
      claims.id )
    SELECT
      users.id AS userID,
      users.username AS username,
      users.avatar AS userAvatar,
      CONCAT('${manifest.microfrontends.webflow.publicProfile}?uid=', users.id) AS userPublicProfilePage,
      MIN(TIMESTAMP_MILLIS(CAST(claims.timestamps_createdAt AS INT64))) AS timestampFirstJoined,
      MIN(claims.tournamentName) AS eventName,
      MIN(CASE
          WHEN claims.status = 'complete' AND claims.type = 'referral' OR claims.type = 'one_time' THEN claims.lootboxName
        ELSE
        NULL
      END
        ) AS favoriteLootboxName,
      COUNT(*) AS totalClaimCount,
      SUM(CASE
          WHEN claims.status = 'complete' THEN 1
        ELSE
        0
      END
        ) AS completedClaimCount,
      SUM(CASE
          WHEN claims.referralType = 'viral' AND claims.status = 'complete' AND claims.type = 'referral' THEN 1
        ELSE
        0
      END
        ) AS viralClaimCount,
      SUM(CASE
          WHEN claims.referralType = 'viral' AND claims.status = 'complete' AND claims.type = 'reward' THEN 1
        ELSE
        0
      END
        ) AS referralBonusClaimCount,
      SUM(CASE
          WHEN claims.referralType = 'one_time' AND claims.status = 'complete' AND claims.type = 'one_time' THEN 1
        ELSE
        0
      END
        ) AS participationRewardCount,
      SUM(CASE
          WHEN claims.status = 'airdrop' AND claims.type = 'complete' THEN 1
        ELSE
        0
      END
        ) AS airdropClaimCount,
      SUM(CASE
          WHEN claims.status = 'pending' OR claims.status = 'unverified' THEN 1
        ELSE
        0
      END
        ) AS pendingClaims,
      SUM(CASE
          WHEN claims.status = 'expired' THEN 1
        ELSE
        0
      END
        ) AS expiredClaims,
      SUM(CASE
          WHEN claims.referralType = 'genesis' AND claims.status = 'complete' AND claims.type = 'referral' THEN 1
        ELSE
        0
      END
        ) AS originalClaims,
      users.socials_twitter AS socialTwitter,
      users.socials_instagram AS socialInstagram,
      users.socials_tiktok AS socialTiktok,
      users.socials_facebook AS socialFacebook,
      users.socials_discord AS socialDiscord,
      users.socials_snapchat AS socialSnapchat,
      users.socials_twitch AS socialTwitch,
      users.socials_web AS socialWeb,
      COALESCE(MIN(
          CASE
            WHEN claimsPrivacy.DataSharing = TRUE THEN COALESCE(users.email, "")
          ELSE
          NULL
        END
          ), "CONSENT_REQUIRED") AS userEmail,
      COALESCE(MIN(
          CASE
            WHEN claimsPrivacy.DataSharing = TRUE THEN COALESCE(users.phoneNumber, "")
          ELSE
          NULL
        END
          ), "CONSENT_REQUIRED") AS userPhone,
    FROM
      \`${userTable}\` AS users
    INNER JOIN
      \`${claimTable}\` AS claims
    ON
      users.id = claims.claimerUserID
    INNER JOIN
      ClaimsWithPermissions AS claimsPrivacy
    ON
      claims.id = claimsPrivacy.claimID
    WHERE
      claims.tournamentId = @eventID
    GROUP BY
      userID,
      username,
      userAvatar,
      socialTwitter,
      socialInstagram,
      socialTiktok,
      socialFacebook,
      socialDiscord,
      socialSnapchat,
      socialTwitch,
      socialWeb
    ORDER BY
      completedClaimCount DESC
    LIMIT
      100000



  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      eventID: queryParams.eventID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return rows.map(convertEventUserData);
};
