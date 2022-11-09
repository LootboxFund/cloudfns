import { auth } from "./firebase";
import { UserRecord } from "firebase-admin/auth";
import { UserID, UserIdpID } from "@wormgraph/helpers";

export interface IIdpUser {
    id: UserIdpID;
    email?: string;
    isEnabled: boolean;
    phoneNumber?: string;
    username?: string;
    avatar?: string;
    emailVerified: boolean;
    // claims: IClaims;
}

const convertUserRecordToUser = (userRecord: UserRecord): IIdpUser => {
    return {
        id: userRecord.uid as UserIdpID,
        email: userRecord.email ?? "",
        phoneNumber: userRecord.phoneNumber ?? "",
        isEnabled: !userRecord.disabled,
        username: userRecord.displayName ?? "",
        avatar: userRecord.photoURL ?? "",
        emailVerified: userRecord.emailVerified,
    };
};

export const getUsers = async (userIDs: UserID[]): Promise<IIdpUser[]> => {
    const { users } = await auth.getUsers(
        userIDs.map((uid) => {
            return {
                uid,
            };
        })
    );
    return users.map(convertUserRecordToUser);
};

export const getUser = async (userID: UserID): Promise<IIdpUser> => {
    const userRecord = await auth.getUser(userID);
    return convertUserRecordToUser(userRecord);
};
