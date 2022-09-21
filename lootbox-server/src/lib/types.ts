import { ClaimStatus, ClaimType } from "../graphql/generated/types";
export {
  UserID,
  UserIdpID,
  LootboxID,
  WalletID,
  TournamentID,
  PartyBasketID,
  WhitelistSignatureID,
  StreamID,
  ReferralSlug,
  ReferralID,
  ClaimID,
  AdID,
  SessionID,
  CampaignID,
  FlightID,
  AdEventNonce,
  Collection,
  CreativeID,
  AdvertiserID,
  AffiliateID,
  OfferID,
  MemoID,
  Currency,
  OfferStatus,
} from "@wormgraph/helpers";

export type ClaimsCsvRow = {
  // tournament
  tournamentId: string;
  tournamentName: string;

  // referral
  referralId: string;
  referralCampaignName: string;
  referralSlug: string;
  referralLink: string;
  referralType: string;

  // claim
  claimId: string;
  claimStatus: ClaimStatus;
  claimType: ClaimType;
  rewardFromClaim: string;
  rewardFromFriendReferred: string;

  // user (claimer) & referrer
  claimerId: string;
  claimerUsername: string;
  claimerProfileLink: string;
  claimerSocial_Facebook: string;
  claimerSocial_Twitter: string;
  claimerSocial_Instagram: string;
  claimerSocial_TikTok: string;
  claimerSocial_Discord: string;
  claimerSocial_Snapchat: string;
  claimerSocial_Twitch: string;
  claimerSocial_Web: string;
  claimerAddress_0: string;
  claimerAddress_1: string;
  claimerAddress_2: string;
  claimerAddress_3: string;
  claimerAddress_4: string;
  claimerAddress_5: string;
  claimerAddress_6: string;
  claimerAddress_7: string;
  claimerAddress_8: string;
  claimerAddress_9: string;
  claimerAddress_10: string;

  // socials for referrer
  referrerId: string;
  referrerUsername: string;
  referrerProfileLink: string;
  referrerSocial_Facebook: string;
  referrerSocial_Twitter: string;
  referrerSocial_Instagram: string;
  referrerSocial_TikTok: string;
  referrerSocial_Discord: string;
  referrerSocial_Snapchat: string;
  referrerSocial_Twitch: string;
  referrerSocial_Web: string;
  referrerAddress_0: string;
  referrerAddress_1: string;
  referrerAddress_2: string;
  referrerAddress_3: string;
  referrerAddress_4: string;
  referrerAddress_5: string;
  referrerAddress_6: string;
  referrerAddress_7: string;
  referrerAddress_8: string;
  referrerAddress_9: string;
  referrerAddress_10: string;

  // lootbox + party baskets
  lootboxAddress: string;
  lootboxName: string;
  lootboxLink: string;

  partyBasketId: string;
  partyBasketName: string;
  partyBasketRedeemLink: string;
  partyBasketManageLink: string;
  partyBasketAddress: string;
  partyBasketNFTBountyValue: string;

  originPartyBasketId: string;
  // originPartyBasketName: String!
  // originPartyBasketLink: String!
  // originPartyBasketAddress: String!

  // timestamp
  claimCreatedAt: number;
  claimUpdatedAt: number;
};
