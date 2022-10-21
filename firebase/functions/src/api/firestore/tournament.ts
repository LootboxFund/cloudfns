import { Collection, TournamentID, Tournament_Firestore } from "@wormgraph/helpers";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { db } from "../firebase";

export const getTournamentByID = async (tournamentID: TournamentID): Promise<Tournament_Firestore | undefined> => {
    const tournamentRef = db
        .collection(Collection.Tournament)
        .doc(tournamentID) as DocumentReference<Tournament_Firestore>;

    const tournamentSnapshot = await tournamentRef.get();

    if (!tournamentSnapshot.exists) {
        return undefined;
    } else {
        return tournamentSnapshot.data() as Tournament_Firestore | undefined;
    }
};

export const incrementTournamentRunningClaims = async (tournamentID: TournamentID): Promise<void> => {
    const tournamentRef = db
        .collection(Collection.Tournament)
        .doc(tournamentID) as DocumentReference<Tournament_Firestore>;

    const updateReq: Partial<Tournament_Firestore> = {
        runningCompletedClaims: FieldValue.increment(1) as unknown as number,
    };

    await tournamentRef.update(updateReq);
};
