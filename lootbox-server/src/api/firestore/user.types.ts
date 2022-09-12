import {
  PartyBasketID,
  TournamentID,
  UserID,
  WalletID,
} from "@wormgraph/helpers";
import { LootboxSnapshot } from "./lootbox.types";

export interface Wallet {
  id: WalletID;
  userId: UserID;
  address: string;
  createdAt: number;
  lootboxSnapshots: LootboxSnapshot[];
}

export interface User {
  id: UserID;
  username?: string;
  avatar?: string;
  email?: string;
  phoneNumber?: string;
  biography?: string;
  headshot?: string[];
  socials?: UserSocials;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  wallets?: Wallet[];
  tournaments?: TournamentID[];
  partyBaskets?: PartyBasketID[];
}

export type UserSocials = {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  discord?: string;
  snapchat?: string;
  twitch?: string;
  web?: string;
};

export interface PublicUser {
  id: UserID;
  username?: string;
  avatar?: string;
  biography?: string;
  headshot?: string[];
  socials: UserSocials;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
