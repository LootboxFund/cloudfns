import { Claim_Firestore, Collection, User_Firestore } from "@wormgraph/helpers";
import * as functions from "firebase-functions";
import { manifest } from "../manifest";
import * as idpProvider from "../api/auth";
import { getUnverifiedClaimsForUser } from "../api/firestore/referral";
import * as claimService from "../service/claim";

// Also this is duplicated in @firebase/functions
const REGION = manifest.cloudFunctions.region;

/**
 * If phone number is added, then this will automatically transition
 * unverified claims to completed if applicable.
 */
export const onUserWrite = functions
    .region(REGION)
    .firestore.document(`/${Collection.User}/{userID}`)
    .onWrite(async (snap) => {
        const before = snap.before.data() as User_Firestore | undefined;
        const after = snap.after.data() as User_Firestore | undefined;

        const beforePhoneNumber = before?.phoneNumber;
        const afterPhoneNumber = after?.phoneNumber;

        if (!!afterPhoneNumber && !beforePhoneNumber && !!before) {
            // User is not new & phone number added
            // Double check, make sure phone is in the IDP provider
            let userIDP: idpProvider.IIdpUser;
            try {
                userIDP = await idpProvider.getUser(after.id);
            } catch (err) {
                console.error("Error getting user from IDP provider", err);
                return;
            }

            if (userIDP.phoneNumber) {
                // Phone number is in IDP provider, so we can transition
                // unverified claims to completed
                let claimsToTransition: Claim_Firestore[] = [];
                try {
                    claimsToTransition = await getUnverifiedClaimsForUser(after.id);
                } catch (err) {
                    functions.logger.error("Error getting unverified claims for user", err);
                    return;
                }

                for (const claim of claimsToTransition) {
                    try {
                        await claimService.transitionUnverifiedClaimToCompleted(after, claim);
                    } catch (err) {
                        functions.logger.error("Error verifying claim", err);
                    }
                }
            }
        }
    });
