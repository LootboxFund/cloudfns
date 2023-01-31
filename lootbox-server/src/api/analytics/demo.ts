// we generate a demo event & ad for each new host
// so that they have something to explore and will quickly understand how lootbox works

/** Possible demo use cases:
 * - esports tournament
 * - festival
 * - streamer giveaway
 * - after ticket claim questions
 */

import {
  AdvertiserID,
  AffiliateID,
  LootboxID,
  LootboxVariant_Firestore,
  MeasurementPartnerType,
  OfferStatus,
  OfferStrategy,
  Placement,
  QuestionFieldType,
  TournamentID,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import * as tournamentService from "../../service/tournament";
import * as LootboxService from "../../service/lootbox";
import { createLootbox } from "../firestore/lootbox";
import {
  AdSetStatus,
  AdStatus,
  AspectRatio,
  CreateAdPayload,
  CreateLootboxPayload,
  CreateOfferPayload,
  CreativeType,
  ReferralType,
} from "../../graphql/generated/types";
import { createOffer } from "../firestore/offer";
import { upgradeToAdvertiser } from "../firestore/advertiser";
import { OfferStrategyType } from "../../../../activation-ingestor/src/lib/api/graphql/generated/types";
import { createAd, createAdSet } from "../firestore/ad";
import * as referralService from "../../service/referral";
import { addOfferAdSetToTournament, getAffiliate } from "../firestore";
import { CreateReferralServiceRequest } from "../../service/referral";

const userIDs = {
  production: [{ userID: "", promoterID: "" }],
  staging: [{ userID: "", promoterID: "" }],
};

export enum DemoEventType {
  EsportsTournament = "esports-tournament",
  Festival = "festival",
  StreamerGiveaway = "streamer-giveaway",
}
export const createDemoEvent = async (
  demoEventType: DemoEventType,
  userID: UserID
) => {
  // ✅ create event
  // ✅ create 8 lootboxes
  // ✅ create 1 offer as afterticketclaim
  // ✅ create 1 ad & adset
  // ✅ create ad events (clicks, views, answers)
  // ⬜️ create 4 referral links
  // ⬜️ create 200 claims (120 unverified, 80 verified)
  // ⬜️ create 1 voucher prize deposit
};

const createDemoEvent_Esports = async (
  affiliateID: AffiliateID,
  userID: UserID
) => {
  const [affiliate, advertiser] = await Promise.all([
    getAffiliate(affiliateID),
    upgradeToAdvertiser(userID as unknown as UserIdpID),
  ]);
  if (!affiliate) throw new Error("Could not find affiliate");
  if (!advertiser) throw new Error("Could not upgrade to advertiser");
  // create tournament, offer, ad, adset
  const demoOffer = {
    advertiserID: advertiser.id,
    affiliateBaseLink: "https://www.instagram.com/lootbox.tickets/",
    afterTicketClaimMetadata: {
      questions: [
        {
          mandatory: true,
          question: "What is your favorite game?",
          type: QuestionFieldType.Text,
        },
      ],
    },
    description:
      "This is a demo offer to show new advertisers how LOOTBOX works.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Fsurvey.jpeg?alt=media",
    mmp: MeasurementPartnerType.Manual,
    status: OfferStatus.Active,
    strategy: OfferStrategyType.AfterTicketClaim,
    title: "Demo Ad",
  };
  const demoAd = {
    advertiserID: advertiser.id,
    creative: {
      aspectRatio: AspectRatio.Portrait2x3,
      callToAction: "Follow Socials",
      creativeLinks: [
        "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Ffollow-socials.jpeg?alt=media",
      ],
      creativeType: CreativeType.Image,
      themeColor: "#1124FC",
      thumbnail:
        "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Ffollow-socials.jpeg?alt=media",
    },
    description: "This is a demo ad to show new advertisers how LOOTBOX works.",
    name: "Demo Ad",
    placement: Placement.AfterTicketClaim,
    status: AdStatus.Active,
  };
  const [tournamentDB, offerSuite] = await Promise.all([
    tournamentService.create(
      {
        title: "Demo Esports Tournament",
        description:
          "This is a demo esports tournament to show new hosts how LOOTBOX works.",
        tournamentLink: "https://www.communitygaming.io/",
        coverPhoto:
          "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Flion.jpeg?alt=media",
        prize: "$100 USD",
      },
      userID as unknown as UserIdpID
    ),
    createDemoOfferSuite(demoOffer, demoAd, advertiser.id, userID),
  ]);
  // include adset into tournament
  const adSetTournamentPayload = {
    adSetID: offerSuite.adSet.id,
    offerID: offerSuite.offer.id,
    organizerID: affiliate.id,
    tournamentID: tournamentDB.id,
  };
  await addOfferAdSetToTournament(
    adSetTournamentPayload,
    userID as unknown as UserIdpID
  );
  // create lootboxes
  const demoLootboxes = [
    {
      name: "Team Articuno",
      tournamentID: tournamentDB.id,
      backgroundImage:
        "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Farticuno.jpeg?alt=media",
      themeColor: "#0c7196",
      nftBountyValue: "$5 USD",
      maxTickets: 30,
      description: "Demo Lootbox for Team Articuno",
      creatorID: userID,
      stampImage:
        "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Fteam_articuno.png?alt=media",
      logo: "",
      symbol: "ARTICUNO",
      variant: LootboxVariant_Firestore.cosmic,
      stampMetadata: {
        playerHeadshot:
          "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Farticuno_player.png?alt=media",
        logoURLs: [],
        eventName: tournamentDB.title,
        hostName: advertiser.name,
      },
    },
    // {
    //   name: "",
    //   tournamentID: tournamentDB.id,
    //   backgroundImage: "",
    //   themeColor: "",
    //   nftBountyValue: 0,
    //   maxTickets: 0,
    //   description: "",
    //   stampMetadata: {
    //      headshot: "",
    //   }
    // },
  ];
  const demoLootboxDBs = await Promise.all(
    demoLootboxes.map((lb) => createDemoLootbox(lb, userID))
  );
  const assocBaseLootbox = randomFromArray(demoLootboxDBs);
  // create referrals
  const demoReferrals = await Promise.all(
    Array(4)
      .map((x) => {
        const assocUser = randomFromArray(
          userIDs[process.env.NODE_ENV || "production"]
        );
        const assocLootbox = randomFromArray(demoLootboxDBs);
        return {
          campaignName: "",
          promoterId: assocUser.promoterID as AffiliateID,
          referrerId: assocUser.userID as UserID,
          tournamentId: tournamentDB.id,
          type: ReferralType.Viral,
          lootboxID: assocLootbox.id,
          stampMetadata: {
            playerHeadshot: assocLootbox.stampMetadata.playerHeadshot,
            eventName: tournamentDB.title,
            hostName: affiliate.name,
          },
        };
      })
      .concat([
        {
          campaignName: "",
          promoterId: affiliateID,
          referrerId: userID,
          tournamentId: tournamentDB.id,
          type: ReferralType.Viral,
          lootboxID: assocBaseLootbox.id,
          stampMetadata: {
            playerHeadshot: assocBaseLootbox.stampMetadata.playerHeadshot,
            eventName: tournamentDB.title,
            hostName: affiliate.name,
          },
        },
      ])
      .map((referral) => createDemoReferral(referral, userID))
  );
  // create claims
};

const createDemoLootbox = async (payload: CreateLootboxPayload, userID) => {
  const lootbox = await LootboxService.create(
    {
      description: "A demo Lootbox for an esports tournament",
      backgroundImage: payload.backgroundImage,
      themeColor: payload.themeColor,
      nftBountyValue: payload.nftBountyValue,
      maxTickets: payload.maxTickets,
      lootboxName: payload.name,
      tournamentID: payload.tournamentID as unknown as TournamentID,
      stampMetadata: payload.stampMetadata
        ? {
            playerHeadshot: payload.stampMetadata.playerHeadshot ?? undefined,
            logoURLs: payload.stampMetadata.logoURLs ?? undefined,
          }
        : undefined,
    },
    userID
  );
  return lootbox;
};

const createDemoOfferSuite = async (
  demoOffer: CreateOfferPayload,
  demoAd: CreateAdPayload,
  advertiserID: AdvertiserID,
  userID: UserID
) => {
  const [offer, ad] = await Promise.all([
    createOffer(advertiserID, demoOffer, userID as unknown as UserIdpID),
    createAd(demoAd),
  ]);
  if (!ad) throw new Error("Could not create ad");
  const adSet = await createAdSet({
    adIDs: [ad.id],
    advertiserID: advertiserID,
    description:
      "This is a demo adset for new advertisers to learn how LOOTBOX works.",
    name: "Demo Ad Set",
    offerIDs: [offer.id],
    placement: Placement.AfterTicketClaim,
    status: AdSetStatus.Active,
    thumbnail: demoAd.creative.thumbnail,
  });
  return { offer, ad, adSet };
};

const createDemoReferral = async (
  payload: CreateReferralServiceRequest,
  userID: UserID
) => {
  const referral = await referralService.create(
    {
      campaignName: payload.campaignName,
      promoterId: payload.promoterId as AffiliateID | null | undefined,
      referrerId: payload.referrerId as UserID | null | undefined,
      tournamentId: payload.tournamentId as TournamentID,
      type: payload.type,
      lootboxID: payload.lootboxID as LootboxID | null | undefined,
      stampMetadata: payload.stampMetadata,
    },
    userID as unknown as UserID
  );
  return referral;
};

const randomFromArray = (arr: any[]): any => {
  // Get a random index from the array
  var randomIndex = Math.floor(Math.random() * arr.length);

  // Return the value at the random index
  return arr[randomIndex];
};
