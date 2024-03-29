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
  Offer_AfterTicketClaimMetadata,
  ReferralID,
  AdSetID,
  tableActivationIngestorRoutes,
  ActivationIngestorRoute_LootboxAppActivation_Body,
  FlightID,
  OfferVisibility_Firestore,
} from "@wormgraph/helpers";
import { v4 as uuidv4 } from "uuid";
import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  AdSetPreview,
  AfterTicketClaimQuestionPayload,
  AnswerAirdropQuestionPayload,
  CreateOfferPayload,
  CreateOfferResponse,
  EditActivationInput,
  EditOfferPayload,
  OfferAffiliateView,
  OfferAfterTicketClaimMetadata,
  OfferAirdropMetadata,
  OfferStrategyType,
  OfferVisibility,
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
import { updateClaimRedemptionStatus, getReferralById } from "./referral";
import { getTournamentById } from "./tournament";
import { getAdSet } from "./ad";
import axios from "axios";
import { manifest } from "../../manifest";

export const createOffer = async (
  advertiserID: AdvertiserID,
  payload: Omit<CreateOfferPayload, "id">,
  userIdpID: UserIdpID
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
    strategy: (payload.strategy ||
      OfferStrategy.AfterTicketClaim) as OfferStrategy,
    visibility: OfferVisibility_Firestore.Private,
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
            mandatory: q.mandatory || false,
            options: q.options || "",
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
  if (payload.afterTicketClaimMetadata) {
    const questions = await Promise.all(
      payload.afterTicketClaimMetadata.questions.map((q, i) => {
        return createQuestion(
          {
            question: q.question,
            type: q.type as QuestionFieldType,
            offerID: offerRef.id as OfferID,
            advertiserID: payload.advertiserID as AdvertiserID,
            mandatory: q.mandatory || false,
            options: q.options || "",
          },
          i
        );
      })
    );
    offer.afterTicketClaimMetadata = {
      questions: questions.map((q) => q.id) || [],
    };
  }
  await offerRef.set(offer);
  // always create 2-3 activations for each offer
  // view + click + (question answer if applicable)
  const defaultActivations = [
    {
      name: "View Ad",
      description:
        "Viewed the Ad. This is a default activation that you can modify or remove.",
      pricing: 0,
      status: ActivationStatus.Active,
      mmp: MeasurementPartnerType.LootboxAppAdView,
      mmpAlias: "ad_view",
      offerID: offerRef.id as OfferID,
      order: 0,
      isDefault: true,
    },
  ];
  if (
    (payload.airdropMetadata && payload.airdropMetadata.questions.length > 0) ||
    (payload.afterTicketClaimMetadata &&
      payload.afterTicketClaimMetadata.questions.length > 0)
  ) {
    defaultActivations.push({
      name: "Answered Questions",
      description:
        "Answered the Offer Questions. This is a default activation that you can modify or remove.",
      pricing: 0,
      status: ActivationStatus.Active,
      mmp: MeasurementPartnerType.LootboxAppAnswerQuestions,
      mmpAlias: "answer_questions",
      offerID: offerRef.id as OfferID,
      order: defaultActivations.length,
      isDefault: true,
    });
  }
  defaultActivations.push({
    name: "Click Button",
    description:
      "Clicked the call to action button on ad to visit a url. This is a default activation that you can modify or remove.",
    pricing: 0,
    status: ActivationStatus.Active,
    mmp: MeasurementPartnerType.LootboxAppWebsiteVisit,
    mmpAlias: "clicked_button",
    offerID: offerRef.id as OfferID,
    order: defaultActivations.length,
    isDefault: true,
  });
  await Promise.all(
    defaultActivations.map((actv) =>
      createActivation(offerRef.id as OfferID, actv, userIdpID)
    )
  );
  return offer;
};

export const convertOfferVisibilityDB = (
  visibility: OfferVisibility
): OfferVisibility_Firestore => {
  switch (visibility) {
    case OfferVisibility.Public:
      return OfferVisibility_Firestore.Public;
    case OfferVisibility.Private:
    default:
      return OfferVisibility_Firestore.Private;
  }
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
  if (payload.visibility != undefined) {
    updatePayload.visibility = convertOfferVisibilityDB(payload.visibility);
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
    // await Promise.all([
    //   ...(payload.airdropMetadata.activeQuestions || []).map((q) =>
    //     updateQuestionStatus(q as QuestionAnswerID, QuestionAnswerStatus.Active)
    //   ),
    //   ...(payload.airdropMetadata.inactiveQuestions || []).map((q) =>
    //     updateQuestionStatus(
    //       q as QuestionAnswerID,
    //       QuestionAnswerStatus.Inactive
    //     )
    //   ),
    // ...payload.airdropMetadata.newQuestions.map((q) =>
    //   createQuestion({
    //     question: q.question,
    //     type: q.type,
    //     offerID: offerRef.id as OfferID,
    //     advertiserID: payload.advertiserID as AdvertiserID,
    //   })
    // ),
    // ]);
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
interface ICreateActivation extends CreateActivationInput {
  isDefault?: boolean;
}
export const createActivation = async (
  id: OfferID,
  payload: ICreateActivation,
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
    isDefault: payload.isDefault || false,
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
  if (actInput && actInput.status && !existingObj.isDefault) {
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
      visibility: data.visibility,
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
  // ---------- airdrop questions ---------- //
  const airdropQuestionsFilled = offer.airdropMetadata
    ? await Promise.all(
        offer.airdropMetadata.questions.map((qid) =>
          getQuestionByID(qid as QuestionAnswerID)
        )
      )
    : [];
  const airdropQuestionsTrimmed = airdropQuestionsFilled
    .filter((q) => q)
    // @ts-ignore
    .map((q: QuestionAnswer_Firestore) => ({
      id: q.id,
      batch: q.batch,
      order: q.order,
      question: q.question,
      type: q.type,
      mandatory: q.mandatory || false,
      options: q.options || "",
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
        questions: airdropQuestionsTrimmed,
        lootboxTemplateID: offer.airdropMetadata.lootboxTemplateID,
        lootboxTemplateStamp: offer.airdropMetadata.lootboxTemplateStamp,
      } as OfferAirdropMetadata)
    : undefined;

  // ---------- after ticket claim questions ---------- //
  const afterTicketClaimQuestionsFilled = offer.afterTicketClaimMetadata
    ? await Promise.all(
        offer.afterTicketClaimMetadata.questions.map((qid) =>
          getQuestionByID(qid as QuestionAnswerID)
        )
      )
    : [];
  const afterTicketClaimQuestionsTrimmed = afterTicketClaimQuestionsFilled
    .filter((q) => q)
    // @ts-ignore
    .map((q: QuestionAnswer_Firestore) => ({
      id: q.id,
      batch: q.batch,
      order: q.order,
      question: q.question,
      type: q.type,
      mandatory: q.mandatory || false,
      options: q.options || "",
    })) as QuestionAnswerPreview[];
  const afterTicketClaimMetadata = offer.afterTicketClaimMetadata
    ? ({
        questions: afterTicketClaimQuestionsTrimmed,
      } as OfferAfterTicketClaimMetadata)
    : undefined;

  return {
    ...offer,
    // @ts-ignore
    strategy: offer.strategy || OfferStrategyType.None,
    airdropMetadata,
    afterTicketClaimMetadata,
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
  mandatory?: boolean;
  options?: string;
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
    metadata: {
      offerID: payload.offerID,
      advertiserID: payload.advertiserID,
    },
    isOriginal: true,
    status: QuestionAnswerStatus.Active,
    question: payload.question,
    mandatory: payload.mandatory || false,
    options: payload.options || "",
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

export const getQuestionsForOffer = async (
  offerID: OfferID
): Promise<QuestionAnswer_Firestore[]> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .where(
      "metadata.offerID",
      "==",
      offerID
    ) as Query<QuestionAnswer_Firestore>;

  const questionsCollectionItems = await questionRef.get();

  if (questionsCollectionItems.empty) {
    return [];
  } else {
    return questionsCollectionItems.docs
      .map((doc) => {
        const data = doc.data();
        return data;
      })
      .filter((d) => d && d.isOriginal);
  }
};

export const checkIfOfferIncludesLootboxAppDefaultActivations = async (
  offerID: OfferID
) => {
  const activations = await listActivationsForOffer(offerID);
  const firstLootboxAppAdViewMmp = activations.find(
    (activation) => activation.mmp === MeasurementPartnerType.LootboxAppAdView
  );
  const firstLootboxAppAnswerQuestionsMmp = activations.find(
    (activation) =>
      activation.mmp === MeasurementPartnerType.LootboxAppAnswerQuestions
  );
  const firstLootboxAppWebsiteVisitMmp = activations.find(
    (activation) =>
      activation.mmp === MeasurementPartnerType.LootboxAppWebsiteVisit
  );
  const adView = firstLootboxAppAdViewMmp || { id: null, mmpAlias: null };
  const answerQuestions = firstLootboxAppAnswerQuestionsMmp || {
    id: null,
    mmpAlias: null,
  };
  const websiteVisit = firstLootboxAppWebsiteVisitMmp || {
    id: null,
    mmpAlias: null,
  };
  return { adView, answerQuestions, websiteVisit };
};

export const answerAirdropLootboxQuestion = async (
  payload: AnswerAirdropQuestionPayload,
  userID: UserIdpID
) => {
  const lootbox = await getLootbox(payload.lootboxID as LootboxID);

  if (!lootbox) {
    throw Error(`No Lootbox of ID=${payload.lootboxID} found!`);
  }

  const metadata = {
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
        metadata
      );
    })
  );

  // ------------------------------
  const offerID = lootbox.airdropMetadata?.offerID;
  if (offerID && payload.flightID) {
    const { answerQuestions } =
      await checkIfOfferIncludesLootboxAppDefaultActivations(offerID);
    const { id, mmpAlias } = answerQuestions;
    if (id && mmpAlias) {
      const info: ActivationIngestorRoute_LootboxAppActivation_Body = {
        flightID: payload.flightID as FlightID,
        activationID: id,
        mmpAlias,
      };
      await axios({
        method: "post",
        url: `${manifest.cloudRun.containers.activationIngestor.fullRoute}${
          tableActivationIngestorRoutes[
            MeasurementPartnerType.LootboxAppAnswerQuestions
          ].path
        }`,
        data: info,
      });
    }
  }
  // ------------------------------
  const allQuestions = (
    await Promise.all(
      (lootbox.airdropMetadata?.questions || []).map((q) => {
        return getQuestion(q as QuestionAnswerID);
      })
    )
  ).filter((q) => q) as QuestionAnswer_Firestore[];
  const answeredAllMandatoryLootboxQuestions = allQuestions
    .filter((q) => q.mandatory)
    .map((q) => q.id)
    .every((qid) => payload.answers.map((a) => a.questionID).includes(qid));
  const answeredSomeLootboxQuestions = lootbox.airdropMetadata?.questions.some(
    (qid) => payload.answers.map((a) => a.questionID).includes(qid)
  );
  if (answeredAllMandatoryLootboxQuestions && payload.claimID) {
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
  if (lootbox.airdropMetadata?.offerID && payload.flightID) {
    const { answerQuestions } =
      await checkIfOfferIncludesLootboxAppDefaultActivations(
        lootbox.airdropMetadata.offerID
      );
    const { id, mmpAlias } = answerQuestions;
    if (id && mmpAlias) {
      const info: ActivationIngestorRoute_LootboxAppActivation_Body = {
        flightID: payload.flightID as FlightID,
        activationID: id,
        mmpAlias,
      };
      await axios({
        method: "post",
        url: `${manifest.cloudRun.containers.activationIngestor.fullRoute}${
          tableActivationIngestorRoutes[
            MeasurementPartnerType.LootboxAppAnswerQuestions
          ].path
        }`,
        data: info,
      });
    }
  }
  return answers.map((a) => a.id);
};

export const answerAfterTicketClaimQuestion = async (
  payload: AfterTicketClaimQuestionPayload,
  userID: UserIdpID
) => {
  const [referral, adSet] = await Promise.all([
    getReferralById(payload.referralID as ReferralID),
    getAdSet(payload.adSetID as AdSetID),
  ]);
  if (!referral) {
    throw Error(`No Referral of ID=${payload.referralID} found!`);
  }
  if (!adSet) {
    throw Error(`No AdSet of ID=${payload.adSetID} found!`);
  }
  const [tournament, allQuestions] = await Promise.all([
    getTournamentById(referral.tournamentId),
    adSet.offerIDs[0] ? getQuestionsForOffer(adSet.offerIDs[0] as OfferID) : [],
  ]);
  if (!tournament) {
    throw Error(`No Tournament of ID=${referral.tournamentId} found!`);
  }

  const metadata = {
    tournamentID: referral.tournamentId,
    organizerID: tournament.organizer,
    adSetID: payload.adSetID as AdSetID,
    referralID: payload.referralID as ReferralID,
    claimID: payload.claimID as ClaimID,
  };

  const answers = await Promise.all(
    payload.answers.map((a) => {
      return createAnswer(
        a.questionID as QuestionAnswerID,
        userID as unknown as UserID,
        a.answer,
        metadata
      );
    })
  );

  // ------------------------------
  // remove this code if we allow a multi-question UX flow
  // currently it is assumed that a claim has only one question set, either AfterTicketClaim or BeforeAirdropRedeem
  // however we may want to allow a claim to have multiple question sets, in which case we need to upgrade from a singular ClaimRedemptionStatus
  const answeredAllMandatoryLootboxQuestions = allQuestions
    .filter((q) => q.mandatory)
    .map((q) => q.id)
    .every((qid) => payload.answers.map((a) => a.questionID).includes(qid));
  const answeredSomeLootboxQuestions = allQuestions
    .map((q) => q.id)
    .some((qid) => payload.answers.map((a) => a.questionID).includes(qid));
  if (answeredAllMandatoryLootboxQuestions && payload.claimID) {
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
  // ------------------------------
  const offerID = adSet.offerIDs[0];
  if (offerID && payload.flightID) {
    const { answerQuestions } =
      await checkIfOfferIncludesLootboxAppDefaultActivations(offerID);
    const { id, mmpAlias } = answerQuestions;
    if (id && mmpAlias) {
      const info: ActivationIngestorRoute_LootboxAppActivation_Body = {
        flightID: payload.flightID as FlightID,
        activationID: id,
        mmpAlias,
      };
      await axios({
        method: "post",
        url: `${manifest.cloudRun.containers.activationIngestor.fullRoute}${
          tableActivationIngestorRoutes[
            MeasurementPartnerType.LootboxAppAnswerQuestions
          ].path
        }`,
        data: info,
      });
    }
  }
  return answers.map((a) => a.id);
};

export const createAnswer = async (
  questionID: QuestionAnswerID,
  userID: UserID,
  answer: string,
  metadata?: {
    lootboxID?: LootboxID;
    tournamentID?: TournamentID;
    organizerID?: AffiliateID;
    adSetID?: AdSetID;
    referralID?: ReferralID;
    claimID?: ClaimID;
  }
): Promise<QuestionAnswer_Firestore> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .doc(questionID) as DocumentReference<QuestionAnswer_Firestore>;
  const questionSnapshot = await questionRef.get();
  const question = questionSnapshot.data() as QuestionAnswer_Firestore;
  if (!question) {
    throw Error(`No question with ID=${questionID} found!`);
  }
  const answerRef = db
    .collection(Collection.QuestionAnswer)
    .doc() as DocumentReference<QuestionAnswer_Firestore>;
  const answerCreatedObjectOfSchema: QuestionAnswer_Firestore = {
    ...question,
    isOriginal: false,
    id: answerRef.id as QuestionAnswerID,
    userID,
    answer,
    metadata: question.metadata
      ? {
          ...question.metadata,
          ...metadata,
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
      "metadata.lootboxID",
      "==",
      lootboxID
    ) as Query<QuestionAnswer_Firestore>;

  const [answerCollectionItems, lootbox] = await Promise.all([
    answersRef.get(),
    getLootbox(lootboxID),
  ]);
  if (
    lootbox &&
    lootbox.airdropMetadata &&
    lootbox.airdropMetadata.questions &&
    lootbox.airdropMetadata.questions.length === 0
  ) {
    return { passed: true, answers: [] };
  }
  if (answerCollectionItems.empty) {
    return { passed: false, answers: [] };
  }
  const ans = answerCollectionItems.docs
    .map((doc) => {
      return doc.data();
    })
    .filter((a) => a && a.userID === userID);
  return {
    passed: ans.length > 0,
    answers: ans,
  };
};
