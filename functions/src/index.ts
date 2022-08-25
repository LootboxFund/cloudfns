import "./api/firebase";
import * as functions from "firebase-functions";
import {
  Claim,
  ClaimStatus,
  PartyBasket,
  PartyBasketStatus,
} from "./api/graphql/generated/types";
import { Collection } from "./lib/types";
import { db } from "./api/firebase";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";

const DEFAULT_MAX_CLAIMS = 10000;

export const onReferralWrite = functions.firestore
  .document(
    `/${Collection.Referral}/{referralId}/${Collection.Claim}/{claimId}`
  )
  .onWrite(async (snap, context) => {
    // Grab the current value of what was written to Firestore.
    const oldClaim = snap.before.data() as Claim | undefined;
    const newClaim = snap.after.data() as Claim | undefined;

    if (
      newClaim?.status === ClaimStatus.Complete &&
      newClaim?.status !== oldClaim?.status &&
      newClaim?.chosenPartyBasketId
    ) {
      try {
        const partyBasketRef = db
          .collection(Collection.PartyBasket)
          .doc(newClaim.chosenPartyBasketId) as DocumentReference<Claim>;

        const updateReq: Partial<PartyBasket> = {
          runningCompletedClaims: FieldValue.increment(1) as unknown as number,
        };

        await partyBasketRef.update(updateReq);
      } catch (err) {
        console.error("Error onReferralWrite");
        console.error(err);
      }
    }
  });

export const onPartyBasketWrite = functions.firestore
  .document(`/${Collection.PartyBasket}/{partyBasketId}`)
  .onWrite(async (snap, context) => {
    const oldPartyBasket = snap.before.data() as PartyBasket | undefined;
    const newPartyBasket = snap.after.data() as PartyBasket | undefined;

    const maxCompletedClaims =
      newPartyBasket?.maxClaimsAllowed || DEFAULT_MAX_CLAIMS;

    if (
      !!newPartyBasket?.runningCompletedClaims &&
      newPartyBasket.runningCompletedClaims !==
        oldPartyBasket?.runningCompletedClaims &&
      newPartyBasket.runningCompletedClaims >= maxCompletedClaims &&
      newPartyBasket.status !== PartyBasketStatus.SoldOut
    ) {
      // Make the party basket sold out

      try {
        const partyBasketRef = db
          .collection(Collection.PartyBasket)
          .doc(snap.after.id);

        const updateReq: Partial<PartyBasket> = {
          status: PartyBasketStatus.SoldOut,
        };

        await partyBasketRef.update(updateReq);
      } catch (err) {
        console.error("Error onPartyBasketWrite");
        console.error(err);
      }
    }
  });
// exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
//     .onCreate((snap, context) => {
//       // Grab the current value of what was written to Firestore.
//       const original = snap.data().original;

//       // Access the parameter `{documentId}` with `context.params`
//       functions.logger.log('Uppercasing', context.params.documentId, original);

//       const uppercase = original.toUpperCase();

//       // You must return a Promise when performing asynchronous tasks inside a Functions such as
//       // writing to Firestore.
//       // Setting an 'uppercase' field in Firestore document returns a Promise.
//       return snap.ref.set({uppercase}, {merge: true});
//     });
