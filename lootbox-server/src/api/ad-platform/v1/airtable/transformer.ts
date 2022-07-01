import {
  AdID,
  ZoneID,
  CampaignID,
  AdvertiserID,
  Url,
  AdCreativeType,
  AdType,
  AirtableRecordID,
} from "../types/base.types";

const airtableAdSetExample = {
  ID: 1,
  Ads: ["recHoKLUYPk1vgbPU"],
  Zones: ["recGtzghKhbDDp6TF"],
  Campaign: ["recESDTj1YP8RqBkX"],
  Active: true,
  Title: "Carousel Teaser",
  Alias: "1 - Carousel Teaser (1 - Eizperchain)",
  Advertiser: ["reclOR1ePTEwduPJi"],
  "Campaign Active": [true],
  Renderable: 1,
  "Advertiser Name": ["Eizperchain"],
  "Advertiser One-Liner": ["Blockchain MMORPG Game"],
  "Creative URLs": [
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/golden-retriever-royalty-free-image-506756303-1560962726.jpg?crop=0.672xw:1.00xh;0.166xw,0&resize=640:*",
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/golden-retriever-royalty-free-image-506756303-1560962726.jpg?crop=0.672xw:1.00xh;0.166xw,0&resize=640:*",
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/golden-retriever-royalty-free-image-506756303-1560962726.jpg?crop=0.672xw:1.00xh;0.166xw,0&resize=640:*",
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/golden-retriever-royalty-free-image-506756303-1560962726.jpg?crop=0.672xw:1.00xh;0.166xw,0&resize=640:*",
  ],
  "Creative Types": ["GIF", "Image", "GIF", "Image"],
  "Ad Type": ["Carousel"],
  "Ad Title": ["Blockchain MMORPG"],
  "Ad Description": [
    "Meet Eizperchain, a blockchain MMORPG Game where you get to battle monsters and level up your character.",
  ],
  "Advertiser Thumbnail": [
    "https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/kitty-cat-close-up-camryn-zee-photography.jpg",
  ],
};

export interface AirtableAdSetRecord {
  ID: number;
  Ads: AdID[];
  Zones: ZoneID[];
  Campaign: CampaignID[];
  Active: boolean;
  Title: string;
  Alias: string;
  Advertiser: AdvertiserID[];
  "Campaign Active": boolean[];
  Renderable: number;
  "Advertiser Name": string[];
  "Advertiser One-Liner": string[];
  "Creative URLs": Url[];
  "Creative Types": AdCreativeType[];
  "Ad Type": AdType[];
  "Ad Title": string[];
  "Ad Description": string[];
  "Advertiser Thumbnail": Url[];
}

export interface IAirtableAdSetRecord {
  id: AirtableRecordID;
  createdTime: Date;
  fields: AirtableAdSetRecord;
}
