import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import * as _ from "lodash";
import {
  User,
  Tournament,
  UpdateAdvertiserDetailsPayload,
  UpdateConquestPayload,
  Affiliate,
} from "../../graphql/generated/types";
import { AdvertiserID, UserID } from "@wormgraph/helpers";
import { db } from "../firebase";
import {
  Advertiser_Firestore,
  ConquestWithTournaments,
  Conquest_Firestore,
  TournamentPreviewInConquest,
} from "./advertiser.type";
import {
  AffiliateID,
  Collection,
  ConquestID,
  ConquestStatus,
  TournamentID,
  Tournament_Firestore,
  UserIdpID,
} from "@wormgraph/helpers";
import * as moment from "moment";
import { Affiliate_Firestore } from "./affiliate.type";
import { checkIfUserIdpMatchesAdvertiser } from "../identityProvider/firebase";
import { TournamentPreview } from "../../graphql/generated/types";

export const upgradeToAdvertiser = async (
  userIdpID: UserIdpID
): Promise<Advertiser_Firestore | undefined> => {
  console.log(`userIdpID: ${userIdpID}`);
  const existingAdvertiserRef = db
    .collection(Collection.Advertiser)
    .where("userID", "==", userIdpID);
  const existingAdvertisers = await existingAdvertiserRef.get();
  if (!existingAdvertisers.empty) {
    const exad = existingAdvertisers.docs.map((doc) => doc.data())[0];
    throw Error(`User is already an advertiser ${exad.id}`);
  }

  const userRef = db
    .collection(Collection.User)
    .doc(userIdpID) as DocumentReference<User>;
  const userSnapshot = await userRef.get();
  const user = userSnapshot.data() as User;
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc() as DocumentReference<Advertiser_Firestore>;
  const advertiser: Advertiser_Firestore = {
    id: advertiserRef.id as AdvertiserID,
    userID: userIdpID as unknown as UserID,
    userIdpID: userIdpID,
    name: user.username || `New Advertiser ${advertiserRef.id}`,
    description: ``,
    publicContactEmail: "",
    website: "",
    offers: [],
    conquests: [],
    affiliatePartners: [],
    relatedTournaments: [],
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fcompany.png?alt=media&token=b03bd52a-5e08-4ab4-80fa-029b5dfa9267",
  };
  await advertiserRef.set(advertiser);
  return advertiser;
};

export const updateAdvertiserDetails = async (
  advertiserID: AdvertiserID,
  payload: UpdateAdvertiserDetailsPayload,
  userIdpID: UserIdpID
): Promise<Advertiser_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;
  const updatePayload: Partial<Advertiser_Firestore> = {};
  // repeat
  if (payload.name != undefined) {
    updatePayload.name = payload.name;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.avatar != undefined) {
    updatePayload.avatar = payload.avatar;
  }
  if (payload.publicContactEmail != undefined) {
    updatePayload.publicContactEmail = payload.publicContactEmail;
  }
  if (payload.website != undefined) {
    updatePayload.website = payload.website;
  }

  // until done
  await advertiserRef.update(updatePayload);
  return (await advertiserRef.get()).data() as Advertiser_Firestore;
};

export const createConquest = async (
  title: string,
  advertiserID: AdvertiserID
) => {
  const placeholderImageConquest =
    "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2Forange.jpeg?alt=media&token=86a2367a-3fc3-461f-a185-34d6bd0ba31e";
  const conquestRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID)
    .collection(Collection.Conquest)
    .doc();
  const conquest: Conquest_Firestore = {
    id: conquestRef.id as ConquestID,
    title: title || "My Campaign",
    description: "",
    image: placeholderImageConquest,
    startDate: Number(Timestamp.now().toMillis() / 1000),
    endDate: Number(Timestamp.now().toMillis() / 1000 + 60 * 60 * 24 * 90),
    advertiserID: advertiserID,
    status: ConquestStatus.Planned,
    tournaments: [],
  };
  await conquestRef.set(conquest);
  return conquest;
};

export const updateConquest = async (
  conquestID: ConquestID,
  advertiserID: AdvertiserID,
  payload: Omit<UpdateConquestPayload, "id">,
  userIdpID: UserIdpID
): Promise<Conquest_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const conquestRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID)
    .collection(Collection.Conquest)
    .doc(conquestID) as DocumentReference<Conquest_Firestore>;

  const conquestSnapshot = await conquestRef.get();
  if (!conquestSnapshot.exists) {
    throw Error(`Conquest ${conquestID} does not exist`);
  }
  const existingConquest = conquestSnapshot.data();
  if (!existingConquest) {
    throw Error(`Conquest ${conquestID} is undefined`);
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    existingConquest.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }

  const updatePayload: Partial<Conquest_Firestore> = {};
  // update
  if (payload.title != undefined) {
    updatePayload.title = payload.title;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.image != undefined) {
    updatePayload.image = payload.image;
  }
  if (payload.startDate != undefined) {
    updatePayload.startDate = moment(payload.startDate).unix();
  }
  if (payload.endDate != undefined) {
    updatePayload.endDate = moment(payload.endDate).unix();
  }
  if (payload.status != undefined) {
    updatePayload.status = payload.status as ConquestStatus;
  }
  if (payload.tournaments != undefined) {
    updatePayload.tournaments = payload.tournaments as TournamentID[];
  }
  // done
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();

  if (!advertiserSnapshot.exists) {
    throw Error(`Advertiser ${advertiserID} does not exist`);
  }
  const advertiser = advertiserSnapshot.data();
  if (!advertiser) {
    throw Error(`Advertiser ${advertiserID} is undefined`);
  }
  // update
  const toUpdate: Promise<any>[] = [conquestRef.update(updatePayload)];
  if (payload.tournaments != undefined) {
    toUpdate.push(
      updateAdvertiserListOfAssociatedTournaments({
        relatedTournaments: advertiser.relatedTournaments,
        recentConquestTournaments: payload.tournaments as TournamentID[],
        advertiserRef,
      })
    );
    toUpdate.push(
      updateAdvertiserListOfAssociatedAffiliates({
        relatedAffiliates: advertiser.affiliatePartners,
        recentConquestTournaments: payload.tournaments as TournamentID[],
        advertiserRef,
      })
    );
  }
  await Promise.all(toUpdate);

  return (await conquestRef.get()).data() as Conquest_Firestore;
};

export const listConquestPreviews = async (
  advertiserID: AdvertiserID
): Promise<Conquest_Firestore[] | undefined> => {
  const conquestsRef = db
    .collectionGroup(Collection.Conquest)
    .where("advertiserID", "==", advertiserID);

  const conquests = await conquestsRef.get();
  if (conquests.empty) {
    return [];
  } else {
    return conquests.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image,
        startDate: data.startDate,
        endDate: data.endDate,
        advertiserID: data.advertiserID,
        status: data.status,
        tournaments: data.tournaments,
      };
    });
  }
};

export const getConquest = async (
  advertiserID: AdvertiserID,
  conquestID: ConquestID,
  userIdpID: UserIdpID
): Promise<ConquestWithTournaments | undefined> => {
  const placeholderImageTournament =
    "https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
  const conquestRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID)
    .collection(Collection.Conquest)
    .doc(conquestID) as DocumentReference<Conquest_Firestore>;

  const conquestSnapshot = await conquestRef.get();
  const conquestData = conquestSnapshot.data();
  if (!conquestSnapshot.exists || !conquestData) return undefined;

  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    conquestData.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }

  if (conquestData.tournaments && conquestData.tournaments.length > 0) {
    const tournamentsRef = db
      .collection(Collection.Tournament)
      .where("id", "in", conquestData.tournaments) as Query<Tournament>;

    const tournamentSnapshot = await tournamentsRef.get();
    if (tournamentSnapshot.empty) {
      return {
        conquest: conquestData,
        tournaments: [] as TournamentPreviewInConquest[],
      };
    }
    const tournamentsPreviewInConquest = tournamentSnapshot.docs.map((doc) => {
      const data = doc.data();
      const preview: TournamentPreviewInConquest = {
        id: doc.id as TournamentID,
        title: data.title,
        coverPhoto: data.coverPhoto || placeholderImageTournament,
      };
      return preview;
    });
    return {
      conquest: conquestData,
      tournaments: tournamentsPreviewInConquest,
    };
  }
  return {
    conquest: conquestData,
    tournaments: [] as TournamentPreviewInConquest[],
  };
};

export const advertiserAdminView = async (
  userIdpID: UserIdpID
): Promise<Advertiser_Firestore | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .where("userIdpID", "==", userIdpID) as Query<Advertiser_Firestore>;

  const advertiserCollectionItems = await advertiserRef.get();

  if (advertiserCollectionItems.empty) {
    throw Error(`Advertiser with userIdpID ${userIdpID} does not exist`);
  }
  const advertisers = advertiserCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
  if (advertisers && advertisers[0]) {
    return advertisers[0];
  }
};

type PublicAdvertiserView = Omit<
  Advertiser_Firestore,
  | "conquests"
  | "offers"
  | "userID"
  | "relatedTournaments"
  | "affiliatePartners"
  | "userIdpID"
>;
export const advertiserPublicView = async (
  advertiserID: AdvertiserID
): Promise<Omit<PublicAdvertiserView, "publicContactEmail"> | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();
  const adv = advertiserSnapshot.data();

  if (!advertiserSnapshot.exists || !adv) {
    return undefined;
  }
  return {
    id: adv.id,
    name: adv.name,
    description: adv.description,
    avatar: adv.avatar,
    website: adv.website,
  };
};

const updateAdvertiserListOfAssociatedTournaments = async ({
  relatedTournaments,
  recentConquestTournaments,
  advertiserRef,
}: {
  relatedTournaments: TournamentID[];
  recentConquestTournaments: TournamentID[];
  advertiserRef: DocumentReference<Advertiser_Firestore>;
}) => {
  const existingKnownTournaments = relatedTournaments || [];
  const updatedUniqueSetOfKnownTournaments = _.union(
    existingKnownTournaments,
    recentConquestTournaments
  );

  const updatePayload: Partial<Advertiser_Firestore> = {};
  updatePayload.relatedTournaments = updatedUniqueSetOfKnownTournaments;
  await advertiserRef.update(updatePayload);
  return;
};

const updateAdvertiserListOfAssociatedAffiliates = async ({
  relatedAffiliates,
  recentConquestTournaments,
  advertiserRef,
}: {
  relatedAffiliates: AffiliateID[];
  recentConquestTournaments: TournamentID[];
  advertiserRef: DocumentReference<Advertiser_Firestore>;
}) => {
  const tournamentRefs = recentConquestTournaments.map((tid) => {
    const tournamentRef = db
      .collection(Collection.Tournament)
      .doc(tid) as DocumentReference<Tournament_Firestore>;
    return tournamentRef;
  });

  const tournamentSnapshots = await Promise.all(
    tournamentRefs.map((tref) => {
      return tref.get();
    })
  );
  const thisConquestsListOfOrganizerIDs = tournamentSnapshots
    .map((t) => {
      return t.data()?.organizer;
    })
    .filter((o) => o) as AffiliateID[];

  const allExistingKnownAffiliates = relatedAffiliates || [];
  const updatedUniqueSetOfKnownAffiliates = _.union(
    allExistingKnownAffiliates,
    thisConquestsListOfOrganizerIDs
  );

  const updatePayload: Partial<Advertiser_Firestore> = {};
  updatePayload.affiliatePartners = updatedUniqueSetOfKnownAffiliates;
  await advertiserRef.update(updatePayload);
  return;
};

export const listTournamentsOfAdvertiser = async (
  advertiserID: AdvertiserID
): Promise<TournamentPreview[] | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();

  if (!advertiserSnapshot.exists) {
    return undefined;
  }
  const advertiser = advertiserSnapshot.data();
  if (!advertiser) {
    return undefined;
  }

  const tournamentSnapshots = await Promise.all(
    advertiser.relatedTournaments
      .map((tid) => {
        const tournamentRef = db
          .collection(Collection.Tournament)
          .doc(tid) as DocumentReference<Tournament_Firestore>;
        return tournamentRef;
      })
      .map((ref) => {
        return ref.get();
      })
  );
  const tournaments = tournamentSnapshots
    .filter((snap) => snap.exists)
    .map((snap) => {
      return snap.data();
    }) as Tournament_Firestore[];
  const tournamentPreview = tournaments.map((t) => {
    return {
      id: t.id,
      title: t.title,
      coverPhoto: t.coverPhoto,
    };
  });
  return tournamentPreview;
};

export const listPartnersOfAdvertiser = async (
  advertiserID: AdvertiserID
): Promise<Affiliate[] | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();

  if (!advertiserSnapshot.exists) {
    return undefined;
  }
  const advertiser = advertiserSnapshot.data();
  if (!advertiser) {
    return undefined;
  }

  const affiliatesSnapshots = await Promise.all(
    advertiser.affiliatePartners
      .map((aid) => {
        const affiliateRef = db
          .collection(Collection.Affiliate)
          .doc(aid) as DocumentReference<Affiliate_Firestore>;
        return affiliateRef;
      })
      .map((ref) => {
        return ref.get();
      })
  );
  const affiliates = affiliatesSnapshots
    .filter((snap) => snap.exists)
    .map((snap) => {
      return snap.data();
    }) as Affiliate_Firestore[];
  const affiliatePreviews = affiliates.map((a) => {
    return {
      id: a.id,
      userID: a.userID,
      name: a.name,
      avatar: a.avatar,
      website: a.website,
      audienceSize: a.audienceSize,
    };
  });
  return affiliatePreviews;
};

export const getAdvertiser = async (
  advertiserID: AdvertiserID
): Promise<Advertiser_Firestore | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();

  if (!advertiserSnapshot.exists) {
    return undefined;
  }
  return advertiserSnapshot.data();
};
