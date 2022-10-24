import {
    Address,
    ChainIDDecimal,
    ChainIDHex,
    LootboxTicketID_Web3,
    LootboxTicketMetadataV2_Firestore,
    LootboxVariant_Firestore,
    Lootbox_Firestore,
} from "@wormgraph/helpers";
import { manifest } from "../manifest";

export const convertLootboxToTicketMetadata = (
    ticketID: LootboxTicketID_Web3,
    lootboxFragment: Omit<Lootbox_Firestore, "metadataV2">
): LootboxTicketMetadataV2_Firestore => {
    const lootboxExternalURL =
        lootboxFragment.variant === LootboxVariant_Firestore.cosmic
            ? `${manifest.microfrontends.webflow.cosmicLootboxPage}?lootbox=${lootboxFragment.address}`
            : `${manifest.microfrontends.webflow.lootboxUrl}?lootbox=${lootboxFragment.address}`;

    const res: LootboxTicketMetadataV2_Firestore = {
        // points to stamp image - opensea compatible
        image: lootboxFragment.stampImage,
        // points to lootbox page on lootbox.fund - opensea compatible
        external_url: lootboxExternalURL,
        // description of the lootbox - opensea compatible
        description: lootboxFragment.description || "",
        // name of the lootbox - opensea compatible
        name: lootboxFragment.name,
        // hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible
        background_color: lootboxFragment.themeColor,
        // A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA
        lootboxCustomSchema: {
            ticketID,
            version: "",
            address: (lootboxFragment.address || "") as Address,
            chainIdHex: lootboxFragment.chainIdHex as ChainIDHex,
            chainIdDecimal: lootboxFragment.chainIdDecimal as ChainIDDecimal,
            chainName: lootboxFragment.chainName as string,
            transactionHash: lootboxFragment.transactionHash as string,
            blockNumber: lootboxFragment.blockNumber as string,
            factory: (lootboxFragment.factory || "") as Address,
            name: lootboxFragment.name,
            description: lootboxFragment.description || "",
            logo: lootboxFragment.logo || "",
            backgroundImage: lootboxFragment.backgroundImage,
            badgeImage: "",
            createdAt: lootboxFragment.timestamps.createdAt,
            lootboxThemeColor: lootboxFragment.themeColor,
            themeColor: lootboxFragment.themeColor,
        },
    };
    return res;
};
