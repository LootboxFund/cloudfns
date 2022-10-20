/**
 * Migration script to copy claims from old party baskets to new cosmic lootboxes
 * BEFORE RUNNING THIS SCRIPT:
 * 1. Create a new post cosmic tournament VIA antd host repo
 * 2. Create new lootboxes for each winning party basket in the new tournament
 * 3. Add the newTournamentID & the lootbox IDs from the previous steps into _scriptData object below
 *
 * What it does:
 * - Gets all claims for a party basket
 * - loops through claims...
 *      - Recreates the referral if it hasent done so already (this is a new postCosmic referral)
 *      - Creates a new claim for the new LOOTBOX under the new referral
 * - Repeats for all party basket <> lootbox pairs
 *
 * CAVEATS
 * - You need to manually create a new tournament + lootboxes before running the script
 *      - Also, you have to add this info in the _scriptData object below
 * - we SKIP "reward claims", because those will automatically be created in the onClaimWrite function in firebase functions
 *      - the onClaimWrite function (called automatically in the backend) will increment the claim counts on the lootbox
 *        and create whitelists for the user if they have a wallet (see @cloudfns/firestore/functions/index.ts > onClaimWrite)
 * - we extend the Claim_Firestore & Referral_Firestore interfaces to include new migration backfill fields.
 *   for ex. claim documents will store extra field __originalClaimID
 * - reward claims DO NOT HAVE backfilled fields [WARNING!!!!] - if we need to delete all of our claims we made,
 *   we will just have to delete everything inside of a backfilled referral without relying on claim.__originalClaimID since reward claims dont have it
 *
 *
 * You'll have to authenticate with before running the script:
 * You might need to temporarily grant your account firestore write permission.
 *
 * > $ gcloud auth application-default login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * to run:
 * > npx ts-node --script-mode ./src/migrations/cabanatuanCityMigrationScript.ts staging
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
  TournamentID,
} from "@wormgraph/helpers";
import {
  getLootbox,
  getPartyBasketById,
  getTournamentById,
} from "../api/firestore";
import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import { nanoid } from "nanoid";

// CONFIG:
// We add pairs of {partyBasketID, newLootboxID}, where
// - partyBasketID === the OLD party basket we need to duplicate claims for
// - newLootboxID     === the NEW cosmic lootbox we need to create the claims for from the old party basket
interface Config {
  newTournamentID: TournamentID;
  mappings: { partyBasketID: PartyBasketID; newLootboxID: LootboxID }[];
}

// Create new referral of this type, these extra fields are ONLY meant to be used by this script.
// DO NOT RELY ON THESE FIELDS IN THE APP
interface ReferralBackfilled_Firestore extends Referral_Firestore {
  __isBackfilled: true;
  __backfilledAt: number;
  __originalReferralID: ReferralID;
}

// Create new claim of this type, these extra fields are ONLY meant to be used by this script.
// DO NOT RELY ON THESE FIELDS IN THE APP
interface ClaimBackfilled_Firestore extends Claim_Firestore {
  __isBackfilled: true;
  __backfilledAt: number;
  __originalClaimID: ClaimID;
  __originalReferralID: ReferralID;
}

const _scriptData: { prod: Config; staging: Config } = {
  // FILL THIS IN
  prod: {
    newTournamentID: "_________" as TournamentID,
    mappings: [],
  },
  staging: {
    newTournamentID: "AVkMS8PZAJ6uiTgVp1wP" as TournamentID,
    mappings: [
      {
        // Test DEATH party basket / lootbox
        partyBasketID: "KBj26PwCjEWBpU7Qa9pp" as PartyBasketID,
        newLootboxID: "36sumZXYBkirQI0JmEb7" as LootboxID,
      },
    ],
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

  if (!config.newTournamentID) {
    throw new Error(`No newTournamentID specified for env: ${env}`);
  }

  console.log(`
   
       Running migration script...
           Environment: ${env}
           Processing: ${config.mappings.length} mappings

    `);

  await sleep();

  console.log('fetching tournament for ID "' + config.newTournamentID + '"');
  const tournament = await getTournamentById(config.newTournamentID);

  if (!tournament) {
    throw new Error(`No tournament found for ID: ${config.newTournamentID}`);
  }

  console.log('found tournament "' + tournament.title + '"');

  await sleep();
  let cumSum = 0;
  for (let { partyBasketID, newLootboxID } of config.mappings) {
    console.log(
      "\n\nMigrating Claims for Party Basket: ",
      partyBasketID,
      " to Lootbox: ",
      newLootboxID,
      "\n\n"
    );

    const lootbox = await getLootbox(newLootboxID);
    const partyBasket = await getPartyBasketById(partyBasketID);

    if (!lootbox) {
      throw new Error(`No lootbox found for ID: ${newLootboxID}`);
    }
    if (!partyBasket) {
      throw new Error(`No party basket found for ID: ${partyBasketID}`);
    }

    console.log(`
    
        Processing...

        Lootbox:     
        - ID        ${newLootboxID}
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
    // const claims = claimsSnaps.docs.map((doc) => doc.data());
    const nonRewardClaims = claimsSnaps.docs
      .map((doc) => doc.data())
      .filter((claimData) => {
        const willSkip = claimData.type === ClaimType_Firestore.reward;
        if (willSkip) {
          console.log(
            'Skipping "reward claim" for claim: ',
            `/referral/${claimData.referralId}/claim/${claimData.id}`
          );
        }
        return !willSkip;
      });
    console.log(
      "\nFound Claims to Process (non-reward): ",
      nonRewardClaims.length,
      ". For Party Basket: ",
      partyBasket.name,
      "\n"
    );

    await sleep();

    for (let originalClaim of nonRewardClaims) {
      if (originalClaim.type === ClaimType_Firestore.reward) {
        // SKIP REWARD CLAIMS because they get created async in the onClaimWrite function
        console.log("Skipping reward claim: ", originalClaim.id);
        continue;
      }
      cumSum++;
      console.log(`

            Processing claim #${cumSum} for Party Basket: ${partyBasket.name}
        
        `);
      try {
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

            const originalReferral =
              originalReferrals[originalClaim.referralId];

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
            // - tournamentId will be the NEW tournament that has been manually created
            const newReferralDocument: ReferralBackfilled_Firestore = {
              id: newReferralRef.id as ReferralID,
              referrerId: originalReferral.referrerId,
              creatorId: originalReferral.creatorId,
              slug: newSlug,
              tournamentId: tournament.id,
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

            console.log(`
        
                    Creating new referral...
        
                    Original Referral ID: ${originalReferral.id}
                    New Referral ID:      ${newReferralRef.id}
                            
                  
                  `);

            await newReferralRef.set(newReferralDocument);

            console.log(
              "\ncreated referral: ",
              `/referral/${newReferralRef.id}\n`
            );
            // RECALL: new referrals are still indexed VIA old referral ID in memory
            createdReferrals[originalReferral.id as unknown as OldReferralID] =
              newReferralDocument;
          } else {
            console.log(
              `Referral has already been made...  ${existingDuplicatedReferral.id} Skipping referral creation...`
            );
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
          // - newLootboxID -> will be the NEW lootbox ID
          // - lootboxAddress -> will be the NEW lootbox address
          // - lootboxName -> will be the NEW lootbox name
          // - lootboxNFTBountyValue -> will be the NEW lootbox bounty value
          // - lootboxMaxTickets -> will be the NEW lootbox max tickets
          // - whitelistID -> null because these are fresh babes
          // - rewardFromClaim is ommited because we are not creating reward claims...
          // - rewardFromFriendReferred ommited same reason as above
          // - isPostCosmic -> true
          // - all party basket things will be ommited
          // - tournamentId -> will be the NEW tournament ID
          // - tournamentName -> will be the NEW tournament name
          const newClaimBody: ClaimBackfilled_Firestore = {
            id: newClaimRef.id as ClaimID,
            referralId: newReferral.id, // NEW
            referrerId: originalClaim.referrerId, // NEW
            referralCampaignName: originalClaim.referralCampaignName,
            referralSlug: newReferral.slug, // NEW
            referralType: originalClaim.referralType,
            tournamentId: tournament.id,
            tournamentName: tournament.title,
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

          console.log(
            "\ncreated claim: ",
            `/referral/${newClaimBody.referralId}/claim/${newClaimBody.id}\n`
          );
        } else {
          // We've already made this claim...
          console.log(
            "Claim has already been made... ",
            existingDuplicatedClaim.id,
            "Skipping..."
          );
          continue;
        }
      } catch (err) {
        console.log(
          "AN ERROR OCCURED PROCESSING CLAIM: ",
          `/referral/${originalClaim.referralId}/claim/${originalClaim.id}`,
          err
        );
        console.error(err);
        continue;
      }
    }
  }
};

run().catch(console.error);
