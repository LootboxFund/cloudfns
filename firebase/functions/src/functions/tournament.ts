import * as functions from "firebase-functions";
import { logger } from "firebase-functions";
import { Collection, Lootbox_Firestore, Tournament_Firestore, StampMetadata_Firestore } from "@wormgraph/helpers";
import { db } from "../api/firebase";
import { manifest, SecretName } from "../manifest";
import * as lootboxService from "../service/lootbox";
import { retrieveRandomColor } from "./util";

const REGION = manifest.cloudFunctions.region;
const stampSecretName: SecretName = "STAMP_SECRET";
const BATCH_SIZE = 20;

export const onTournamentWrite = functions
    .region(REGION)
    .runWith({
        secrets: [stampSecretName],
    })
    .firestore.document(`/${Collection.Tournament}/{eventID}`)
    .onWrite(async (snap) => {
        const oldTournament = snap.before.data() as Tournament_Firestore | undefined;
        const newTournament = snap.after.data() as Tournament_Firestore | undefined;

        if (!newTournament) {
            // Event deleted...
            return;
        }

        if (!oldTournament) {
            // Tournament created
            return;
        }

        // Lootbox updated
        const shouldUpdateInviteStampV2 = newTournament.title !== oldTournament.title;

        if (shouldUpdateInviteStampV2) {
            logger.info("Updating stamp", {
                tournamentID: newTournament.id,
                newTitle: newTournament.title,
                oldTitle: oldTournament.title,
            });

            // We need to update all of the lootbox stamps & lootbox.stampMetadata
            let lootboxes: Lootbox_Firestore[];

            try {
                // Get all lootboxes
                const lootboxQuery = await db
                    .collection(Collection.Lootbox)
                    .where("tournamentID", "==", newTournament.id)
                    .get();

                lootboxes = lootboxQuery.docs.map((doc) => doc.data() as Lootbox_Firestore);
            } catch (err) {
                console.error("Error fetching lootboxes", err);
                return;
            }

            while (lootboxes.length > 0) {
                const batchedLootboxes = lootboxes.splice(0, BATCH_SIZE);

                try {
                    await Promise.all(
                        batchedLootboxes.map(async (lootbox) => {
                            if (!lootbox.stampMetadata) {
                                // Old ticket design... skip that shit
                                return;
                            }
                            const newMetadata: StampMetadata_Firestore = {
                                ...lootbox.stampMetadata,
                                eventName: newTournament.title ?? null,
                            };
                            return lootboxService.updateCallback(lootbox.id, {
                                backgroundImage: lootbox.backgroundImage,
                                logoImage: lootbox.logo,
                                themeColor: lootbox.themeColor || retrieveRandomColor(),
                                name: lootbox.name,
                                lootboxAddress: lootbox.address,
                                chainIdHex: lootbox.chainIdHex,
                                description: lootbox.description,
                                stampMetadata: newMetadata,
                                // referralURL: `${manifest.microfrontends.webflow.referral}?r=${officialReferral.slug}`,
                                referralURL: lootbox.officialInviteLink || "https://lootbox.tickets",
                                lootboxTicketValue: lootbox.nftBountyValue || "Epic Prizes",
                            });
                        })
                    );
                } catch (err) {
                    console.error("Error updating lootbox stamp");
                }
            }
        }

        return;
    });
