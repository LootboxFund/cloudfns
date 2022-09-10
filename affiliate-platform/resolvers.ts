const isAuthenticated = () => {};
const isAclPermitted = () => {};

// Advertiser
const AdvertiserResolverComposition = {
  "Mutation.UpgradeToAdvertiser": [isAuthenticated()], // creates a company
  "Mutation.UpdateAdvertiserInfo": [isAuthenticated(), isAclPermitted()],
  "Mutation.AddFundsToTreasury": [isAuthenticated(), isAclPermitted()],
  "Mutation.PullFundsFromTreasury": [isAuthenticated(), isAclPermitted()],
  "Mutation.ProposeTournament": [isAuthenticated(), isAclPermitted()],
  "Mutation.AssignTournament": [isAuthenticated(), isAclPermitted()],
  "Mutation.CreateConquest": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdateConquest": [isAuthenticated(), isAclPermitted()],
  "Query.ViewCompanyInfo": [isAuthenticated(), isAclPermitted()],
  "Query.ViewTreasuryHistory": [isAuthenticated(), isAclPermitted()],
};

// Offer
const OfferResolverComposition = {
  "Mutation.CreateOffer": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdateOffer": [isAuthenticated(), isAclPermitted()], // filters out actions based on ACL
  "Query.ListOffers": [isAuthenticated(), isAclPermitted()],
  "Query.ViewOffer": [isAuthenticated(), isAclPermitted()],
  "Query.ViewOfferPerformanceHistory": [isAuthenticated(), isAclPermitted()],
};

// Affilliate Tournament
const AffilliateResolverComposition = {
  "Mutation.UpgradeToAffilliate": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdateAffilliateInfo": [isAuthenticated(), isAclPermitted()],
  "Mutation.CreateTournament": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdateTournament": [isAuthenticated(), isAclPermitted()], // filters out actions based on ACL
  "Mutation.AddPromoter": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdatePromoter": [isAuthenticated(), isAclPermitted()],
  "Mutation.RemovePromoter": [isAuthenticated(), isAclPermitted()],
  "Mutation.AddOffer": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdateOffer": [isAuthenticated(), isAclPermitted()],
  "Mutation.RemoveOffer": [isAuthenticated(), isAclPermitted()],
  "Mutation.GenerateParticipationReward": [isAuthenticated(), isAclPermitted()],
  "Mutation.UpdateTournamentParticipantStatus": [
    isAuthenticated(),
    isAclPermitted(),
  ],
  "Query.ViewOrganizer": [isAuthenticated(), isAclPermitted()],
  "Query.ListTournaments": [isAuthenticated(), isAclPermitted()],
  "Query.ViewTournament": [isAuthenticated(), isAclPermitted()],
  "Query.ViewAffiliatePerformanceHistory": [
    isAuthenticated(),
    isAclPermitted(),
  ],
  "Query.ViewOrganizerPayoutHistory": [isAuthenticated(), isAclPermitted()],
};

// Promoter
const PromoterResolverComposition = {
  "Mutation.LeaveTournament": [isAuthenticated(), isAclPermitted()],
  "Mutation.GenerateInviteGraphic": [isAuthenticated(), isAclPermitted()],
  "Query.ViewPromoter": [isAuthenticated(), isAclPermitted()],
  "Query.ListTournaments": [isAuthenticated(), isAclPermitted()],
  "Query.ViewTournament": [isAuthenticated(), isAclPermitted()],
  "Query.ViewPromoterPayoutHistory": [isAuthenticated(), isAclPermitted()],
};
