// import { DocumentReference } from "firebase-admin/firestore";
// import { Ad, Creative } from "../../graphql/generated/types";
// import { AdID, CreativeID } from "../../lib/types";
// import { db } from "../firebase";
// import { Collection } from "./collection.types";

// export const getCreativeById = async (
//   creativeId: CreativeID
// ): Promise<Creative | undefined> => {
//   const creativeRef = db
//     .collection(Collection.Creative)
//     .doc(creativeId) as DocumentReference<Creative>;
//   const data = await creativeRef.get();
//   if (data.exists) {
//     return data.data();
//   } else {
//     return undefined;
//   }
// };
