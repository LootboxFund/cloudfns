import { CreativeID, UserID } from "@wormgraph/helpers";

export enum CreativeType {
  image = "image",
  video = "video",
}
export interface Creative_Firestore {
  id: CreativeID;
  creatorId: UserID;
  advertiserId: UserID;
  creativeType: CreativeType;
  creativeLinks: string[];
  callToActionText?: string;
  url: string;
  clickUrl?: string;
  thumbnail?: string;
  infographicLink?: string;
  creativeAspectRatio: string;
  themeColor?: string;
}
