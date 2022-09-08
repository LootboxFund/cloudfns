// Duplicated from lootbox-server - TODO: move to helpers

export type UserID = string & { readonly _: unique symbol };
export type UserIdpID = string & { readonly _: unique symbol };
export type LootboxID = string & { readonly _: unique symbol };
export type WalletID = string & { readonly _: unique symbol };
export type TournamentID = string & { readonly _: unique symbol };
export type PartyBasketID = string & { readonly _: unique symbol };
export type WhitelistSignatureID = string & { readonly _: unique symbol };
export type StreamID = string & { readonly _: unique symbol };
export type ReferralSlug = string & { readonly _: unique symbol };
export type ReferralID = string & { readonly _: unique symbol };
export type ClaimID = string & { readonly _: unique symbol };
export type AdID = string & { readonly _: unique symbol };
export type SessionID = string & { readonly _: unique symbol };
export type CampaignID = string & { readonly _: unique symbol };
export type FlightID = string & { readonly _: unique symbol };
export type AdEventNonce = string & { readonly _: unique symbol };

export enum Collection {
    "Lootbox" = "lootbox",
    "User" = "user",
    "Wallet" = "wallet",
    "Tournament" = "tournament",
    "PartyBasket" = "party-basket",
    "WhitelistSignature" = "whitelist-signature",
    "Stream" = "stream",
    "Referral" = "referral",
    "Claim" = "claim",
    "Ad" = "ad",
    "Creative" = "creative",
    "AdEvent" = "ad-event",
}
