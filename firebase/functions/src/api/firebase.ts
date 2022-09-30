import * as admin from "firebase-admin";
import { getFunctions } from "firebase-admin/functions";

export const app = admin.initializeApp();
export const db = admin.firestore(app);
export const fun = getFunctions(app);
