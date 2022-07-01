export type AdvertiserID = string & { readonly _: unique symbol };
export type Url = string;

export enum AdCreativeType {
  IMAGE = "Image",
  GIF = "Gif",
  VIDEO = "Video",
  URL = "Url",
}
