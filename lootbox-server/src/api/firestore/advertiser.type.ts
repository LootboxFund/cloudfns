import {
  ConquestID,
  ConquestStatus,
  Currency,
  UserID,
} from "@wormgraph/helpers";
import { AdvertiserID, OfferID, TournamentID } from "../../lib/types";

export interface Advertiser_Firestore {
  id: AdvertiserID;
  userID: UserID;
  name: string;
  description: string;
  offers: OfferID[];
  conquests: Conquest_Firestore[];
}

export interface Conquest_Firestore {
  id: ConquestID;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  advertiserID: AdvertiserID;
  status: ConquestStatus;
  spentBudget: number;
  maxBudget: number;
  currency: Currency;
  tournaments: TournamentID[];
}
