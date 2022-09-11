// const isAuthenticated = () => {};
// const isAclPermitted = () => {};

/**
 * ------ Questions for Newton ------
 *
 * 1. How to deal with dates in firestore?
 * 2. How to generate my damn graphql types? why arent they generating?
 * 3. How we define types in firestore? surely not just relying on GQL?
 * 4. How should we deal with currency?
 * 5. Why you use use omit in the graphql to firestore payload: Omit<UpdateConquestPayload, "id">
 *
 *
 */

// // Advertiser
// const AdvertiserResolverComposition = {
//   "Mutation.UpgradeToAdvertiser": [isAuthenticated()], // creates a company
//   "Mutation.UpdateAdvertiserInfo": [isAuthenticated(), isAclPermitted()],
//   "Mutation.AddFundsToTreasury": [isAuthenticated(), isAclPermitted()],
//   "Mutation.PullFundsFromTreasury": [isAuthenticated(), isAclPermitted()],
//   "Mutation.ProposeTournament": [isAuthenticated(), isAclPermitted()],
//   "Mutation.AssignTournament": [isAuthenticated(), isAclPermitted()],
//   "Mutation.CreateConquest": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdateConquest": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewCompanyInfo": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewTreasuryHistory": [isAuthenticated(), isAclPermitted()],
// };

// // Offer
// const OfferResolverComposition = {
//   "Mutation.CreateOffer": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdateOffer": [isAuthenticated(), isAclPermitted()], // filters out actions based on ACL
//   "Query.ListOffers": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewOffer": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewOfferPerformanceHistory": [isAuthenticated(), isAclPermitted()],
// };

// // Affilliate Tournament
// const AffilliateResolverComposition = {
//   "Mutation.UpgradeToAffilliate": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdateAffilliateInfo": [isAuthenticated(), isAclPermitted()],
//   "Mutation.CreateTournament": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdateTournament": [isAuthenticated(), isAclPermitted()], // filters out actions based on ACL
//   "Mutation.AddPromoter": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdatePromoter": [isAuthenticated(), isAclPermitted()],
//   "Mutation.RemovePromoter": [isAuthenticated(), isAclPermitted()],
//   "Mutation.AddOffer": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdateOffer": [isAuthenticated(), isAclPermitted()],
//   "Mutation.RemoveOffer": [isAuthenticated(), isAclPermitted()],
//   "Mutation.GenerateParticipationReward": [isAuthenticated(), isAclPermitted()],
//   "Mutation.UpdateTournamentParticipantStatus": [
//     isAuthenticated(),
//     isAclPermitted(),
//   ],
//   "Query.ViewOrganizer": [isAuthenticated(), isAclPermitted()],
//   "Query.ListTournaments": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewTournament": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewProposedTournament": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewAffiliatePerformanceHistory": [
//     isAuthenticated(),
//     isAclPermitted(),
//   ],
//   "Query.ViewOrganizerPayoutHistory": [isAuthenticated(), isAclPermitted()],
// };

// // Promoter
// const PromoterResolverComposition = {
//   "Mutation.LeaveTournament": [isAuthenticated(), isAclPermitted()],
//   "Mutation.GenerateInviteGraphic": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewPromoter": [isAuthenticated(), isAclPermitted()],
//   "Query.ListTournaments": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewTournament": [isAuthenticated(), isAclPermitted()],
//   "Query.ViewPromoterPayoutHistory": [isAuthenticated(), isAclPermitted()],
// };
