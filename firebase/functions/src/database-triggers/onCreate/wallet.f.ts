import { EventContext } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { error } from "firebase-functions/lib/logger";
import { firestore } from "firebase-functions";
import { Collection, indexWalletOnCreate } from "../../api/firestore";
import { Wallet } from "../../api/graphql/generated/types";

const onCreateWallet = firestore
  .document(`${Collection.Wallet}/{walletId}`)
  .onCreate(async (snap: QueryDocumentSnapshot, context: EventContext) => {
    const wallet = (snap.data() as Wallet) || undefined;

    if (!wallet) {
      error(`Wallet onCreate: No data in snapshot`);
      return;
    }

    try {
      await indexWalletOnCreate(wallet);
    } catch (err) {
      error(err);
    }

    return;
  });

export default onCreateWallet;
