import { AdCreativeType, Url, SocialNetwork, AdZone } from "./base.types";

export interface AdCarousel {
  title: string;
  description: string;
  creatives: AdCreative[];
  slug: AdZone.SCROLL_FEED;
}

export interface AdCreative {
  alias: string;
  url: string;
  type: AdCreativeType;
}

export interface AdFocusTrailer {
  title: string;
  description: string;
  videoUrl: Url;
  slug: AdZone.FOCUS_TRAILER;
}

export interface AdSocialPreview {
  title: string;
  url: string;
  social: SocialNetwork;
  imagePreview?: Url;
  slug: AdZone.SOCIAL_PREVIEW;
}

export interface AdActivationAsk {
  title: string;
  description: string;
  destinationUrl: string;
  image: Url;
  slug: AdZone.ACTIVATION_ASK;
}
