/**
 * This backfills a bunch of stuff if the fields dont already exist....
 * - offer.visibility -> Private
 * - advertiser.visibility -> Private
 * - affiliate.visibility -> Private
 * - tournament.visilbity -> Private
 *
 * Then theres some other stuff that gets backfilled as well
 * - tournament.isPostCosmic -> false
 * - tournament.privacyScope -> []
 * - tournaemnt.runningCompletedClaims -> 0
 * - user.username
 * - user.avatar
 * - user.headshot []
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * WARNING: configuring your project to prod will update prod database if u have the right permissions
 *
 * You might need to temporarily grant your account firestore write permission.
 * In order to use the firebase authentication edit stuff, you will need to download a
 * firebase-admin-SDK key and link it to your account. Make sure to delete it after!
 *
 * I.e. /Users/starship420/Downloads/lootbox-fund-staging-feb043f6bda2.json
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/backfillVisibilityStatus.ts path/to/key.json
 * npx ts-node --script-mode ./src/migrations/backfillVisibilityStatus.ts /Users/starship420/Downloads/lootbox-fund-staging-feb043f6bda2.json
 */

import {
  Collection,
  OfferVisibility_Firestore,
  Offer_Firestore,
  TournamentVisibility_Firestore,
  Tournament_Firestore,
  User_Firestore,
  AdvertiserID,
  AffiliateID,
  UserIdpID,
} from "@wormgraph/helpers";
import { CollectionReference } from "firebase-admin/firestore";
import {
  AdvertiserVisibility_Firestore,
  Advertiser_Firestore,
} from "../api/firestore/advertiser.type";
import {
  AffiliateVisibility_Firestore,
  Affiliate_Firestore,
} from "../api/firestore/affiliate.type";
import {
  getRandomPortraitFromLexicaHardcoded,
  getRandomUserName,
} from "../api/lexica-images";
import admin from "firebase-admin";
import {
  default as adminAuth,
  UpdateRequest as FirebaseUserUpdateRequest,
  UserRecord,
} from "firebase-admin/auth";
import { DocumentReference } from "firebase-admin/firestore";
import {
  ICreateUserRequest,
  IIdentityProvider,
  IIdpUser,
  UpdateUserRequest,
} from "../api/identityProvider/interface";

const pathToCredentials = process.argv[2];

if (!pathToCredentials) {
  console.error("Please provide path to credentials");
  process.exit(1);
}

const serviceKey = require(pathToCredentials);

admin.initializeApp({
  credential: admin.credential.cert(serviceKey),
});
const db = admin.firestore();
const auth = admin.auth();

const convertUserRecordToUser = (userRecord: UserRecord): IIdpUser => {
  return {
    id: userRecord.uid as UserIdpID,
    email: userRecord.email ?? "",
    phoneNumber: userRecord.phoneNumber ?? "",
    isEnabled: !userRecord.disabled,
    username: userRecord.displayName ?? "",
    avatar: userRecord.photoURL ?? "",
    emailVerified: userRecord.emailVerified,
    providerData: userRecord.providerData,
  };
};

class FirebaseIdentityProvider {
  private readonly authInstance: adminAuth.Auth;
  readonly typeName = "firebase";

  constructor(authInstance: adminAuth.Auth) {
    this.authInstance = authInstance;
  }

  async createUser({
    email,
    password,
    phoneNumber,
    emailVerified = false,
    username,
    avatar,
  }: ICreateUserRequest): Promise<IIdpUser> {
    const userRecord = await this.authInstance.createUser({
      email,
      password,
      emailVerified,
      phoneNumber,
      disabled: false,
      displayName: username,
      photoURL: avatar,
    });

    // await this.generateEmailVerificationLink(email);

    return convertUserRecordToUser(userRecord);
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<IIdpUser> {
    const updateRequest: FirebaseUserUpdateRequest = {};
    if (!!request.username) {
      updateRequest.displayName = request.username;
    }
    if (!!request.avatar) {
      updateRequest.photoURL = request.avatar;
    }
    if (!!request.email) {
      updateRequest.email = request.email;
      updateRequest.emailVerified = false;
    }

    const userRecord = await this.authInstance.updateUser(id, updateRequest);

    return convertUserRecordToUser(userRecord);
  }
}

const identityProvider = new FirebaseIdentityProvider(auth);

/**
 * Main function run in this script
 */
const run = async () => {
  await sleep();

  // gets all advertisers
  const _advertisers = await (
    db.collection(
      Collection.Advertiser
    ) as CollectionReference<Advertiser_Firestore>
  ).get();

  const advertisers = _advertisers.docs
    .map((doc) => doc.data())
    .filter((a) => {
      return a.visibility == undefined;
    });

  console.log(`\n\nprocessing advertisers ${advertisers.length}`);

  // BACKFILL ADVERTISERS
  for (let i = 0; i < advertisers.length; i++) {
    const advertiser = advertisers[i];
    const { id, visibility } = advertiser;

    if (visibility == undefined) {
      console.log(`\nUpdating advertiser ( ${i}/${advertisers.length} )`);
      const updateReq: Partial<Advertiser_Firestore> = {
        visibility: AdvertiserVisibility_Firestore.Private,
      };
      await db.collection(Collection.Advertiser).doc(id).update(updateReq);
    }
  }

  await sleep();

  const _affiliates = await (
    db.collection(
      Collection.Affiliate
    ) as CollectionReference<Affiliate_Firestore>
  ).get();

  const affiliates = _affiliates.docs
    .map((doc) => doc.data())
    .filter((f) => f.visibility == undefined);

  console.log(`\n\nprocessing affiliates ${affiliates.length}`);

  // BACKFILL AFFILIATES
  for (let i = 0; i < affiliates.length; i++) {
    const affiliate = affiliates[i];
    const { id, visibility } = affiliate;

    if (visibility == undefined) {
      console.log(`\nUpdating affiliates ( ${i}/${affiliates.length} )`);
      const updateReq: Partial<Affiliate_Firestore> = {
        visibility: AffiliateVisibility_Firestore.Private,
      };
      await db.collection(Collection.Affiliate).doc(id).update(updateReq);
    }
  }

  // BACKFILL OFFERS
  const _offers = await (
    db.collection(Collection.Offer) as CollectionReference<Offer_Firestore>
  ).get();

  const offers = _offers.docs
    .map((doc) => doc.data())
    .filter((f) => f.visibility == undefined);

  console.log(`\n\nprocessing offers ${offers.length}`);

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    const { id, visibility } = offer;

    if (visibility == undefined) {
      console.log(`\nUpdating offers ( ${i}/${offers.length} )`);
      const updateReq: Partial<Offer_Firestore> = {
        visibility: OfferVisibility_Firestore.Private,
      };
      await db.collection(Collection.Offer).doc(id).update(updateReq);
    }
  }

  // BACKFILL TOURNAMENTS
  const _tournaments = await (
    db.collection(
      Collection.Tournament
    ) as CollectionReference<Tournament_Firestore>
  ).get();

  const tournaments = _tournaments.docs
    .map((doc) => doc.data())
    .filter((f) => {
      return (
        f.visibility == undefined ||
        f.isPostCosmic == undefined ||
        f.privacyScope == undefined ||
        f.runningCompletedClaims == undefined
      );
    });

  console.log(`\n\nprocessing tournaments ${tournaments.length}`);

  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    const {
      id,
      visibility,
      isPostCosmic,
      privacyScope,
      runningCompletedClaims,
    } = tournament;

    if (
      visibility == undefined ||
      isPostCosmic == undefined ||
      privacyScope == undefined ||
      runningCompletedClaims == undefined
    ) {
      console.log(`\nUpdating tournaments ( ${i}/${tournaments.length} )`);
      const updateReq: Partial<Tournament_Firestore> = {};

      if (visibility == undefined) {
        updateReq.visibility = TournamentVisibility_Firestore.Private;
      }

      if (isPostCosmic == undefined) {
        updateReq.isPostCosmic = false;
      }

      if (privacyScope == undefined) {
        updateReq.privacyScope = [];
      }

      if (runningCompletedClaims == undefined) {
        updateReq.runningCompletedClaims = 0;
      }

      if (Object.values(updateReq).length > 0) {
        await db.collection(Collection.Tournament).doc(id).update(updateReq);
      }
    }
  }

  const _users = await (
    db.collection(Collection.User) as CollectionReference<User_Firestore>
  ).get();

  const users = _users.docs
    .map((doc) => doc.data())
    .filter((f) => {
      return (
        f.username == undefined ||
        f.headshot == undefined ||
        f.avatar == undefined
      );
    });

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const { id, username, headshot, avatar } = user;

    if (username == undefined || headshot == undefined || avatar == undefined) {
      console.log(`\nUpdating user ( ${i}/${users.length} )`);
      const updateReq: Partial<User_Firestore> = {};

      if (username == undefined) {
        const __username = await getRandomUserName({
          type: "user",
          seedEmail: user?.email || undefined,
        });
        console.log("generated user name", __username);
        updateReq.username = __username;
      }

      if (headshot == undefined) {
        updateReq.headshot = [];
      }

      if (avatar == undefined) {
        const __avatar = await getRandomPortraitFromLexicaHardcoded();
        console.log("generated avatar", __avatar);
        updateReq.avatar = __avatar;
      }

      if (Object.values(updateReq).length > 0) {
        // Updates the firestore user
        console.log("updating user database....");
        await db.collection(Collection.User).doc(id).update(updateReq);

        const shouldUpdateIDP = updateReq.avatar || updateReq.username;
        if (shouldUpdateIDP) {
          console.log(`updating user IDP...`);
          await identityProvider.updateUser(id, {
            ...(updateReq.username && { username: updateReq.username }),
            ...(updateReq.avatar && { avatar: updateReq.avatar }),
          });
        }
      }
    }
  }

  console.log("\n\nDONEZO!!!!!!!");
};

const sleep = async (ms: number = 4000) => {
  // Just to confirm output above in terminal
  await new Promise((res) => {
    setTimeout(res, ms);
  });

  return;
};

run().catch(console.error);
