/**
 * Migration script to copy claims from old party baskets to new cosmic lootboxes
 * BEFORE RUNNING THIS SCRIPT:
 * 1. Add the party basket IDs with their corresponding lootbox IDs in the _scriptData object below
 *
 * What it does:
 * - Gets all claims for a party basket
 * - loops through claims...
 *      - Recreates the referral if it hasent done so already (this is a new postCosmic referral)
 *      - Creates a new claim for the new LOOTBOX under the new referral
 * - Repeats for all party basket <> lootbox pairs
 *
 * CAVEATS
 * - we skip reward claims, because those will automatically be created in the onClaimWrite function
 * - the onClaimWrite function will increment the claim counts on the lootbox AND create whitelists for the user
 *   if they have a wallet (see @cloudfns/firestore/functions/index.ts > onClaimWrite)
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/cabanatuanCityMigrationScript.ts staging
 *
 * [env]    `prod` | `staging`
 */
import * as admin from "firebase-admin";
import {
  ClaimID,
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  Collection,
  LootboxID,
  PartyBasketID,
  ReferralID,
  ReferralSlug,
  Referral_Firestore,
} from "@wormgraph/helpers";
import { getLootbox, getPartyBasketById } from "../api/firestore";
import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import { nanoid } from "nanoid";

interface Config {
  mappings: { partyBasketID: PartyBasketID; lootboxID: LootboxID }[];
}

interface ReferralBackfilled_Firestore extends Referral_Firestore {
  __isBackfilled: true;
  __backfilledAt: number;
  __originalReferralID: ReferralID;
}

interface ClaimBackfilled_Firestore extends Claim_Firestore {
  __isBackfilled: true;
  __backfilledAt: number;
  __originalClaimID: ClaimID;
  __originalReferralID: ReferralID;
}

const _scriptData: { prod: Config; staging: Config } = {
  prod: {
    // FILL THIS IN
    mappings: [],
  },
  staging: {
    mappings: [],
  },
};

const sleep = async (ms: number = 3000) => {
  // Just to confirm output above in terminal
  await new Promise((res) => {
    setTimeout(res, ms);
  });
  return;
};

const run = async () => {
  const env = process.argv[2];

  if (!env) {
    throw new Error("Environment specified");
  }

  const config = _scriptData[env] as Config;

  if (!config) {
    throw new Error(`No config for env: ${env}`);
  }

  console.log(`
   
       Running migration script...
           Environment: ${env}
           Processing: ${config.mappings.length} mappings

    `);

  await sleep();

  for (let { partyBasketID, lootboxID } of config.mappings) {
    console.log(
      "\n\nMigrating Claims for Party Basket: ",
      partyBasketID,
      " to Lootbox: ",
      lootboxID,
      "\n\n"
    );

    const lootbox = await getLootbox(lootboxID);
    const partyBasket = await getPartyBasketById(partyBasketID);

    if (!lootbox) {
      throw new Error(`No lootbox found for ID: ${lootboxID}`);
    }
    if (!partyBasket) {
      throw new Error(`No party basket found for ID: ${partyBasketID}`);
    }

    console.log(`
    
        Processing...

        Lootbox:     
        - ID        ${lootboxID}
        - Address   ${lootbox.address}

        PartyBasket: 
        
        - ID        ${partyBasketID}
        - Address   ${partyBasket?.address}

    `);

    // Track in memory which referrals we've already created
    type OldReferralID = string & {
      readonly _: unique symbol;
    };
    type NewReferralID = string & {
      readonly _: unique symbol;
    };
    const originalReferrals: { [key: OldReferralID]: Referral_Firestore } = {};
    // NOTE: there is a 1:1 mapping between old referral and new referral
    //       so we index new referrals via the old referral ID in memory
    const createdReferrals: {
      [key: string | OldReferralID]: ReferralBackfilled_Firestore;
    } = {};

    const collectionGroupRef = admin
      .firestore()
      .collectionGroup(Collection.Claim)
      .where("chosenPartyBasketId", "==", partyBasketID)
      .where(
        "status",
        "==",
        ClaimStatus_Firestore.complete
      ) as Query<Claim_Firestore>;

    const claimsSnaps = await collectionGroupRef.get();
    const claims = claimsSnaps.docs.map((doc) => doc.data());
    for (let originalClaim of claims) {
      if (originalClaim.type === ClaimType_Firestore.reward) {
        // SKIP REWARD CLAIMS because they get created async in the onClaimWrite function
        console.log("Skipping reward claim: ", originalClaim.id);
        continue;
      }

      // Create a duplicated referral for the new lootbox
      if (!createdReferrals[originalClaim.referralId]) {
        // Make sure there is not already a duped referral. Here we use the migration type ReferralBackfilled_Firestore
        console.log("Checking for existing duplicated referral...");
        const existingDuplicatedReferralRef = admin
          .firestore()
          .collection(Collection.Referral)
          .where(
            "__originalReferralID",
            "==",
            originalClaim.referralId
          ) as Query<ReferralBackfilled_Firestore>;
        const existingDuplicatedReferralSnaps =
          await existingDuplicatedReferralRef.get();
        const existingDuplicatedReferral =
          existingDuplicatedReferralSnaps.docs[0]?.data();

        if (!existingDuplicatedReferral) {
          // Create the new referral...

          // We need to look up the old referral first
          if (!originalReferrals[originalClaim.referralId]) {
            console.log(
              "fetching original referral for... Referal ID: ",
              originalClaim.referralId
            );

            // Get original Referral
            const originalReferralRef = admin
              .firestore()
              .collection(Collection.Referral)
              .doc(
                originalClaim.referralId
              ) as DocumentReference<Referral_Firestore>;

            const originalReferralSnap = await originalReferralRef.get();
            const originalReferral = originalReferralSnap.data();
            if (!originalReferral) {
              console.log(`

                        No original referral found

                        Referral ID: ${originalClaim.referralId}
                        Claim ID: ${originalClaim.id}

                    `);
              throw new Error("Referral NOT FOUND");
            }
            originalReferrals[originalClaim.referralId] = originalReferral;
          }

          const originalReferral = originalReferrals[originalClaim.referralId];

          // ######## CREATE THE NEW REFERRAL ########

          const newReferralRef = admin
            .firestore()
            .collection(Collection.Referral)
            .doc() as DocumentReference<ReferralBackfilled_Firestore>;

          const newSlug = nanoid(10) as ReferralSlug;

          // Duplicate the referral in the database
          // FIELDS THAT WILL CHANGE:
          // - id
          // - slug
          // - isPostCosmic -> true
          // - seedPartyBasketId will be ommited because it is not required in cosmic flow
          // - seedLootboxID will be ommited also because it is not really relavent
          const newReferralDocument: ReferralBackfilled_Firestore = {
            id: newReferralRef.id as ReferralID,
            referrerId: originalReferral.referrerId,
            creatorId: originalReferral.creatorId,
            slug: newSlug,
            tournamentId: originalReferral.tournamentId,
            campaignName: originalReferral.campaignName,
            nConversions: originalReferral.nConversions,
            type: originalReferral.type,
            isPostCosmic: true,
            timestamps: originalReferral.timestamps,

            // Backfill fields
            __isBackfilled: true,
            __backfilledAt: Timestamp.now().toMillis(),
            __originalReferralID: originalReferral.id,
          };

          await newReferralRef.set(newReferralDocument);
          // RECALL: new referrals are still indexed VIA old referral ID in memory
          createdReferrals[originalReferral.id as unknown as OldReferralID] =
            newReferralDocument;
        } else {
          createdReferrals[
            originalClaim.referralId as unknown as OldReferralID
          ] = existingDuplicatedReferral;
        }
      }

      const newReferral = createdReferrals[originalClaim.referralId];

      // NOW WE CAN DUPLICATE THE CLAIM

      // First, make sure we havent already made this claim via the backfilled property __originalClaimID
      console.log(
        "looking up duplicated claim for old claimID ",
        originalClaim.id
      );
      const existingDuplicatedClaimRef = admin
        .firestore()
        .collection(Collection.Referral)
        .doc(newReferral.id)
        .collection(Collection.Claim)
        .where(
          "__originalClaimID",
          "==",
          originalClaim.id
        ) as Query<ClaimBackfilled_Firestore>;

      const existingDuplicatedClaimSnaps =
        await existingDuplicatedClaimRef.get();
      const existingDuplicatedClaim =
        existingDuplicatedClaimSnaps.docs[0]?.data();

      if (!existingDuplicatedClaim) {
        // Create the new claim...

        // ######## CREATE THE NEW CLAIM ########

        const newClaimRef = admin
          .firestore()
          .collection(Collection.Referral)
          .doc(newReferral.id)
          .collection(Collection.Claim)
          .doc();

        // THINGS THAT CHANGE IN THE NEW CLAIM
        // - id
        // - referralId  ->  will become the new referral ID
        // - referralSlug -> will become the new referral slug
        // - originLootboxId -> will be ommited
        // - lootboxID -> will be the NEW lootbox ID
        // - lootboxAddress -> will be the NEW lootbox address
        // - lootboxName -> will be the NEW lootbox name
        // - lootboxNFTBountyValue -> will be the NEW lootbox bounty value
        // - lootboxMaxTickets -> will be the NEW lootbox max tickets
        // - whitelistID -> null because these are fresh babes
        // - rewardFromClaim is ommited because we are not creating reward claims...
        // - rewardFromFriendReferred ommited same reason as above
        // - isPostCosmic -> true
        // - all party basket things will be ommited
        const newClaimBody: ClaimBackfilled_Firestore = {
          id: newClaimRef.id as ClaimID,
          referralId: newReferral.id, // NEW
          referrerId: originalClaim.referrerId, // NEW
          referralCampaignName: originalClaim.referralCampaignName,
          referralSlug: newReferral.slug, // NEW
          referralType: originalClaim.referralType,
          tournamentId: originalClaim.tournamentId,
          tournamentName: originalClaim.tournamentName,
          lootboxID: lootbox.id,
          lootboxAddress: lootbox.address,
          lootboxName: lootbox.name,
          whitelistId: null,
          ticketWeb3ID: null,
          ticketID: null,
          isPostCosmic: true,
          claimerUserId: originalClaim.claimerUserId,
          status: originalClaim.status,
          type: originalClaim.type,
          timestamps: originalClaim.timestamps,
          // Add the backfill fields
          __isBackfilled: true,
          __backfilledAt: Timestamp.now().toMillis(),
          __originalClaimID: originalClaim.id,
          __originalReferralID: originalClaim.referralId,
        };

        // Add optional fields
        if (lootbox.nftBountyValue) {
          newClaimBody.lootboxNFTBountyValue = lootbox.nftBountyValue;
        }
        if (lootbox.maxTickets) {
          newClaimBody.lootboxMaxTickets = lootbox.maxTickets;
        }

        console.log(`

            Creating the new claim

            New Claim ID: ${newClaimBody.id}
            New Referral ID: ${newReferral.id}

            Old Claim ID: ${originalClaim.id}
            Old Referral ID: ${originalClaim.referralId}

        `);

        await newClaimRef.set(newClaimBody);
      } else {
        // We've already made this claim...
        console.log(
          "Claim has already been made... ",
          existingDuplicatedClaim.id,
          "Skipping..."
        );
        continue;
      }
    }
  }
};

run().catch(console.error);
