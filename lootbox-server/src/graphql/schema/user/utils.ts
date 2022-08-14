import { UserWithoutWalletsOrLootboxSnapshots } from "../../../api/firestore";
import { PublicUser, User } from "../../generated/types";

export const convertUserToPublicUser = (
  user: UserWithoutWalletsOrLootboxSnapshots
): PublicUser => {
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    socials: { ...user.socials },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
};
