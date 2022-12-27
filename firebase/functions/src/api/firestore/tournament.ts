import { Collection, TournamentID, Tournament_Firestore } from "@wormgraph/helpers";
import { DocumentReference } from "firebase-admin/firestore";
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
