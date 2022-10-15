import { UserID } from "@wormgraph/helpers";

export interface StampProps {
  stampID: string;
  teamName: string;
  userID: UserID;
}

export interface StampNewInviteProps {
  teamName: string;
  userID: UserID;
}
export interface StampNewInviteResponse {
  message: string;
  stamp: string;
}
