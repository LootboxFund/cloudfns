import * as admin from "firebase-admin";
import { getFunctions } from "firebase-admin/functions";
import { Storage } from "@google-cloud/storage";

export const app = admin.initializeApp();
export const db = admin.firestore(app);
db.settings({ ignoreUndefinedProperties: true });
export const fun = getFunctions(app);
export const gcs = new Storage();
