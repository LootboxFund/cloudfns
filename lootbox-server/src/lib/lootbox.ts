import { Lootbox, LootboxSnapshot } from "../graphql/generated/types";

export const convertLootboxToSnapshot = (data: Lootbox): LootboxSnapshot => {
  return {
    address: data.address,
    issuer: data.issuer,
    name: data.name,
    metadataDownloadUrl: data.metadataDownloadUrl,
    timestamps: {
      updatedAt: data.timestamps.updatedAt,
      createdAt: data.timestamps.createdAt,
    },
    backgroundColor:
      data?.metadata?.lootboxCustomSchema?.lootbox.backgroundColor || "",
    backgroundImage:
      data?.metadata?.lootboxCustomSchema?.lootbox.backgroundImage || "",
    image: data?.metadata?.lootboxCustomSchema?.lootbox.image || "",
    stampImage: data.metadata.image,
  };
};
