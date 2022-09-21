import {
  AdEvent_Firestore,
  Collection,
  OfferID,
  Activation_Firestore,
  ActivationStatus,
  TournamentID,
  AffiliateID,
  AffiliateType,
  AdvertiserID,
  Memo_Firestore,
} from "@wormgraph/helpers";
import {
  AdEvent,
  AnalyticsAdEvent,
  Affiliate,
  AnalyticsMemo,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import { Query } from "firebase-admin/firestore";
import {
  ReportOrganizerOfferPerfResponseSuccess,
  ReportPromoterTournamentPerfResponseSuccess,
} from "../../graphql/generated/types";
import {
  ReportAdvertiserAffiliatePerfResponseSuccess,
  ReportOrganizerTournamentResponseSuccess,
} from "../../graphql/generated/types";
import {
  ReportAdvertiserOfferPerformanceResponseSuccess,
  ReportAdvertiserTournamentPerfResponseSuccess,
} from "../../graphql/generated/types";

export const reportAdvertiserOfferPerformance = async (
  offerID: OfferID
): Promise<ReportAdvertiserOfferPerformanceResponseSuccess> => {
  const activationEventRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID) as Query<Activation_Firestore>;

  const activationEventsSnapshot = await activationEventRef.get();

  const activationEventIDs = activationEventsSnapshot.docs
    .map((doc) => doc.data())
    .filter((activation) => activation.status !== ActivationStatus.Archived)
    .map((a) => a.id);

  const adEventRef = db
    .collection(Collection.AdEvent)
    .where("activationID", "in", activationEventIDs)
    .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>;
  const memoRef = db
    .collection(Collection.Memo)
    .where("activationID", "in", activationEventIDs)
    .orderBy("timestamp", "desc") as Query<Memo_Firestore>;

  const [adEventsSnapshot, memosSnapshot] = await Promise.all([
    adEventRef.get(),
    memoRef.get(),
  ]);

  let adEventsResult: AnalyticsAdEvent[] = [];
  let memosResult: AnalyticsMemo[] = [];
  if (!adEventsSnapshot.empty) {
    const adEvents = adEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const adEvent: AnalyticsAdEvent = {
        action: data.action,
        activationEventMmpAlias: data.activationEventMmpAlias,
        activationID: data.activationID,
        adID: data.adID,
        adSetID: data.adSetID,
        id: data.id,
        organizerID: data.affiliateAttribution?.organizerID,
        promoterID: data.affiliateAttribution?.promoterID,
        timestamp: data.timestamp,
        tournamentID: data.affiliateAttribution?.tournamentID,
      };
      return adEvent;
    });
    adEventsResult = adEvents;
  }
  if (!memosSnapshot.empty) {
    const memoEvents = memosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const memo: AnalyticsMemo = {
        id: data.id,
        timestamp: data.timestamp,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        advertiserID: data.advertiserID,
        adEventID: data.adEventID,
        activationID: data.activationID,
        mmpAlias: data.mmpAlias,
        mmp: data.mmp,
        tournamentID: data.tournamentID,
        amount: data.amount,
      };
      return memo;
    });
    memosResult = memoEvents;
  }
  return {
    events: adEventsResult,
    memos: memosResult,
  };
};

export const reportAdvertiserTournamentPerf = async (
  tournamentID: TournamentID,
  advertiserID: AdvertiserID
): Promise<ReportAdvertiserTournamentPerfResponseSuccess> => {
  const adEventRef = db
    .collection(Collection.AdEvent)
    .where("affiliateAttribution.tournamentID", "==", tournamentID)
    .where("advertiserID", "==", advertiserID)
    .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>;
  const memoRef = db
    .collection(Collection.Memo)
    .where("tournamentID", "==", tournamentID)
    .where("advertiserID", "==", advertiserID)
    .orderBy("timestamp", "desc") as Query<Memo_Firestore>;

  const [adEventsSnapshot, memosSnapshot] = await Promise.all([
    adEventRef.get(),
    memoRef.get(),
  ]);

  let adEventsResult: AnalyticsAdEvent[] = [];
  let memosResult: AnalyticsMemo[] = [];
  if (!adEventsSnapshot.empty) {
    const adEvents = adEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const adEvent: AnalyticsAdEvent = {
        action: data.action,
        activationEventMmpAlias: data.activationEventMmpAlias,
        activationID: data.activationID,
        adID: data.adID,
        adSetID: data.adSetID,
        id: data.id,
        organizerID: data.affiliateAttribution?.organizerID,
        promoterID: data.affiliateAttribution?.promoterID,
        timestamp: data.timestamp,
        tournamentID: data.affiliateAttribution?.tournamentID,
      };
      return adEvent;
    });
    adEventsResult = adEvents;
  }
  if (!memosSnapshot.empty) {
    const memoEvents = memosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const memo: AnalyticsMemo = {
        id: data.id,
        timestamp: data.timestamp,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        advertiserID: data.advertiserID,
        adEventID: data.adEventID,
        activationID: data.activationID,
        mmpAlias: data.mmpAlias,
        mmp: data.mmp,
        tournamentID: data.tournamentID,
        amount: data.amount,
      };
      return memo;
    });
    memosResult = memoEvents;
  }
  return {
    events: adEventsResult,
    memos: memosResult,
  };
};

export const reportAdvertiserAffiliatePerf = async (
  affiliateID: AffiliateID,
  affiliateType: AffiliateType,
  advertiserID: AdvertiserID
): Promise<ReportAdvertiserAffiliatePerfResponseSuccess> => {
  const adEventRef =
    affiliateType === AffiliateType.Organizer
      ? (db
          .collection(Collection.AdEvent)
          .where("affiliateAttribution.organizerID", "==", affiliateID)
          .where("advertiserID", "==", advertiserID)
          .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>)
      : (db
          .collection(Collection.AdEvent)
          .where("affiliateAttribution.promoterID", "==", affiliateID)
          .where("advertiserID", "==", advertiserID)
          .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>);

  const memoRef = db
    .collection(Collection.Memo)
    .where("affiliateID", "==", affiliateID)
    .where("advertiserID", "==", advertiserID)
    .orderBy("timestamp", "desc") as Query<Memo_Firestore>;

  const [adEventsSnapshot, memosSnapshot] = await Promise.all([
    adEventRef.get(),
    memoRef.get(),
  ]);

  let adEventsResult: AnalyticsAdEvent[] = [];
  let memosResult: AnalyticsMemo[] = [];
  if (!adEventsSnapshot.empty) {
    const adEvents = adEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const adEvent: AnalyticsAdEvent = {
        action: data.action,
        activationEventMmpAlias: data.activationEventMmpAlias,
        activationID: data.activationID,
        adID: data.adID,
        adSetID: data.adSetID,
        id: data.id,
        organizerID: data.affiliateAttribution?.organizerID,
        promoterID: data.affiliateAttribution?.promoterID,
        timestamp: data.timestamp,
        tournamentID: data.affiliateAttribution?.tournamentID,
      };
      return adEvent;
    });
    adEventsResult = adEvents;
  }
  if (!memosSnapshot.empty) {
    const memoEvents = memosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const memo: AnalyticsMemo = {
        id: data.id,
        timestamp: data.timestamp,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        advertiserID: data.advertiserID,
        adEventID: data.adEventID,
        activationID: data.activationID,
        mmpAlias: data.mmpAlias,
        mmp: data.mmp,
        tournamentID: data.tournamentID,
        amount: data.amount,
      };
      return memo;
    });
    memosResult = memoEvents;
  }
  return {
    events: adEventsResult,
    memos: memosResult,
  };
};

export const reportOrganizerTournamentPerformance = async (
  tournamentID: TournamentID,
  organizerID: AffiliateID
): Promise<ReportOrganizerTournamentResponseSuccess> => {
  const adEventRef = db
    .collection(Collection.AdEvent)
    .where("affiliateAttribution.tournamentID", "==", tournamentID)
    .where("affiliateAttribution.organizerID", "==", organizerID)
    .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>;

  const memoRef = db
    .collection(Collection.Memo)
    .where("tournamentID", "==", tournamentID)
    .where("affiliateID", "==", organizerID)
    .orderBy("timestamp", "desc") as Query<Memo_Firestore>;

  const [adEventsSnapshot, memosSnapshot] = await Promise.all([
    adEventRef.get(),
    memoRef.get(),
  ]);

  let adEventsResult: AnalyticsAdEvent[] = [];
  let memosResult: AnalyticsMemo[] = [];
  if (!adEventsSnapshot.empty) {
    const adEvents = adEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const adEvent: AnalyticsAdEvent = {
        action: data.action,
        activationEventMmpAlias: data.activationEventMmpAlias,
        activationID: data.activationID,
        adID: data.adID,
        adSetID: data.adSetID,
        id: data.id,
        organizerID: data.affiliateAttribution?.organizerID,
        promoterID: data.affiliateAttribution?.promoterID,
        timestamp: data.timestamp,
        tournamentID: data.affiliateAttribution?.tournamentID,
      };
      return adEvent;
    });
    adEventsResult = adEvents;
  }
  if (!memosSnapshot.empty) {
    const memoEvents = memosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const memo: AnalyticsMemo = {
        id: data.id,
        timestamp: data.timestamp,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        advertiserID: data.advertiserID,
        adEventID: data.adEventID,
        activationID: data.activationID,
        mmpAlias: data.mmpAlias,
        mmp: data.mmp,
        tournamentID: data.tournamentID,
        amount: data.amount,
      };
      return memo;
    });
    memosResult = memoEvents;
  }
  return {
    events: adEventsResult,
    memos: memosResult,
  };
};

export const reportOrganizerOfferPerf = async (
  offerID: OfferID,
  organizerID: AffiliateID
): Promise<ReportOrganizerOfferPerfResponseSuccess> => {
  const activationEventRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID) as Query<Activation_Firestore>;

  const activationEventsSnapshot = await activationEventRef.get();

  const activationEventIDs = activationEventsSnapshot.docs
    .map((doc) => doc.data())
    .filter((activation) => activation.status !== ActivationStatus.Archived)
    .map((a) => a.id);

  const adEventRef = db
    .collection(Collection.AdEvent)
    .where("affiliateAttribution.organizerID", "==", organizerID)
    .where("activationID", "in", activationEventIDs)
    .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>;

  const memoRef = db
    .collection(Collection.Memo)
    .where("affiliateID", "==", organizerID)
    .where("activationID", "in", activationEventIDs)
    .orderBy("timestamp", "desc") as Query<Memo_Firestore>;

  const [adEventsSnapshot, memosSnapshot] = await Promise.all([
    adEventRef.get(),
    memoRef.get(),
  ]);

  let adEventsResult: AnalyticsAdEvent[] = [];
  let memosResult: AnalyticsMemo[] = [];
  if (!adEventsSnapshot.empty) {
    const adEvents = adEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const adEvent: AnalyticsAdEvent = {
        action: data.action,
        activationEventMmpAlias: data.activationEventMmpAlias,
        activationID: data.activationID,
        adID: data.adID,
        adSetID: data.adSetID,
        id: data.id,
        organizerID: data.affiliateAttribution?.organizerID,
        promoterID: data.affiliateAttribution?.promoterID,
        timestamp: data.timestamp,
        tournamentID: data.affiliateAttribution?.tournamentID,
      };
      return adEvent;
    });
    adEventsResult = adEvents;
  }
  if (!memosSnapshot.empty) {
    const memoEvents = memosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const memo: AnalyticsMemo = {
        id: data.id,
        timestamp: data.timestamp,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        advertiserID: data.advertiserID,
        adEventID: data.adEventID,
        activationID: data.activationID,
        mmpAlias: data.mmpAlias,
        mmp: data.mmp,
        tournamentID: data.tournamentID,
        amount: data.amount,
      };
      return memo;
    });
    memosResult = memoEvents;
  }
  return {
    events: adEventsResult,
    memos: memosResult,
  };
};

export const reportPromoterTournamentPerformance = async (
  tournamentID: TournamentID,
  promoterID: AffiliateID
): Promise<ReportPromoterTournamentPerfResponseSuccess> => {
  const adEventRef = db
    .collection(Collection.AdEvent)
    .where("affiliateAttribution.tournamentID", "==", tournamentID)
    .where("affiliateAttribution.promoterID", "==", promoterID)
    .orderBy("timestamp", "desc") as Query<AdEvent_Firestore>;

  const memoRef = db
    .collection(Collection.Memo)
    .where("tournamentID", "==", tournamentID)
    .where("affiliateID", "==", promoterID)
    .orderBy("timestamp", "desc") as Query<Memo_Firestore>;

  const [adEventsSnapshot, memosSnapshot] = await Promise.all([
    adEventRef.get(),
    memoRef.get(),
  ]);

  let adEventsResult: AnalyticsAdEvent[] = [];
  let memosResult: AnalyticsMemo[] = [];
  if (!adEventsSnapshot.empty) {
    const adEvents = adEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const adEvent: AnalyticsAdEvent = {
        action: data.action,
        activationEventMmpAlias: data.activationEventMmpAlias,
        activationID: data.activationID,
        adID: data.adID,
        adSetID: data.adSetID,
        id: data.id,
        organizerID: data.affiliateAttribution?.organizerID,
        promoterID: data.affiliateAttribution?.promoterID,
        timestamp: data.timestamp,
        tournamentID: data.affiliateAttribution?.tournamentID,
      };
      return adEvent;
    });
    adEventsResult = adEvents;
  }
  if (!memosSnapshot.empty) {
    const memoEvents = memosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const memo: AnalyticsMemo = {
        id: data.id,
        timestamp: data.timestamp,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        advertiserID: data.advertiserID,
        adEventID: data.adEventID,
        activationID: data.activationID,
        mmpAlias: data.mmpAlias,
        mmp: data.mmp,
        tournamentID: data.tournamentID,
        amount: data.amount,
      };
      return memo;
    });
    memosResult = memoEvents;
  }
  return {
    events: adEventsResult,
    memos: memosResult,
  };
};
