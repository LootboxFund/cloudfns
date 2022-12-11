import {
  ActivationID,
  ActivationPricingID,
  AdTargetTag,
  AdvertiserID,
  AffiliateID,
  AffiliateType,
  Collection,
  Currency,
  MeasurementPartnerType,
  OfferID,
  OfferStatus,
  UserID,
  ActivationStatus,
  Activation_Firestore,
  Offer_Firestore,
  UserIdpID,
  OfferStrategy,
  QuestionFieldType,
  QuestionAnswer_Firestore,
  QuestionAnswerID,
  QuestionAnswerStatus,
  LootboxID,
  TournamentID,
  ClaimID,
} from "@wormgraph/helpers";
import { v4 as uuidv4 } from "uuid";
import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  AdSetPreview,
  AnswerAirdropQuestionPayload,
  CreateOfferPayload,
  CreateOfferResponse,
  EditActivationInput,
  EditOfferPayload,
  OfferAffiliateView,
  OfferAirdropMetadata,
  OfferStrategyType,
  QuestionAnswerPreview,
  User,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import {
  CreateActivationInput,
  Offer,
  OrganizerOfferWhitelistStatus,
} from "../../graphql/generated/types";
import {
  CreateActivationPayload,
  ClaimRedemptionStatus,
} from "../../graphql/generated/types";
import { OfferPreview, OfferPreviewForOrganizer } from "./offer.type";
import * as moment from "moment";
import * as _ from "lodash";
import { checkIfUserIdpMatchesAdvertiser } from "../identityProvider/firebase";
import { AdSet_Firestore } from "./ad.types";
import { OrganizerOfferWhitelist_Firestore } from "./affiliate.type";
import { getAdvertiser } from "./advertiser";
import { Advertiser_Firestore } from "./advertiser.type";
import { getRandomAdOfferCoverFromLexicaHardcoded } from "../lexica-images";
import { getLootbox } from "./lootbox";
import { updateClaimRedemptionStatus } from "./referral";

export const createOffer = async (
  advertiserID: AdvertiserID,
  payload: Omit<CreateOfferPayload, "id">
): Promise<Offer_Firestore> => {
  const placeholderImageOffer =
    await getRandomAdOfferCoverFromLexicaHardcoded();
  // const userRef = db
  //   .collection(Collection.User)
  //   .doc(userID) as DocumentReference<User>;
  // const userSnapshot = await userRef.get();
  // const user = userSnapshot.data() as User;
  const offerRef = db
    .collection(Collection.Offer)
    .doc() as DocumentReference<Offer_Firestore>;
  const offer: Offer_Firestore = {
    id: offerRef.id as OfferID,
    title: payload.title,
    description: payload.description || "",
    image: payload.image || placeholderImageOffer,
    advertiserID: payload.advertiserID as AdvertiserID,
    spentBudget: 0,
    maxBudget: payload.maxBudget || 1000,
    // currency: Currency.Usd, // payload.currency || Currency.Usd,
    startDate: payload.startDate
      ? moment(payload.startDate).unix()
      : new Date().getTime() / 1000,
    endDate: payload.endDate
      ? moment(payload.endDate).unix()
      : (new Date().getTime() + 60 * 60 * 24 * 365) / 1000,
    status: (payload.status || "Active") as OfferStatus,
    affiliateBaseLink: payload.affiliateBaseLink || "",
    mmp: (payload.mmp || "Manual") as MeasurementPartnerType,
    adSets: [],
    strategy: (payload.strategy || OfferStrategy.None) as OfferStrategy,
    //targetingTags: [], // payload.targetingTags as AdTargetTag[],
  };
  if (payload.airdropMetadata) {
    const questions = await Promise.all(
      payload.airdropMetadata.questions.map((q, i) => {
        return createQuestion(
          {
            question: q.question,
            type: q.type as QuestionFieldType,
            offerID: offerRef.id as OfferID,
            advertiserID: payload.advertiserID as AdvertiserID,
          },
          i
        );
      })
    );
    const lootbox = await getLootbox(
      payload.airdropMetadata.lootboxTemplateID as LootboxID
    );
    if (!lootbox) {
      throw Error(
        `No Lootbox with ID=${payload.airdropMetadata.lootboxTemplateID} found!`
      );
    }
    offer.airdropMetadata = {
      offerID: offerRef.id as OfferID,
      title: payload.title,
      oneLiner: payload.airdropMetadata.oneLiner || "",
      value: payload.airdropMetadata.value || "",
      instructionsLink: payload.airdropMetadata.instructionsLink || "",
      instructionsCallToAction:
        payload.airdropMetadata.instructionsCallToAction || "",
      callToActionLink: payload.airdropMetadata.callToActionLink || "",
      advertiserID: payload.advertiserID as AdvertiserID,
      questions: questions.map((q) => q.id) || [],
      excludedOffers: payload.airdropMetadata.excludedOffers as OfferID[],
      batchCount: 0,
      lootboxTemplateID: payload.airdropMetadata.lootboxTemplateID as LootboxID,
      lootboxTemplateStamp: lootbox.stampImage,
    };
    offer.image = lootbox.stampImage;
  }
  await offerRef.set(offer);
  return offer;
};

export const editOffer = async (
  id: OfferID,
  payload: Omit<EditOfferPayload, "id">,
  userIdpID: UserIdpID
): Promise<Offer_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const offerRef = db
    .collection(Collection.Offer)
    .doc(id) as DocumentReference<Offer_Firestore>;

  const offerSnapshot = await offerRef.get();
  if (!offerSnapshot.exists) {
    throw new Error(`No offer found with ID ${id}`);
  }
  const existingOffer = offerSnapshot.data();
  if (!existingOffer) {
    throw new Error(`Offer ID ${id} is undefined`);
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    existingOffer.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }
  //
  const updatePayload: Partial<Offer_Firestore> = {};
  // repeat
  if (payload.title != undefined) {
    updatePayload.title = payload.title;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.image != undefined) {
    updatePayload.image = payload.image;
  }
  if (payload.maxBudget != undefined) {
    updatePayload.maxBudget = payload.maxBudget;
  }
  if (payload.startDate != undefined) {
    updatePayload.startDate = moment(payload.startDate).unix();
  }
  if (payload.endDate != undefined) {
    updatePayload.endDate = moment(payload.endDate).unix();
  }
  if (payload.status != undefined) {
    updatePayload.status = (payload.status || "Planned") as OfferStatus;
  }
  if (payload.airdropMetadata && existingOffer.airdropMetadata) {
    updatePayload.airdropMetadata = existingOffer.airdropMetadata;
    if (payload.airdropMetadata.excludedOffers) {
      updatePayload.airdropMetadata.excludedOffers = payload.airdropMetadata
        .excludedOffers as OfferID[];
    }
    if (payload.airdropMetadata.instructionsLink) {
      updatePayload.airdropMetadata.instructionsLink =
        payload.airdropMetadata.instructionsLink;
    }
    if (payload.airdropMetadata.oneLiner) {
      updatePayload.airdropMetadata.oneLiner = payload.airdropMetadata.oneLiner;
    }
    if (payload.airdropMetadata.value) {
      updatePayload.airdropMetadata.value = payload.airdropMetadata.value;
    }
    if (payload.airdropMetadata.instructionsCallToAction) {
      updatePayload.airdropMetadata.instructionsCallToAction =
        payload.airdropMetadata.instructionsCallToAction;
    }
    if (payload.airdropMetadata.callToActionLink) {
      updatePayload.airdropMetadata.callToActionLink =
        payload.airdropMetadata.callToActionLink;
    }
    await Promise.all([
      ...(payload.airdropMetadata.activeQuestions || []).map((q) =>
        updateQuestionStatus(q as QuestionAnswerID, QuestionAnswerStatus.Active)
      ),
      ...(payload.airdropMetadata.inactiveQuestions || []).map((q) =>
        updateQuestionStatus(
          q as QuestionAnswerID,
          QuestionAnswerStatus.Inactive
        )
      ),
      // ...payload.airdropMetadata.newQuestions.map((q) =>
      //   createQuestion({
      //     question: q.question,
      //     type: q.type,
      //     offerID: offerRef.id as OfferID,
      //     advertiserID: payload.advertiserID as AdvertiserID,
      //   })
      // ),
    ]);
  }
  // if (payload.targetingTags != undefined) {
  //updatePayload.targetingTags = []; //payload.targetingTags as AdTargetTag[];
  // }
  // done
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
};

export const updateOfferBatchCount = async (id: OfferID) => {
  const offerRef = db
    .collection(Collection.Offer)
    .doc(id) as DocumentReference<Offer_Firestore>;

  const offerSnapshot = await offerRef.get();
  if (!offerSnapshot.exists) {
    throw new Error(`No offer found with ID ${id}`);
  }
  const existingOffer = offerSnapshot.data();
  if (!existingOffer) {
    throw new Error(`Offer ID ${id} is undefined`);
  }
  //
  const updatePayload: Partial<Offer_Firestore> = {};
  // repeat
  if (existingOffer.airdropMetadata) {
    updatePayload.airdropMetadata = {
      ...existingOffer.airdropMetadata,
      batchCount: existingOffer.airdropMetadata.batchCount + 1,
    };
  }
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
};

// add activations to offer
export const createActivation = async (
  id: OfferID,
  payload: CreateActivationInput,
  userIdpID: UserIdpID
): Promise<Activation_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const offerRef = db
    .collection(Collection.Offer)
    .doc(payload.offerID) as DocumentReference<Offer_Firestore>;

  const offerSnapshot = await offerRef.get();
  if (!offerSnapshot.exists) {
    throw new Error(`No offer found with ID ${payload.offerID}`);
  }
  const existingOffer = offerSnapshot.data();
  if (!existingOffer) {
    throw new Error(`Offer ID ${payload.offerID} is undefined`);
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    existingOffer.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }

  const activationRef = db
    .collection(Collection.Activation)
    .doc() as DocumentReference<Activation_Firestore>;
  const obj: Activation_Firestore = {
    id: activationRef.id as ActivationID,
    name: payload.name,
    description: payload.description || "",
    pricing: payload.pricing,
    status: payload.status,
    mmp: payload.mmp,
    mmpAlias: payload.mmpAlias,
    offerID: payload.offerID as OfferID,
    order: payload.order || 9,
    advertiserID: existingOffer.advertiserID,
  };

  try {
    await activationRef.set(obj);

    return obj;
  } catch (e) {
    console.log(e);
    throw new Error("Error creating activation");
  }
};

// warning! updates entire activations array, which means that it will overwrite existing activations
export const editActivation = async (
  id: ActivationID,
  payload: EditActivationInput,
  userIdpID: UserIdpID
): Promise<Activation_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }

  const activationRef = db
    .collection(Collection.Activation)
    .doc(id) as DocumentReference<Activation_Firestore>;
  const activationSnap = await activationRef.get();

  if (!activationSnap.exists) {
    return undefined;
  }

  const existingObj = activationSnap.data();
  if (existingObj === undefined) {
    return undefined;
  }

  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    existingObj.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }

  const actInput = payload;
  const updatePayload: Partial<Activation_Firestore> = {};
  if (actInput && actInput.name) {
    updatePayload.name = actInput.name;
  }
  if (actInput && actInput.description) {
    updatePayload.description = actInput.description;
  }
  if (actInput && actInput.pricing) {
    updatePayload.pricing = actInput.pricing;
  }
  if (actInput && actInput.status) {
    updatePayload.status = actInput.status as ActivationStatus;
  }
  if (actInput && actInput.order) {
    updatePayload.order = actInput.order;
  }

  await activationRef.update(updatePayload);

  const updatedActivationSnap = await activationRef.get();

  return updatedActivationSnap.data() as Activation_Firestore;
};

//
export const listCreatedOffers = async (
  advertiserID: AdvertiserID
): Promise<OfferPreview[] | undefined> => {
  const offerRef = db
    .collection(Collection.Offer)
    .where("advertiserID", "==", advertiserID) as Query<Offer_Firestore>;

  const offersSnapshot = await offerRef.get();

  if (offersSnapshot.empty) {
    return [];
  }
  const offerPreviews = offersSnapshot.docs.map((doc) => {
    const data = doc.data();
    const preview: OfferPreview = {
      id: doc.id as OfferID,
      title: data.title,
      description: data.description,
      image: data.image,
      advertiserID: data.advertiserID,
      spentBudget: data.spentBudget,
      maxBudget: data.maxBudget,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      strategy: data.strategy || OfferStrategy.None,
      // targetingTags: data.targetingTags,
    };
    return preview;
  });
  return offerPreviews;
};

//
export const viewCreatedOffer = async (
  offerID: OfferID,
  userIdpID: UserIdpID
): Promise<Offer | undefined> => {
  const offerRef = db
    .collection(Collection.Offer)
    .doc(offerID) as DocumentReference<Offer_Firestore>;

  const offerSnapshot = await offerRef.get();

  if (!offerSnapshot.exists) {
    return undefined;
  }
  const offer = offerSnapshot.data();
  if (!offer) {
    return undefined;
  }
  const questionsFilled = offer.airdropMetadata
    ? await Promise.all(
        offer.airdropMetadata.questions.map((qid) =>
          getQuestionByID(qid as QuestionAnswerID)
        )
      )
    : [];
  const questionsTrimmed = questionsFilled
    .filter((q) => q)
    // @ts-ignore
    .map((q: QuestionAnswer_Firestore) => ({
      id: q.id,
      batch: q.batch,
      order: q.order,
      question: q.question,
      type: q.type,
    })) as QuestionAnswerPreview[];
  const airdropMetadata = offer.airdropMetadata
    ? ({
        oneLiner: offer.airdropMetadata.oneLiner,
        value: offer.airdropMetadata.value,
        instructionsLink: offer.airdropMetadata.instructionsLink,
        instructionsCallToAction:
          offer.airdropMetadata.instructionsCallToAction,
        callToActionLink: offer.airdropMetadata.callToActionLink,
        excludedOffers: offer.airdropMetadata.excludedOffers,
        questions: questionsTrimmed,
        lootboxTemplateID: offer.airdropMetadata.lootboxTemplateID,
        lootboxTemplateStamp: offer.airdropMetadata.lootboxTemplateStamp,
      } as OfferAirdropMetadata)
    : undefined;
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    offer.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }
  return {
    ...offer,
    // @ts-ignore
    strategy: offer.strategy || OfferStrategyType.None,
    airdropMetadata,
    activations: [],
    adSetPreviews: [],
  };
};

export const listOffersAvailableForOrganizer = async (
  affiliateID: AffiliateID
): Promise<OfferAffiliateView[]> => {
  const whitelistsRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .where(
      "organizerID",
      "==",
      affiliateID
    ) as Query<OrganizerOfferWhitelist_Firestore>;

  const whitelistsSnapshot = await whitelistsRef.get();

  if (whitelistsSnapshot.empty) {
    return [];
  }
  const whitelists = whitelistsSnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return data;
    })
    .filter((d) => d.status === OrganizerOfferWhitelistStatus.Active);
  const uniqueWhitelists = _.uniqBy(whitelists, "offerID");

  const offersSnapshots = await Promise.all(
    uniqueWhitelists.map((w) => {
      const offerRef = db
        .collection(Collection.Offer)
        .doc(w.offerID) as DocumentReference<Offer_Firestore>;
      return offerRef.get();
    })
  );
  const offers = offersSnapshots
    .map((snap) => {
      if (!snap.exists) {
        return undefined;
      }
      return snap.data();
    })
    .filter((x) => x)
    .map((x) => {
      return {
        id: x.id,
        title: x.title,
        description: x.description,
        image: x.image,
        advertiserID: x.advertiserID,
        spentBudget: x.spentBudget,
        maxBudget: x.maxBudget,
        startDate: x.startDate,
        endDate: x.endDate,
        status: x.status,
      };
    });
  const uniqueAdvertiserIDs = _.uniq(offers.map((o) => o.advertiserID));
  const advertisers = await Promise.all(
    uniqueAdvertiserIDs.map((aid) => {
      return getAdvertiser(aid);
    })
  );
  const offersWithDetails = offers.map((offer) => {
    const advertiser = (
      advertisers.filter((a) => a) as Advertiser_Firestore[]
    ).find((a) => a.id === offer.advertiserID);
    return {
      ...offer,
      advertiserName: advertiser?.name || "",
      advertiserAvatar: advertiser?.avatar || "",
    };
  });
  return offersWithDetails;
};

export const listActiveActivationsForOffer = async (
  offerID: OfferID
): Promise<Activation_Firestore[]> => {
  const activationsRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID) as Query<Activation_Firestore>;

  const activationItems = await activationsRef.get();

  if (activationItems.empty) {
    return [];
  }
  const activeActivations = activationItems.docs
    .map((doc) => {
      const data = doc.data();
      return data;
    })
    .filter((act) => act.status === ActivationStatus.Active);
  return activeActivations;
};

export const listActivationsForOffer = async (
  offerID: OfferID
): Promise<Activation_Firestore[]> => {
  const activationsRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID) as Query<Activation_Firestore>;

  const activationItems = await activationsRef.get();

  if (activationItems.empty) {
    return [];
  }

  const activeActivations = activationItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
  return activeActivations;
};

export const getAdSetPreviewsForOffer = async (
  offerID: OfferID
): Promise<AdSetPreview[]> => {
  const adSetRef = db
    .collection(Collection.AdSet)
    .where("offerIDs", "array-contains", offerID) as Query<AdSet_Firestore>;

  const adSetCollectionItems = await adSetRef.get();

  if (adSetCollectionItems.empty) {
    return [];
  }
  return adSetCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      name: data.name,
      status: data.status,
      placement: data.placement,
      thumbnail: data.thumbnail,
    };
  });
};

export const getOffer = async (
  offerID: OfferID
): Promise<Offer_Firestore | undefined> => {
  const offerRef = db
    .collection(Collection.Offer)
    .doc(offerID) as DocumentReference<Offer_Firestore>;

  const offerSnapshot = await offerRef.get();

  if (!offerSnapshot.exists) {
    return undefined;
  }
  return offerSnapshot.data();
};

interface CreateQuestionPayload {
  question: string;
  type: QuestionFieldType;
  offerID: OfferID;
  advertiserID: AdvertiserID;
}
export const createQuestion = async (
  payload: CreateQuestionPayload,
  order?: number
): Promise<QuestionAnswer_Firestore> => {
  const batchID = uuidv4();
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .doc() as DocumentReference<QuestionAnswer_Firestore>;
  const questionCreatedObjectOfSchema: QuestionAnswer_Firestore = {
    id: questionRef.id as QuestionAnswerID,
    batch: batchID, // index
    order,
    airdropMetadata: {
      offerID: payload.offerID,
      advertiserID: payload.advertiserID,
    },
    status: QuestionAnswerStatus.Active,
    question: payload.question,
    type: payload.type,
    timestamp: new Date().getTime() / 1000,
  };
  await questionRef.set(questionCreatedObjectOfSchema);
  return questionCreatedObjectOfSchema;
};

export const updateQuestionStatus = async (
  id: QuestionAnswerID,
  status: QuestionAnswerStatus
): Promise<QuestionAnswer_Firestore | undefined> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .doc(id) as DocumentReference<QuestionAnswer_Firestore>;
  const questionSnapshot = await questionRef.get();
  if (!questionSnapshot.exists) {
    return undefined;
  }
  const updatePayload: Partial<QuestionAnswer_Firestore> = {};
  updatePayload.status = status;
  // until done
  await questionRef.update(updatePayload);
  return (await questionRef.get()).data() as QuestionAnswer_Firestore;
};

export const getQuestionByID = async (
  id: QuestionAnswerID
): Promise<QuestionAnswer_Firestore | undefined> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .doc(id) as DocumentReference<QuestionAnswer_Firestore>;

  const questionSnapshot = await questionRef.get();

  if (!questionSnapshot.exists) {
    return undefined;
  } else {
    return questionSnapshot.data();
  }
};

export const getQuestion = async (
  id: QuestionAnswerID
): Promise<QuestionAnswer_Firestore | undefined> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .doc(id) as DocumentReference<QuestionAnswer_Firestore>;

  const questionSnapshot = await questionRef.get();

  if (!questionSnapshot.exists) {
    return undefined;
  } else {
    return questionSnapshot.data();
  }
};

export const answerAirdropLootboxQuestion = async (
  payload: AnswerAirdropQuestionPayload,
  userID: UserIdpID
) => {
  const lootbox = await getLootbox(payload.lootboxID as LootboxID);

  if (!lootbox) {
    throw Error(`No Lootbox of ID=${payload.lootboxID} found!`);
  }
  const airdropMetadata = {
    lootboxID: lootbox.id,
    tournamentID: lootbox.airdropMetadata?.tournamentID,
    organizerID: lootbox.airdropMetadata?.organizerID,
  };

  const answers = await Promise.all(
    payload.answers.map((a) => {
      return createAnswer(
        a.questionID as QuestionAnswerID,
        userID as unknown as UserID,
        a.answer,
        airdropMetadata
      );
    })
  );
  const answeredAllLootboxQuestions = lootbox.airdropMetadata?.questions.every(
    (qid) => payload.answers.map((a) => a.questionID).includes(qid)
  );
  const answeredSomeLootboxQuestions = lootbox.airdropMetadata?.questions.some(
    (qid) => payload.answers.map((a) => a.questionID).includes(qid)
  );
  if (answeredAllLootboxQuestions && payload.claimID) {
    await updateClaimRedemptionStatus(
      payload.claimID as ClaimID,
      ClaimRedemptionStatus.Answered,
      userID
    );
  } else if (answeredSomeLootboxQuestions) {
    await updateClaimRedemptionStatus(
      payload.claimID as ClaimID,
      ClaimRedemptionStatus.InProgress,
      userID
    );
  }
  return answers.map((a) => a.id);
};

export const createAnswer = async (
  questionID: QuestionAnswerID,
  userID: UserID,
  answer: string,
  airdropMetadata?: {
    lootboxID?: LootboxID;
    tournamentID?: TournamentID;
    organizerID?: AffiliateID;
  }
): Promise<QuestionAnswer_Firestore> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .doc(questionID) as DocumentReference<QuestionAnswer_Firestore>;
  const questionSnapshot = await questionRef.get();
  const question = questionSnapshot.data() as QuestionAnswer_Firestore;
  const answerRef = db
    .collection(Collection.QuestionAnswer)
    .doc() as DocumentReference<QuestionAnswer_Firestore>;
  const answerCreatedObjectOfSchema: QuestionAnswer_Firestore = {
    ...question,
    id: questionRef.id as QuestionAnswerID,
    userID,
    answer,
    airdropMetadata: question.airdropMetadata
      ? {
          ...question.airdropMetadata,
          ...airdropMetadata,
        }
      : undefined,
  };
  await answerRef.set(answerCreatedObjectOfSchema);
  return answerCreatedObjectOfSchema;
};

export const checkIfUserAnsweredAirdropQuestions = async (
  lootboxID: LootboxID,
  userID: UserID
) => {
  const answersRef = db
    .collection(Collection.QuestionAnswer)
    .where(
      "airdropMetadata.lootboxID",
      "==",
      lootboxID
    ) as Query<QuestionAnswer_Firestore>;

  const answerCollectionItems = await answersRef.get();

  if (answerCollectionItems.empty) {
    return [];
  }
  return answerCollectionItems.docs
    .map((doc) => {
      return doc.data();
    })
    .filter((a) => a && a.userID === userID);
};
