import { AdCreativeType, AdvertiserID, Url } from "../base.types";

export const ScrollFeedAdSetExample = {
  ID: 1,
  Alias: "1 - Eizperchain Carousel",
  Title: "Eizperchain Carousel",
  Ads: ["recXTXvKlSv2AFKp3", "rec0SoRZ8EWxUuIeS"],
  "Url (from Ads)": [
    "https://www.yangcanggih.com/wp-content/uploads/2021/10/eizper-chain-2.jpg",
    "https://pbs.twimg.com/tweet_video_thumb/FRdILAjUcAAHv53.jpg",
  ],
  "Creative Type (from Ads)": ["IMAGE", "IMAGE"],
  "Title (from Ads)": ["Eizperchain Carousel A", "Eizperchain Carousel B"],
  "Alias (from Ads)": [
    "1 - Eizperchain Carousel A",
    "2 - Eizperchain Carousel B",
  ],
  Notes:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  Advertiser: ["rec2YzuwvjdLnkBiQ"],
  "Title (from Advertiser)": ["Eizperchain"],
  "One Liner (from Advertiser)": ["Lorem ipsum"],
  "Thumbnail (from Advertiser)": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmgjCGSB7R50EhaTKRpOKlKPaGdaVANowz9b7XoisIr31ccsBt4L1BgdwtN_pZR2K5vqY&usqp=CAU",
  ],
  Active: true,
};

export interface ScrollFeedAdSet {
  ID: number;
  Alias: string;
  Title: string;
  Ads: ScrollFeedAdID[];
  "Url (from Ads)": Url[];
  "Creative Type (from Ads)": AdCreativeType[];
  "Title (from Ads)": string[];
  "Alias (from Ads)": string[];
  Notes: string;
  Advertiser: AdvertiserID[];
  "Title (from Advertiser)": string[];
  "One Liner (from Advertiser)": string[];
  "Thumbnail (from Advertiser)": Url[];
  Active: true;
}

export interface ScrollFeedAdSetRecord {
  id: ScrollFeedAdSetID;
  createdTime: Date;
  fields: ScrollFeedAdSet;
}

export type ScrollFeedAdID = string & { readonly _: unique symbol };
export type ScrollFeedAdSetID = string & { readonly _: unique symbol };
