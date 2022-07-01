export type AdID = string & { readonly _: unique symbol };
export type AdSetID = string & { readonly _: unique symbol };
export type CampaignID = string & { readonly _: unique symbol };
export type AdvertiserID = string & { readonly _: unique symbol };
export type FlightID = string & { readonly _: unique symbol };
export type ZoneID = string & { readonly _: unique symbol };
export type ClickableID = string & { readonly _: unique symbol };
export type ClickID = string & { readonly _: unique symbol };
export type ImpressionID = string & { readonly _: unique symbol };
export type BillingPlanID = string & { readonly _: unique symbol };

export enum AdEventType {
  IMPRESSION = "IMP",
  CLICK = "CLICK",
}

export enum AdCreativeType {
  IMAGE = "IMAGE",
  GIF = "GIF",
  VIDEO = "VIDEO",
  URL = "URL",
}

export enum SocialNetwork {
  FACEBOOK = "FACEBOOK",
  TWITTER = "TWITTER",
  INSTAGRAM = "INSTAGRAM",
  DISCORD = "DISCORD",
}

export enum AdZone {
  SCROLL_FEED = "SCROLL_FEED",
  FOCUS_TRAILER = "FOCUS_TRAILER",
  SOCIAL_PREVIEW = "SOCIAL_PREVIEW",
  ACTIVATION_ASK = "ACTIVATION_ASK",
}

export type Url = string;
