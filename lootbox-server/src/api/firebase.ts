import admin from "firebase-admin";

export const app = admin.initializeApp();
export const db = admin.firestore(app);
export const storage = admin.storage(app);
export const auth = admin.auth(app);
