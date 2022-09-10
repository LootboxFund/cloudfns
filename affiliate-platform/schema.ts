// Schema for Affiliate Platform
/**
 *
 * We assume that the affiliate tracking software is the industry standard "Appsflyer"
 * Thus we use their params. Read the below docs:
 * - https://support.appsflyer.com/hc/en-us/articles/360017132597-OneLink-long-URLs
 * - https://support.appsflyer.com/hc/en-us/articles/207447163
 * - https://support.appsflyer.com/hc/en-us/articles/207273946-Available-Macros-on-AppsFlyer-sPostbacks
 *
 * ------ DATA WE SEND TO APPSFLYER ------
 *
 * // For Appsflyer Advertiser to filter in report visualizations
 * Media source (pid=LOOTBOX) see https://support.appsflyer.com/hc/en-us/articles/207447163#partner-id-pid-parameter
 * campaign name (c=tournamentID) limit 100 char
 * Ad set (af_adset=affiliateID) limit 100 char
 * Ad name (af_ad=offerID) limit 100 char
 *
 * // For Appsflyter to attribute to Lootbox and our tournament organizers
 * af_siteid=tournamentOrganizer
 * af_sub_siteid=affiliateID
 *
 * // For Appsflyer raw data exports, to drill deep into data outside of the in-app report visualizations
 * af_sub[n]=adID
 *
 * clickid= lootbox unique click id
 * is_incentivized= true or false
 *
 *
 * ------ DATA WE RECEIVE FROM APPSFLYER ------
 *
 * // All the same af_adset, ad_ad, c, af_siteid, af_sub_siteid params are returned back to us https://support.appsflyer.com/hc/en-us/articles/207273946-Available-Macros-on-AppsFlyer-sPostbacks
 * // but not af_sub[n]
 */

/**
 * ----------- MAIN AREAS OF FOCUS -----------
 *
 * 1.  ✅ Creating a Tournament
 * 2.  ✅ Offers as First Class Citizen
 * 3.  ✅ Affiliate rates calculated by offer & event & affiliate
 * 4.  ✅ Ad Targeting Tags
 * 5.  ✅ Organizer Tiers
 * 6.  ✅ Affiliate Risk Levels
 * 7.  ✅ Currency
 * 8.  ✅ Event Tracking & Postbacks
 * 9.  ✅ Assign Offer to Placements in Tournament
 * 10. ✅ Conquest Campaigns
 * 11. ⬜️ Budget Allocation by Event & Offer
 * 12. ⬜️ Reviews
 *
 */

type AdvertiserID = string & { readonly brand: unique symbol };
type TournamentID = string & { readonly _: unique symbol };
type OrganizerID = string & { readonly _: unique symbol };
type PromoterID = string & { readonly _: unique symbol };
type AffiliateID = OrganizerID | PromoterID | AffiliateType.LOOTBOX;
enum Currency {
  USD = "USD",
}

interface Organizer {
  id: OrganizerID;
  name: string;
  tier: OrganizerTier;
  risk: AffiliateRisk;
}

/**
 * ---- How Affiliate Tiers Work ----
 * Organizers start at Tier 1
 * Tier 1 gets you access to advertisers of tier 1, of their offers of tier 1
 * Tier N gets you access to advertisers of tier 1 through N
 *
 * When you access a new advertiser, you can see all their offers
 * However that does not mean you will necessarily be able to promote them
 * Offers are dynamically served on tickets based on the offer's targeting rules
 *
 * You may also be selectively whitelisted to higher tier offers if you have a good track record
 * Especially if you refer an advertiser to us
 */
type OrganizerTierID = string & { readonly _: unique symbol };
enum OrganizerTierEnum {
  CLAY = "CLAY", // Revenue Split 50/50
  BRONZE = "BRONZE", // Revenue Split 70/30
  SILVER = "SILVER", // Revenue Split 75/25
  GOLD = "GOLD", // Revenue Split 85/15
  PLATINUM = "PLATINUM", // Revenue Split 90/10
}
interface OrganizerTier {
  id: OrganizerTierID;
  slug: OrganizerTierEnum;
  title: string;
  description: string;
  percentage: number;
}

type OrganizerAdvertiserTierWhitelistID = string & {
  readonly _: unique symbol;
};
interface OrganizerAdvertiserTierWhitelist {
  id: OrganizerAdvertiserTierWhitelistID;
  organizerID: OrganizerID;
  advertiserID: AdvertiserID;
}
type OrganizerOfferTierWhitelistID = string & {
  readonly _: unique symbol;
};
interface OrganizerOfferTierWhitelist {
  id: OrganizerOfferTierWhitelistID;
  organizerID: OrganizerID;
  offerID: OfferID;
  advertiserID: AdvertiserID;
}

/**
 * ---- How Affiliate Risk Works ----
 * We have a risk class for each affiliate
 * Advertisers can determine what risk level they will work with
 * Offers can also have a risk level
 */
type AffiliateRiskID = string & { readonly _: unique symbol };
enum AffiliateRiskEnum {
  VERY_HIGH_RISK = "VERY_HIGH_RISK",
  HIGH_RISK = "HIGH_RISK",
  MEDIUM_RISK = "MEDIUM_RISK",
  NEW_AFFILIATE = "NEW_AFFILIATE",
  NEUTRAL_RISK = "NEUTRAL_RISK",
  LOW_RISK = "LOW_RISK",
  VERY_LOW_RISK = "VERY_LOW_RISK",
}
interface AffiliateRisk {
  id: AffiliateRiskID;
  slug: AffiliateRiskEnum;
  title: string;
  description: string;
}

interface Promoter {
  id: PromoterID;
  name: string;
  risk: AffiliateRisk;
}

enum AffiliateType {
  ORGANIZER = "ORGANIZER",
  PROMOTER = "PROMOTER",
  LOOTBOX = "LOOTBOX",
}

interface Affiliate {
  id: AffiliateID;
  type: AffiliateType;
}

interface User {
  id: UserID;
  username: string;
  email: string;
  AdTargetTags: AdTargetTag[];
}

enum OfferStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PLANNED = "PLANNED",
  ARCHIVED = "ARCHIVED",
}
type AdTargetTagID = string & { readonly _: unique symbol };
enum AdTargetTagType {
  GEOGRAPHY = "GEOGRAPHY",
  INTEREST = "INTEREST",
  DEVICE = "DEVICE",
  OS = "OS",
  INCOME = "INCOME",
}
interface AdTargetTag {
  id: AdTargetTagID;
  slug: string;
  title: string;
  description: string;
  color: string;
  type: AdTargetTagType;
}
interface Offer {
  id: OfferID;
  title: string;
  description: string;
  image: string;
  advertiserID: AdvertiserID;
  maxBudget: number;
  currency: Currency;
  startDate: Date;
  endDate: Date;
  status: OfferStatus;
  affiliateBaseLink: AffiliateBaseLinkID;
  mmp: MeasurementPartnerType;
  activations: Activation[];
  tags: AdTargetTag[];
  tiers: OrganizerTierEnum[];
  risks: AffiliateRiskEnum[];
  placements: PlacementConfig[];
}

interface Advertiser {
  id: AdvertiserID;
  name: string;
  description: string;
  offers: Offer[];
  tiers: OrganizerTierEnum[];
  risks: AffiliateRiskEnum[];
}

enum MeasurementPartnerType {
  APPSFLYER = "APPSFLYER",
}

type RateCardID = string & { readonly _: unique symbol };
type ActivationID = string & { readonly _: unique symbol };
type AffiliateBaseLinkID = string & { readonly _: unique symbol };
type ActivationPricingID = string & { readonly _: unique symbol };
type ActivationEventName = string;

interface Activation {
  id: ActivationID;
  name: ActivationEventName;
  description: string;
}

interface ActivationPricing {
  id: ActivationPricingID;
  activationID: ActivationID;
  pricing: number;
  currency: Currency;
  percentage: number;
  affiliateID: AffiliateID;
  affiliateType: AffiliateType;
}

interface AffiliateRateCard {
  id: RateCardID;
  name: string;
  advertiserID: AdvertiserID;
  activations: ActivationPricing[];
  affiliateID: AffiliateID;
  affiliateType: AffiliateType;
  tournamentID?: TournamentID;
  organizerID?: OrganizerID;
  promoterID?: PromoterID;
  currency: Currency;
}

interface Tournament {
  id: TournamentID;
  name: string;
  description: string;
  datestart: Date;
  dateend: Date;
  organizerID: OrganizerID;
  promoters: PromoterID[];
  advertisers: AdvertiserID[];
  offerConfigs: OfferTournamentPlacementConfig[];
  rateCards: AffiliateRateCard[];
  maxBudget: number;
  currency: Currency;
}

type OfferTournamentPlacementConfigID = string & { readonly _: unique symbol };
interface OfferTournamentPlacementConfig {
  id: OfferTournamentPlacementConfigID;
  offerID: OfferID;
  advertiserID: AdvertiserID;
  placements: PlacementConfig[];
}

type ClickAdEventID = string & { readonly _: unique symbol };
type AdID = string & { readonly _: unique symbol };
type FlightID = string & { readonly _: unique symbol };
type UserID = string & { readonly _: unique symbol };
type OfferID = string & { readonly _: unique symbol };
type LootboxTicketID = string & { readonly _: unique symbol };

interface ClickAdEvent {
  id: ClickAdEventID;
  affiliateID: AffiliateID;
  advertiserID: AdvertiserID;
  offerID: OfferID;
  addID: AdID;
  flightID: FlightID;
  userID: UserID;
  initiativeID: InitiativeID;
  initiativeType: InitiativeType;
  lootboxTicketID?: LootboxTicketID;
  placementType: Placement;
}

enum Placement {
  AFTER_TICKET_CLAIM_VIDEO = "AFTER_TICKET_CLAIM_VIDEO",
  DAILY_SPIN_VIDEO = "DAILY_SPIN_VIDEO",
  EVERYONES_A_WINNER = "EVERYONES_A_WINNER",
}

type PlacementConfigID = string & { readonly _: unique symbol };
interface PlacementConfig {
  id: PlacementConfigID;
  offerID: OfferID;
  placement: Placement;
  mediaset: MediaSet;
}
interface MediaSet {
  title: string;
  description: string;
  mediaURL: string;
  callToAction: string;
  callToActionURL: string; // should be affiliate link
}

type InitiativeID = TournamentID | InitiativeType.DAILY_SPIN;
enum InitiativeType {
  TOURNAMENT = "TOURNAMENT",
  DAILY_SPIN = "DAILY_SPIN",
}

type ActivationPostbackID = string & { readonly _: unique symbol };
interface AppsFlyerPostback {
  id: ActivationPostbackID;
  clickid: ClickAdEventID;
  af_siteid: OrganizerID;
  af_sub_siteid: AffiliateID;
  af_adset: AffiliateID;
  af_ad: OfferID;
  af_sub1: AdID;
  af_sub2: AffiliateType;
  c: TournamentID;
  timestamp: Date;
  eventName: ActivationEventName;
}

type ActivationPayoutMemoID = string & { readonly _: unique symbol };
interface ActivationPayoutMemo {
  id: ActivationPayoutMemoID;
  activationPostbackID: ActivationPostbackID;
  clickAdEventID: ClickAdEventID;
  affiliateID?: AffiliateID;
  affiliateType?: AffiliateType;
  advertiserID: AdvertiserID;
  tournamentID?: TournamentID;
  organizerID?: OrganizerID;
  promoterID?: PromoterID;
  adID: AdID;
  initiativeID: InitiativeID;
  initiativeType: InitiativeType;
  payoutAmount: number;
  payoutCurrency: Currency;
  activationEventName: ActivationEventName;
  timestamp: Date;
}

type ConquestID = string & { readonly _: unique symbol };
enum ConquestStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PLANNED = "PLANNED",
  ARCHIVED = "ARCHIVED",
}
interface Conquest {
  id: ConquestID;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  advertiser: Advertiser;
  status: ConquestStatus;
  maxBudget: number;
  currency: Currency;
  tournaments: TournamentID[];
}

// ---------------------------------------------------------------------------------------------------

const createTournament = (): Tournament => {
  return Mock_Tournament;
};

const trackClickAdEvent = (): ClickAdEvent => {
  return Mock_ClickAdEvent;
};

const trackActivationPostback = (): AppsFlyerPostback => {
  return Mock_AppsFlyerPostback;
};

const createActivationPayoutMemo = (
  tournament: Tournament,
  activationPostback: AppsFlyerPostback
): ActivationPayoutMemo => {
  return Mock_ActivationPayoutMemo;
};

const Mock_AdvertiserID = "Mock_AdvertiserID" as AdvertiserID;
const Mock_TournamentID = "Mock_TournamentID" as TournamentID;
const Mock_OrganizerID = "Mock_OrganizerID" as OrganizerID;
const Mock_PromoterID = "Mock_PromoterID" as PromoterID;

const Mock_AffiliateID_Lootbox = "Mock_AffiliateID_Lootbox" as AffiliateID;
const Mock_AffiliateID_Organizer = "Mock_AffiliateID_Organizer" as AffiliateID;
const Mock_AffiliateID_Promoter = "Mock_AffiliateID_Promoter" as AffiliateID;

const Mock_AffiliateRiskID_Organizer =
  "Mock_AffiliateRiskID_Organizer" as AffiliateRiskID;
const Mock_AffiliateRiskID_Promoter =
  "Mock_AffiliateRiskID_Promoter" as AffiliateRiskID;
const Mock_OrganizerTierID = "Mock_OrganizerTierID" as OrganizerTierID;

const Mock_AffiliateRisk_Organizer = {
  id: Mock_AffiliateRiskID_Organizer,
  slug: AffiliateRiskEnum.NEW_AFFILIATE,
  title: "New Affiliate",
  description: "New Affiliate Risk Level",
};
const Mock_AffiliateRisk_Promoter = {
  id: Mock_AffiliateRiskID_Promoter,
  slug: AffiliateRiskEnum.NEW_AFFILIATE,
  title: "New Affiliate",
  description: "New Affiliate Risk Level",
};
const Mock_OrganizerTier = {
  id: Mock_OrganizerTierID,
  slug: OrganizerTierEnum.CLAY,
  title: "Clay Tier - 50/50 Split",
  description: "For new organizers",
  percentage: 0.5,
};

const Mock_Organizer: Organizer = {
  id: Mock_OrganizerID,
  name: "Mock_Organizer",
  tier: Mock_OrganizerTier,
  risk: Mock_AffiliateRisk_Organizer,
};

const Mock_Promoter: Promoter = {
  id: Mock_PromoterID,
  name: "Mock_Promoter",
  risk: Mock_AffiliateRisk_Promoter,
};

const Mock_Affiliate_Lootbox: Affiliate = {
  id: Mock_AffiliateID_Lootbox,
  type: AffiliateType.LOOTBOX,
};

const Mock_Affiliate_Organizer: Affiliate = {
  id: Mock_AffiliateID_Organizer,
  type: AffiliateType.ORGANIZER,
};

const Mock_Affiliate_Promoter: Affiliate = {
  id: Mock_AffiliateID_Promoter,
  type: AffiliateType.PROMOTER,
};

const Mock_ActivationID = "Mock_ActivationID" as ActivationID;
const Mock_AffiliateBaseLinkID =
  "Mock_AffiliateBaseLinkID" as AffiliateBaseLinkID;
const Mock_ActivationEventName =
  "Mock_ActivationEventName" as ActivationEventName;

const Mock_RateCardID_Master = "Mock_RateCardID_Master" as RateCardID;
const Mock_RateCardID_Organizer = "Mock_RateCardID_Organizer" as RateCardID;
const Mock_RateCardID_Promoter = "Mock_RateCardID_Promoter" as RateCardID;

const Mock_ActivationPricingID_Master =
  "Mock_ActivationPricingID_Master" as ActivationPricingID;
const Mock_ActivationPricingID_Organizer =
  "Mock_ActivationPricingID_Organizer" as ActivationPricingID;
const Mock_ActivationPricingID_Promoter =
  "Mock_ActivationPricingID_Promoter" as ActivationPricingID;

const Mock_Activation: Activation = {
  id: Mock_ActivationID,
  name: Mock_ActivationEventName,
  description: "Mock_Activation Description",
};
const Mock_ActivationPricing_Master: ActivationPricing = {
  id: Mock_ActivationPricingID_Master,
  activationID: Mock_ActivationID,
  pricing: 0.3,
  currency: Currency.USD,
  percentage: 0,
  affiliateID: Mock_AffiliateID_Lootbox,
  affiliateType: AffiliateType.LOOTBOX,
};

const Mock_ActivationPricing_Organizer: ActivationPricing = {
  id: Mock_ActivationPricingID_Organizer,
  activationID: Mock_ActivationID,
  pricing: 0.2,
  currency: Currency.USD,
  percentage: 0,
  affiliateID: Mock_AffiliateID_Organizer,
  affiliateType: AffiliateType.ORGANIZER,
};

const Mock_ActivationPricing_Promoter: ActivationPricing = {
  id: Mock_ActivationPricingID_Promoter,
  activationID: Mock_ActivationID,
  pricing: 0.05,
  currency: Currency.USD,
  percentage: 0,
  affiliateID: Mock_AffiliateID_Promoter,
  affiliateType: AffiliateType.PROMOTER,
};

const Mock_AffiliateRateCard_Organizer: AffiliateRateCard = {
  id: Mock_RateCardID_Organizer,
  name: "Mock_AffiliateRateCard_Organizer",
  advertiserID: Mock_AdvertiserID,
  activations: [Mock_ActivationPricing_Organizer],
  affiliateID: Mock_AffiliateID_Organizer,
  affiliateType: AffiliateType.ORGANIZER,
  currency: Currency.USD,
};

const Mock_AffiliateRateCard_Promoter: AffiliateRateCard = {
  id: Mock_RateCardID_Promoter,
  name: "Mock_AffiliateRateCard_Promoter",
  advertiserID: Mock_AdvertiserID,
  activations: [Mock_ActivationPricing_Promoter],
  affiliateID: Mock_AffiliateID_Promoter,
  affiliateType: AffiliateType.PROMOTER,
  currency: Currency.USD,
};

const Mock_ClickAdEventID = "Mock_ClickAdEventID" as ClickAdEventID;
const Mock_AdID = "Mock_AdID" as AdID;
const Mock_FlightID = "Mock_FlightID" as FlightID;
const Mock_UserID = "Mock_UserID" as UserID;
const Mock_OfferID = "Mock_OfferID" as OfferID;
const Mock_LootboxTicketID = "Mock_LootboxTicketID" as LootboxTicketID;

const Mock_ActivationPostbackID =
  "Mock_ActivationPostbackID" as ActivationPostbackID;

const Mock_ClickAdEvent: ClickAdEvent = {
  id: Mock_ClickAdEventID,
  affiliateID: Mock_AffiliateID_Promoter,
  advertiserID: Mock_AdvertiserID,
  offerID: Mock_OfferID,
  addID: Mock_AdID,
  flightID: Mock_FlightID,
  userID: Mock_UserID,
  initiativeID: Mock_TournamentID,
  initiativeType: InitiativeType.TOURNAMENT,
  lootboxTicketID: Mock_LootboxTicketID,
  placementType: Placement.AFTER_TICKET_CLAIM_VIDEO,
};

const Mock_AppsFlyerPostback: AppsFlyerPostback = {
  id: Mock_ActivationPostbackID,
  clickid: Mock_ClickAdEventID,
  af_siteid: Mock_OrganizerID,
  af_sub_siteid: Mock_AffiliateID_Promoter,
  af_adset: Mock_AffiliateID_Promoter,
  af_ad: Mock_OfferID,
  af_sub1: Mock_AdID,
  af_sub2: AffiliateType.PROMOTER,
  c: Mock_TournamentID,
  timestamp: new Date(),
  eventName: Mock_ActivationEventName,
};

const Mock_ActivationPayoutMemoID =
  "Mock_ActivationPayoutMemoID" as ActivationPayoutMemoID;
const Mock_ActivationPayoutMemo: ActivationPayoutMemo = {
  id: Mock_ActivationPayoutMemoID,
  activationPostbackID: Mock_ActivationPostbackID,
  clickAdEventID: Mock_ClickAdEventID,
  affiliateID: Mock_AffiliateID_Promoter,
  affiliateType: AffiliateType.PROMOTER,
  advertiserID: Mock_AdvertiserID,
  tournamentID: Mock_TournamentID,
  organizerID: Mock_OrganizerID,
  promoterID: Mock_PromoterID,
  adID: Mock_AdID,
  initiativeID: Mock_TournamentID,
  initiativeType: InitiativeType.TOURNAMENT,
  payoutAmount: 0.05,
  payoutCurrency: Currency.USD,
  activationEventName: Mock_ActivationEventName,
  timestamp: new Date(),
};

const Mock_AdTargetTagID = "Mock_AdTargetTagID" as AdTargetTagID;
const Mock_AdTargetTag_PCGAMER: AdTargetTag = {
  id: Mock_AdTargetTagID,
  slug: "pc_gamer",
  title: "PC Gamers",
  description: "PC Gamers",
  color: "#ffffff",
  type: AdTargetTagType.INTEREST,
};

const Mock_Offer: Offer = {
  id: Mock_OfferID,
  title: "Mock Offer Title",
  description: "Mock Offer Description",
  image: "https://lootbox.gg/images/lootbox-logo.png",
  advertiserID: Mock_AdvertiserID,
  maxBudget: 1000,
  currency: Currency.USD,
  startDate: new Date(),
  endDate: new Date(),
  status: OfferStatus.ACTIVE,
  affiliateBaseLink: Mock_AffiliateBaseLinkID,
  mmp: MeasurementPartnerType.APPSFLYER,
  activations: [Mock_Activation],
  tags: [Mock_AdTargetTag_PCGAMER],
  tiers: [OrganizerTierEnum.BRONZE],
  risks: [AffiliateRiskEnum.LOW_RISK],
};

const Mock_Advertiser: Advertiser = {
  id: Mock_AdvertiserID,
  name: "Mock_Advertiser",
  description: "Mock_Advertiser",
  offers: [Mock_Offer],
  risks: [AffiliateRiskEnum.MEDIUM_RISK],
  tiers: [OrganizerTierEnum.BRONZE],
};

const Mock_Tournament: Tournament = {
  id: Mock_TournamentID,
  name: "Mock_Tournament",
  organizerID: Mock_OrganizerID,
  promoters: [Mock_PromoterID],
  advertisers: [Mock_AdvertiserID],
  offers: [Mock_Offer],
  description: "Mock_Tournament Description",
  datestart: new Date(),
  dateend: new Date(),
  maxBudget: 1000,
  currency: Currency.USD,
};
