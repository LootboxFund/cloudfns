import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AccountNumber: any;
  BigInt: any;
  Byte: any;
  CountryCode: any;
  Currency: any;
  DID: any;
  Date: any;
  DateTime: any;
  Duration: any;
  EmailAddress: any;
  GUID: any;
  HSL: any;
  HSLA: any;
  HexColorCode: any;
  Hexadecimal: any;
  IBAN: any;
  IPv4: any;
  IPv6: any;
  ISBN: any;
  ISO8601Duration: any;
  JSON: any;
  JSONObject: any;
  JWT: any;
  Latitude: any;
  LocalDate: any;
  LocalEndTime: any;
  LocalTime: any;
  Locale: any;
  Long: any;
  Longitude: any;
  MAC: any;
  NegativeFloat: any;
  NegativeInt: any;
  NonEmptyString: any;
  NonNegativeFloat: any;
  NonNegativeInt: any;
  NonPositiveFloat: any;
  NonPositiveInt: any;
  ObjectID: any;
  PhoneNumber: any;
  Port: any;
  PositiveFloat: any;
  PositiveInt: any;
  PostalCode: any;
  RGB: any;
  RGBA: any;
  RoutingNumber: any;
  SafeInt: any;
  Time: any;
  TimeZone: any;
  Timestamp: any;
  URL: any;
  USCurrency: any;
  UUID: any;
  UnsignedFloat: any;
  UnsignedInt: any;
  UtcOffset: any;
  Void: any;
};

export type AddStreamPayload = {
  stream: StreamInput;
  tournamentId: Scalars['ID'];
};

export type AddStreamResponse = AddStreamResponseSuccess | ResponseError;

export type AddStreamResponseSuccess = {
  __typename?: 'AddStreamResponseSuccess';
  stream: Stream;
};

export type AuthenticateWalletPayload = {
  message: Scalars['String'];
  signedMessage: Scalars['String'];
};

export type AuthenticateWalletResponse = AuthenticateWalletResponseSuccess | ResponseError;

export type AuthenticateWalletResponseSuccess = {
  __typename?: 'AuthenticateWalletResponseSuccess';
  token: Scalars['String'];
};

export type BattleFeedEdge = {
  __typename?: 'BattleFeedEdge';
  cursor: Scalars['ID'];
  node: Tournament;
};

export type BattleFeedResponse = BattleFeedResponseSuccess | ResponseError;

export type BattleFeedResponseSuccess = {
  __typename?: 'BattleFeedResponseSuccess';
  edges: Array<BattleFeedEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type BulkCreateReferralPayload = {
  campaignName?: InputMaybe<Scalars['String']>;
  numReferrals: Scalars['Int'];
  partyBasketId?: InputMaybe<Scalars['ID']>;
  referrerId?: InputMaybe<Scalars['ID']>;
  tournamentId: Scalars['ID'];
  type: ReferralType;
};

export type BulkCreateReferralResponse = BulkCreateReferralResponseSuccess | ResponseError;

export type BulkCreateReferralResponseSuccess = {
  __typename?: 'BulkCreateReferralResponseSuccess';
  csv: Scalars['String'];
};

export type BulkReferralCsvRow = {
  __typename?: 'BulkReferralCSVRow';
  error: Scalars['String'];
  url: Scalars['String'];
};

export type BulkWhitelistPayload = {
  partyBasketAddress: Scalars['ID'];
  whitelistAddresses: Array<Scalars['ID']>;
};

export type BulkWhitelistResponse = BulkWhitelistResponseSuccess | ResponseError;

export type BulkWhitelistResponseSuccess = {
  __typename?: 'BulkWhitelistResponseSuccess';
  errors?: Maybe<Array<Maybe<Scalars['String']>>>;
  signatures: Array<Maybe<Scalars['String']>>;
};

export type Claim = {
  __typename?: 'Claim';
  chosenPartyBasket?: Maybe<PartyBasket>;
  chosenPartyBasketAddress?: Maybe<Scalars['ID']>;
  chosenPartyBasketId?: Maybe<Scalars['ID']>;
  chosenPartyBasketNFTBountyValue?: Maybe<Scalars['String']>;
  chosenPartyBasketName?: Maybe<Scalars['String']>;
  claimerUserId?: Maybe<Scalars['ID']>;
  id: Scalars['ID'];
  lootboxAddress?: Maybe<Scalars['ID']>;
  lootboxName?: Maybe<Scalars['String']>;
  originPartyBasketId?: Maybe<Scalars['ID']>;
  referralCampaignName?: Maybe<Scalars['String']>;
  referralId: Scalars['ID'];
  referralSlug: Scalars['ID'];
  referralType?: Maybe<ReferralType>;
  referrerId?: Maybe<Scalars['ID']>;
  rewardFromClaim?: Maybe<Scalars['ID']>;
  rewardFromFriendReferred?: Maybe<Scalars['ID']>;
  status: ClaimStatus;
  timestamps: ClaimTimestamps;
  tournament?: Maybe<Tournament>;
  tournamentId: Scalars['ID'];
  tournamentName?: Maybe<Scalars['String']>;
  type: ClaimType;
  userLink?: Maybe<PublicUser>;
};

export type ClaimEdge = {
  __typename?: 'ClaimEdge';
  cursor: Scalars['Timestamp'];
  node: Claim;
};

export type ClaimPageInfo = {
  __typename?: 'ClaimPageInfo';
  endCursor?: Maybe<Scalars['Timestamp']>;
  hasNextPage: Scalars['Boolean'];
};

export enum ClaimStatus {
  Complete = 'complete',
  Pending = 'pending',
  PendingVerification = 'pending_verification',
  VerificationSent = 'verification_sent'
}

export type ClaimTimestamps = {
  __typename?: 'ClaimTimestamps';
  completedAt?: Maybe<Scalars['Timestamp']>;
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  updatedAt: Scalars['Timestamp'];
};

export enum ClaimType {
  OneTime = 'one_time',
  Referral = 'referral',
  Reward = 'reward'
}

export type ClaimsCsvRow = {
  __typename?: 'ClaimsCsvRow';
  claimCreatedAt: Scalars['Timestamp'];
  claimId: Scalars['String'];
  claimStatus: ClaimStatus;
  claimType: ClaimType;
  claimUpdatedAt: Scalars['Timestamp'];
  claimerId: Scalars['String'];
  claimerProfileLink: Scalars['String'];
  claimerSocial_Discord: Scalars['String'];
  claimerSocial_Facebook: Scalars['String'];
  claimerSocial_Instagram: Scalars['String'];
  claimerSocial_Snapchat: Scalars['String'];
  claimerSocial_TikTok: Scalars['String'];
  claimerSocial_Twitch: Scalars['String'];
  claimerSocial_Twitter: Scalars['String'];
  claimerSocial_Web: Scalars['String'];
  claimerUsername: Scalars['String'];
  lootboxAddress: Scalars['String'];
  lootboxLink: Scalars['String'];
  lootboxName: Scalars['String'];
  originPartyBasketId: Scalars['String'];
  partyBasketAddress: Scalars['String'];
  partyBasketId: Scalars['String'];
  partyBasketManageLink: Scalars['String'];
  partyBasketNFTBountyValue: Scalars['String'];
  partyBasketName: Scalars['String'];
  partyBasketRedeemLink: Scalars['String'];
  referralCampaignName: Scalars['String'];
  referralId: Scalars['String'];
  referralLink: Scalars['String'];
  referralSlug: Scalars['String'];
  referralType: Scalars['String'];
  referrerId: Scalars['String'];
  referrerProfileLink: Scalars['String'];
  referrerSocial_Discord: Scalars['String'];
  referrerSocial_Facebook: Scalars['String'];
  referrerSocial_Instagram: Scalars['String'];
  referrerSocial_Snapchat: Scalars['String'];
  referrerSocial_TikTok: Scalars['String'];
  referrerSocial_Twitch: Scalars['String'];
  referrerSocial_Twitter: Scalars['String'];
  referrerSocial_Web: Scalars['String'];
  referrerUsername: Scalars['String'];
  rewardFromClaim: Scalars['String'];
  rewardFromFriendReferred: Scalars['String'];
  tournamentId: Scalars['String'];
  tournamentName: Scalars['String'];
};

export type CompleteClaimPayload = {
  chosenPartyBasketId: Scalars['ID'];
  claimId: Scalars['ID'];
};

export type CompleteClaimResponse = CompleteClaimResponseSuccess | ResponseError;

export type CompleteClaimResponseSuccess = {
  __typename?: 'CompleteClaimResponseSuccess';
  claim: Claim;
};

export type ConnectWalletPayload = {
  message: Scalars['String'];
  signedMessage: Scalars['String'];
};

export type ConnectWalletResponse = ConnectWalletResponseSuccess | ResponseError;

export type ConnectWalletResponseSuccess = {
  __typename?: 'ConnectWalletResponseSuccess';
  wallet: Wallet;
};

export type CreateClaimPayload = {
  referralSlug: Scalars['ID'];
};

export type CreateClaimResponse = CreateClaimResponseSuccess | ResponseError;

export type CreateClaimResponseSuccess = {
  __typename?: 'CreateClaimResponseSuccess';
  claim: Claim;
};

export type CreatePartyBasketPayload = {
  address: Scalars['ID'];
  chainIdHex: Scalars['String'];
  creatorAddress: Scalars['ID'];
  factory: Scalars['ID'];
  joinCommunityUrl?: InputMaybe<Scalars['String']>;
  lootboxAddress: Scalars['ID'];
  maxClaimsAllowed: Scalars['Int'];
  name: Scalars['String'];
  nftBountyValue?: InputMaybe<Scalars['String']>;
};

export type CreatePartyBasketResponse = CreatePartyBasketResponseSuccess | ResponseError;

export type CreatePartyBasketResponseSuccess = {
  __typename?: 'CreatePartyBasketResponseSuccess';
  partyBasket: PartyBasket;
};

export type CreateReferralPayload = {
  campaignName?: InputMaybe<Scalars['String']>;
  partyBasketId?: InputMaybe<Scalars['ID']>;
  tournamentId: Scalars['ID'];
  type?: InputMaybe<ReferralType>;
};

export type CreateReferralResponse = CreateReferralResponseSuccess | ResponseError;

export type CreateReferralResponseSuccess = {
  __typename?: 'CreateReferralResponseSuccess';
  referral: Referral;
};

export type CreateTournamentPayload = {
  communityURL?: InputMaybe<Scalars['String']>;
  coverPhoto?: InputMaybe<Scalars['String']>;
  description: Scalars['String'];
  prize?: InputMaybe<Scalars['String']>;
  streams?: InputMaybe<Array<StreamInput>>;
  title: Scalars['String'];
  tournamentDate: Scalars['Timestamp'];
  tournamentLink?: InputMaybe<Scalars['String']>;
};

export type CreateTournamentResponse = CreateTournamentResponseSuccess | ResponseError;

export type CreateTournamentResponseSuccess = {
  __typename?: 'CreateTournamentResponseSuccess';
  tournament: Tournament;
};

export type CreateUserResponse = CreateUserResponseSuccess | ResponseError;

export type CreateUserResponseSuccess = {
  __typename?: 'CreateUserResponseSuccess';
  user: User;
};

export type CreateUserWithPasswordPayload = {
  email: Scalars['EmailAddress'];
  password: Scalars['String'];
  phoneNumber?: InputMaybe<Scalars['PhoneNumber']>;
};

export type CreateUserWithWalletPayload = {
  email: Scalars['EmailAddress'];
  message: Scalars['String'];
  phoneNumber?: InputMaybe<Scalars['PhoneNumber']>;
  signedMessage: Scalars['String'];
};

export type DeleteStreamResponse = DeleteStreamResponseSuccess | ResponseError;

export type DeleteStreamResponseSuccess = {
  __typename?: 'DeleteStreamResponseSuccess';
  stream: Stream;
};

export type DeleteTournamentResponse = DeleteTournamentResponseSuccess | ResponseError;

export type DeleteTournamentResponseSuccess = {
  __typename?: 'DeleteTournamentResponseSuccess';
  tournament: Tournament;
};

export type EditPartyBasketPayload = {
  id: Scalars['String'];
  joinCommunityUrl?: InputMaybe<Scalars['String']>;
  maxClaimsAllowed?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  nftBountyValue?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<PartyBasketStatus>;
};

export type EditPartyBasketResponse = EditPartyBasketResponseSuccess | ResponseError;

export type EditPartyBasketResponseSuccess = {
  __typename?: 'EditPartyBasketResponseSuccess';
  partyBasket: PartyBasket;
};

export type EditStreamPayload = {
  id: Scalars['ID'];
  name: Scalars['String'];
  type: StreamType;
  url: Scalars['String'];
};

export type EditStreamResponse = EditStreamResponseSuccess | ResponseError;

export type EditStreamResponseSuccess = {
  __typename?: 'EditStreamResponseSuccess';
  stream: Stream;
};

export type EditTournamentPayload = {
  communityURL?: InputMaybe<Scalars['String']>;
  coverPhoto?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  magicLink?: InputMaybe<Scalars['String']>;
  prize?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  tournamentDate?: InputMaybe<Scalars['Timestamp']>;
  tournamentLink?: InputMaybe<Scalars['String']>;
};

export type EditTournamentResponse = EditTournamentResponseSuccess | ResponseError;

export type EditTournamentResponseSuccess = {
  __typename?: 'EditTournamentResponseSuccess';
  tournament: Tournament;
};

export type GenerateClaimsCsvPayload = {
  tournamentId: Scalars['ID'];
};

export type GenerateClaimsCsvResponse = GenerateClaimsCsvResponseSuccess | ResponseError;

export type GenerateClaimsCsvResponseSuccess = {
  __typename?: 'GenerateClaimsCsvResponseSuccess';
  csv: Scalars['String'];
};

export type GetLootboxByAddressResponse = LootboxResponseSuccess | ResponseError;

export type GetMyProfileResponse = GetMyProfileSuccess | ResponseError;

export type GetMyProfileSuccess = {
  __typename?: 'GetMyProfileSuccess';
  user: User;
};

export type GetPartyBasketResponse = GetPartyBasketResponseSuccess | ResponseError;

export type GetPartyBasketResponseSuccess = {
  __typename?: 'GetPartyBasketResponseSuccess';
  partyBasket: PartyBasket;
};

export type GetWhitelistSignaturesPayload = {
  message: Scalars['String'];
  signedMessage: Scalars['String'];
};

export type GetWhitelistSignaturesResponse = GetWhitelistSignaturesResponseSuccess | ResponseError;

export type GetWhitelistSignaturesResponseSuccess = {
  __typename?: 'GetWhitelistSignaturesResponseSuccess';
  signatures: Array<Maybe<PartyBasketWhitelistSignature>>;
};

export type Lootbox = {
  __typename?: 'Lootbox';
  address: Scalars['ID'];
  chainIdHex: Scalars['String'];
  factory: Scalars['ID'];
  issuer: Scalars['ID'];
  maxSharesSold: Scalars['String'];
  metadata: LootboxMetadata;
  metadataDownloadUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  partyBaskets?: Maybe<Array<PartyBasket>>;
  targetSharesSold: Scalars['String'];
  timestamps: LootboxTimestamps;
  tournamentId?: Maybe<Scalars['ID']>;
  tournamentMetadata?: Maybe<TournamentMetadata>;
  treasury: Scalars['ID'];
  variant: LootboxVariant;
};

export type LootboxChain = {
  __typename?: 'LootboxChain';
  address: Scalars['ID'];
  chainIdDecimal: Scalars['String'];
  chainIdHex: Scalars['String'];
  chainName: Scalars['String'];
  title: Scalars['String'];
};

export type LootboxCustomSchema = {
  __typename?: 'LootboxCustomSchema';
  chain: LootboxChain;
  lootbox: LootboxCustomSchemaData;
  socials: LootboxSocials;
  version: Scalars['String'];
};

export type LootboxCustomSchemaData = {
  __typename?: 'LootboxCustomSchemaData';
  backgroundColor: Scalars['String'];
  backgroundImage: Scalars['String'];
  badgeImage: Scalars['String'];
  basisPointsReturnTarget: Scalars['String'];
  blockNumber: Scalars['String'];
  createdAt: Scalars['Timestamp'];
  description: Scalars['String'];
  factory: Scalars['ID'];
  fundraisingTarget: Scalars['String'];
  fundraisingTargetMax: Scalars['String'];
  image: Scalars['String'];
  lootboxThemeColor: Scalars['String'];
  name: Scalars['String'];
  pricePerShare: Scalars['String'];
  returnAmountTarget: Scalars['String'];
  targetPaybackDate?: Maybe<Scalars['Timestamp']>;
  tournamentId?: Maybe<Scalars['ID']>;
  transactionHash: Scalars['String'];
};

export type LootboxFeedEdge = {
  __typename?: 'LootboxFeedEdge';
  cursor: Scalars['ID'];
  node: LootboxSnapshot;
};

export type LootboxFeedResponse = LootboxFeedResponseSuccess | ResponseError;

export type LootboxFeedResponseSuccess = {
  __typename?: 'LootboxFeedResponseSuccess';
  edges: Array<LootboxFeedEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type LootboxMetadata = {
  __typename?: 'LootboxMetadata';
  animation_url?: Maybe<Scalars['String']>;
  background_color: Scalars['String'];
  description: Scalars['String'];
  external_url: Scalars['String'];
  image: Scalars['String'];
  lootboxCustomSchema?: Maybe<LootboxCustomSchema>;
  name: Scalars['String'];
  youtube_url?: Maybe<Scalars['String']>;
};

export type LootboxResponseSuccess = {
  __typename?: 'LootboxResponseSuccess';
  lootbox: Lootbox;
};

export type LootboxSnapshot = {
  __typename?: 'LootboxSnapshot';
  address: Scalars['ID'];
  backgroundColor: Scalars['String'];
  backgroundImage: Scalars['String'];
  description: Scalars['String'];
  image: Scalars['String'];
  issuer: Scalars['ID'];
  metadataDownloadUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  stampImage?: Maybe<Scalars['String']>;
  timestamps: LootboxSnapshotTimestamps;
};

export type LootboxSnapshotTimestamps = {
  __typename?: 'LootboxSnapshotTimestamps';
  createdAt: Scalars['Timestamp'];
  updatedAt: Scalars['Timestamp'];
};

export type LootboxSocials = {
  __typename?: 'LootboxSocials';
  discord?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  facebook?: Maybe<Scalars['String']>;
  instagram?: Maybe<Scalars['String']>;
  snapchat?: Maybe<Scalars['String']>;
  tiktok?: Maybe<Scalars['String']>;
  twitch?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  web?: Maybe<Scalars['String']>;
  youtube?: Maybe<Scalars['String']>;
};

export type LootboxSocialsWithoutEmail = {
  __typename?: 'LootboxSocialsWithoutEmail';
  discord?: Maybe<Scalars['String']>;
  facebook?: Maybe<Scalars['String']>;
  instagram?: Maybe<Scalars['String']>;
  snapchat?: Maybe<Scalars['String']>;
  tiktok?: Maybe<Scalars['String']>;
  twitch?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  web?: Maybe<Scalars['String']>;
  youtube?: Maybe<Scalars['String']>;
};

export type LootboxTimestamps = {
  __typename?: 'LootboxTimestamps';
  createdAt: Scalars['Timestamp'];
  indexedAt: Scalars['Timestamp'];
  updatedAt: Scalars['Timestamp'];
};

export type LootboxTournamentSnapshot = {
  __typename?: 'LootboxTournamentSnapshot';
  address: Scalars['ID'];
  backgroundColor: Scalars['String'];
  backgroundImage: Scalars['String'];
  description: Scalars['String'];
  image: Scalars['String'];
  issuer: Scalars['ID'];
  metadataDownloadUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  partyBaskets?: Maybe<Array<PartyBasket>>;
  socials: LootboxSocialsWithoutEmail;
  stampImage: Scalars['String'];
  status: LootboxTournamentStatus;
  timestamps: LootboxSnapshotTimestamps;
};

export enum LootboxTournamentStatus {
  Active = 'active',
  Pending = 'pending',
  Rejected = 'rejected'
}

export enum LootboxVariant {
  Escrow = 'escrow',
  Instant = 'instant'
}

export type Mutation = {
  __typename?: 'Mutation';
  addStream: AddStreamResponse;
  authenticateWallet: AuthenticateWalletResponse;
  bulkCreateReferral: BulkCreateReferralResponse;
  bulkWhitelist: BulkWhitelistResponse;
  completeClaim: CompleteClaimResponse;
  connectWallet: ConnectWalletResponse;
  createClaim: CreateClaimResponse;
  createPartyBasket: CreatePartyBasketResponse;
  createReferral: CreateReferralResponse;
  createTournament: CreateTournamentResponse;
  createUserRecord: CreateUserResponse;
  createUserWithPassword: CreateUserResponse;
  createUserWithWallet: CreateUserResponse;
  deleteStream: DeleteStreamResponse;
  deleteTournament: DeleteTournamentResponse;
  editPartyBasket: EditPartyBasketResponse;
  editStream: EditStreamResponse;
  editTournament: EditTournamentResponse;
  generateClaimsCsv: GenerateClaimsCsvResponse;
  getWhitelistSignatures: GetWhitelistSignaturesResponse;
  redeemSignature: RedeemSignatureResponse;
  removeWallet: RemoveWalletResponse;
  updateUser: UpdateUserResponse;
  version: Scalars['ID'];
};


export type MutationAddStreamArgs = {
  payload: AddStreamPayload;
};


export type MutationAuthenticateWalletArgs = {
  payload: AuthenticateWalletPayload;
};


export type MutationBulkCreateReferralArgs = {
  payload: BulkCreateReferralPayload;
};


export type MutationBulkWhitelistArgs = {
  payload: BulkWhitelistPayload;
};


export type MutationCompleteClaimArgs = {
  payload: CompleteClaimPayload;
};


export type MutationConnectWalletArgs = {
  payload: ConnectWalletPayload;
};


export type MutationCreateClaimArgs = {
  payload: CreateClaimPayload;
};


export type MutationCreatePartyBasketArgs = {
  payload: CreatePartyBasketPayload;
};


export type MutationCreateReferralArgs = {
  payload: CreateReferralPayload;
};


export type MutationCreateTournamentArgs = {
  payload: CreateTournamentPayload;
};


export type MutationCreateUserWithPasswordArgs = {
  payload: CreateUserWithPasswordPayload;
};


export type MutationCreateUserWithWalletArgs = {
  payload: CreateUserWithWalletPayload;
};


export type MutationDeleteStreamArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTournamentArgs = {
  id: Scalars['ID'];
};


export type MutationEditPartyBasketArgs = {
  payload: EditPartyBasketPayload;
};


export type MutationEditStreamArgs = {
  payload: EditStreamPayload;
};


export type MutationEditTournamentArgs = {
  payload: EditTournamentPayload;
};


export type MutationGenerateClaimsCsvArgs = {
  payload: GenerateClaimsCsvPayload;
};


export type MutationGetWhitelistSignaturesArgs = {
  payload: GetWhitelistSignaturesPayload;
};


export type MutationRedeemSignatureArgs = {
  payload: RedeemSignaturePayload;
};


export type MutationRemoveWalletArgs = {
  payload: RemoveWalletPayload;
};


export type MutationUpdateUserArgs = {
  payload: UpdateUserPayload;
};

export type MyTournamentResponse = MyTournamentResponseSuccess | ResponseError;

export type MyTournamentResponseSuccess = {
  __typename?: 'MyTournamentResponseSuccess';
  tournament: Tournament;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
};

export type PartyBasket = {
  __typename?: 'PartyBasket';
  address: Scalars['ID'];
  chainIdHex: Scalars['String'];
  creatorAddress: Scalars['ID'];
  creatorId: Scalars['ID'];
  factory: Scalars['ID'];
  id: Scalars['ID'];
  joinCommunityUrl?: Maybe<Scalars['String']>;
  lootboxAddress: Scalars['ID'];
  lootboxSnapshot?: Maybe<LootboxSnapshot>;
  maxClaimsAllowed?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  nftBountyValue?: Maybe<Scalars['String']>;
  runningCompletedClaims?: Maybe<Scalars['Int']>;
  status?: Maybe<PartyBasketStatus>;
  timestamps: PartyBasketTimestamps;
};

export enum PartyBasketStatus {
  Active = 'active',
  Disabled = 'disabled',
  SoldOut = 'soldOut'
}

export type PartyBasketTimestamps = {
  __typename?: 'PartyBasketTimestamps';
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  updatedAt: Scalars['Timestamp'];
};

export type PartyBasketWhitelistSignature = {
  __typename?: 'PartyBasketWhitelistSignature';
  id: Scalars['ID'];
  isRedeemed: Scalars['Boolean'];
  nonce: Scalars['String'];
  partyBasketAddress: Scalars['ID'];
  signature: Scalars['String'];
  signer: Scalars['ID'];
  timestamps: PartyBasketTimestamps;
  whitelistedAddress: Scalars['ID'];
};

export type PublicUser = {
  __typename?: 'PublicUser';
  avatar?: Maybe<Scalars['String']>;
  biography?: Maybe<Scalars['String']>;
  claims?: Maybe<UserClaimsResponseSuccess>;
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  headshot?: Maybe<Array<Scalars['String']>>;
  id: Scalars['ID'];
  socials?: Maybe<UserSocials>;
  updatedAt: Scalars['Timestamp'];
  username?: Maybe<Scalars['String']>;
};


export type PublicUserClaimsArgs = {
  after?: InputMaybe<Scalars['Timestamp']>;
  first: Scalars['Int'];
};

export type PublicUserResponse = PublicUserResponseSuccess | ResponseError;

export type PublicUserResponseSuccess = {
  __typename?: 'PublicUserResponseSuccess';
  user: PublicUser;
};

export type Query = {
  __typename?: 'Query';
  battleFeed: BattleFeedResponse;
  getLootboxByAddress: GetLootboxByAddressResponse;
  getMyProfile: GetMyProfileResponse;
  getPartyBasket: GetPartyBasketResponse;
  lootboxFeed: LootboxFeedResponse;
  myTournament: MyTournamentResponse;
  publicUser: PublicUserResponse;
  referral: ReferralResponse;
  tournament: TournamentResponse;
  /** @deprecated Use public user resolver */
  userClaims: UserClaimsResponse;
  version: Scalars['ID'];
};


export type QueryBattleFeedArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first: Scalars['Int'];
};


export type QueryGetLootboxByAddressArgs = {
  address: Scalars['ID'];
};


export type QueryGetPartyBasketArgs = {
  address: Scalars['ID'];
};


export type QueryLootboxFeedArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first: Scalars['Int'];
};


export type QueryMyTournamentArgs = {
  id: Scalars['ID'];
};


export type QueryPublicUserArgs = {
  id: Scalars['ID'];
};


export type QueryReferralArgs = {
  slug: Scalars['ID'];
};


export type QueryTournamentArgs = {
  id: Scalars['ID'];
};


export type QueryUserClaimsArgs = {
  after?: InputMaybe<Scalars['Timestamp']>;
  first: Scalars['Int'];
  userId: Scalars['ID'];
};

export type RedeemSignaturePayload = {
  message: Scalars['String'];
  partyBasketId: Scalars['ID'];
  signatureId: Scalars['ID'];
  signedMessage: Scalars['String'];
};

export type RedeemSignatureResponse = RedeemSignatureResponseSuccess | ResponseError;

export type RedeemSignatureResponseSuccess = {
  __typename?: 'RedeemSignatureResponseSuccess';
  signature: PartyBasketWhitelistSignature;
};

export type Referral = {
  __typename?: 'Referral';
  campaignName: Scalars['String'];
  claims?: Maybe<Array<Claim>>;
  creatorId: Scalars['ID'];
  id: Scalars['ID'];
  /** @deprecated Use ReferralType instead */
  isRewardDisabled?: Maybe<Scalars['Boolean']>;
  nConversions: Scalars['Int'];
  referrerId: Scalars['ID'];
  seedPartyBasket?: Maybe<PartyBasket>;
  seedPartyBasketId?: Maybe<Scalars['ID']>;
  slug: Scalars['ID'];
  timestamps: ReferralTimestamps;
  tournament?: Maybe<Tournament>;
  tournamentId: Scalars['ID'];
  type?: Maybe<ReferralType>;
};

export type ReferralResponse = ReferralResponseSuccess | ResponseError;

export type ReferralResponseSuccess = {
  __typename?: 'ReferralResponseSuccess';
  referral: Referral;
};

export type ReferralTimestamps = {
  __typename?: 'ReferralTimestamps';
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  updatedAt: Scalars['Timestamp'];
};

export enum ReferralType {
  Genesis = 'genesis',
  OneTime = 'one_time',
  Viral = 'viral'
}

export type RemoveWalletPayload = {
  id: Scalars['ID'];
};

export type RemoveWalletResponse = RemoveWalletResponseSuccess | ResponseError;

export type RemoveWalletResponseSuccess = {
  __typename?: 'RemoveWalletResponseSuccess';
  id: Scalars['ID'];
};

export type ResponseError = {
  __typename?: 'ResponseError';
  error: Status;
};

export type Status = {
  __typename?: 'Status';
  code: StatusCode;
  message: Scalars['String'];
};

export enum StatusCode {
  BadRequest = 'BadRequest',
  Forbidden = 'Forbidden',
  InvalidOperation = 'InvalidOperation',
  NotFound = 'NotFound',
  NotImplemented = 'NotImplemented',
  ServerError = 'ServerError',
  Success = 'Success',
  Unauthorized = 'Unauthorized'
}

export type Stream = {
  __typename?: 'Stream';
  creatorId: Scalars['ID'];
  id: Scalars['ID'];
  name: Scalars['String'];
  timestamps: StreamTimestamps;
  tournamentId: Scalars['ID'];
  type: StreamType;
  url: Scalars['String'];
};

export type StreamInput = {
  name: Scalars['String'];
  type: StreamType;
  url: Scalars['String'];
};

export type StreamTimestamps = {
  __typename?: 'StreamTimestamps';
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  updatedAt: Scalars['Timestamp'];
};

export enum StreamType {
  Discord = 'discord',
  Facebook = 'facebook',
  Twitch = 'twitch',
  Youtube = 'youtube'
}

export type Tournament = {
  __typename?: 'Tournament';
  communityURL?: Maybe<Scalars['String']>;
  coverPhoto?: Maybe<Scalars['String']>;
  creatorId: Scalars['ID'];
  description: Scalars['String'];
  id: Scalars['ID'];
  lootboxSnapshots?: Maybe<Array<LootboxTournamentSnapshot>>;
  magicLink?: Maybe<Scalars['String']>;
  prize?: Maybe<Scalars['String']>;
  streams?: Maybe<Array<Stream>>;
  timestamps: TournamentTimestamps;
  title: Scalars['String'];
  tournamentDate?: Maybe<Scalars['Timestamp']>;
  tournamentLink?: Maybe<Scalars['String']>;
};

export type TournamentMetadata = {
  __typename?: 'TournamentMetadata';
  status: LootboxTournamentStatus;
};

export type TournamentResponse = ResponseError | TournamentResponseSuccess;

export type TournamentResponseSuccess = {
  __typename?: 'TournamentResponseSuccess';
  tournament: Tournament;
};

export type TournamentTimestamps = {
  __typename?: 'TournamentTimestamps';
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  updatedAt: Scalars['Timestamp'];
};

export type UpdateUserPayload = {
  avatar?: InputMaybe<Scalars['String']>;
  biography?: InputMaybe<Scalars['String']>;
  headshot?: InputMaybe<Scalars['String']>;
  socials?: InputMaybe<UserSocialsInput>;
  username?: InputMaybe<Scalars['String']>;
};

export type UpdateUserResponse = ResponseError | UpdateUserResponseSuccess;

export type UpdateUserResponseSuccess = {
  __typename?: 'UpdateUserResponseSuccess';
  user: User;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  biography?: Maybe<Scalars['String']>;
  createdAt: Scalars['Timestamp'];
  deletedAt?: Maybe<Scalars['Timestamp']>;
  email?: Maybe<Scalars['String']>;
  headshot?: Maybe<Array<Scalars['String']>>;
  id: Scalars['ID'];
  partyBaskets?: Maybe<Array<PartyBasket>>;
  phoneNumber?: Maybe<Scalars['String']>;
  socials?: Maybe<UserSocials>;
  tournaments?: Maybe<Array<Tournament>>;
  updatedAt: Scalars['Timestamp'];
  username?: Maybe<Scalars['String']>;
  wallets?: Maybe<Array<Wallet>>;
};

export type UserClaimsResponse = ResponseError | UserClaimsResponseSuccess;

export type UserClaimsResponseSuccess = {
  __typename?: 'UserClaimsResponseSuccess';
  edges: Array<ClaimEdge>;
  pageInfo: ClaimPageInfo;
  totalCount: Scalars['Int'];
};

export type UserSocials = {
  __typename?: 'UserSocials';
  discord?: Maybe<Scalars['String']>;
  facebook?: Maybe<Scalars['String']>;
  instagram?: Maybe<Scalars['String']>;
  snapchat?: Maybe<Scalars['String']>;
  tiktok?: Maybe<Scalars['String']>;
  twitch?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  web?: Maybe<Scalars['String']>;
};

export type UserSocialsInput = {
  discord?: InputMaybe<Scalars['String']>;
  facebook?: InputMaybe<Scalars['String']>;
  instagram?: InputMaybe<Scalars['String']>;
  snapchat?: InputMaybe<Scalars['String']>;
  tiktok?: InputMaybe<Scalars['String']>;
  twitch?: InputMaybe<Scalars['String']>;
  twitter?: InputMaybe<Scalars['String']>;
  web?: InputMaybe<Scalars['String']>;
};

export type Wallet = {
  __typename?: 'Wallet';
  address: Scalars['String'];
  createdAt: Scalars['Timestamp'];
  id: Scalars['ID'];
  lootboxSnapshots?: Maybe<Array<LootboxSnapshot>>;
  userId: Scalars['ID'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccountNumber: ResolverTypeWrapper<Scalars['AccountNumber']>;
  AddStreamPayload: AddStreamPayload;
  AddStreamResponse: ResolversTypes['AddStreamResponseSuccess'] | ResolversTypes['ResponseError'];
  AddStreamResponseSuccess: ResolverTypeWrapper<AddStreamResponseSuccess>;
  AuthenticateWalletPayload: AuthenticateWalletPayload;
  AuthenticateWalletResponse: ResolversTypes['AuthenticateWalletResponseSuccess'] | ResolversTypes['ResponseError'];
  AuthenticateWalletResponseSuccess: ResolverTypeWrapper<AuthenticateWalletResponseSuccess>;
  BattleFeedEdge: ResolverTypeWrapper<BattleFeedEdge>;
  BattleFeedResponse: ResolversTypes['BattleFeedResponseSuccess'] | ResolversTypes['ResponseError'];
  BattleFeedResponseSuccess: ResolverTypeWrapper<BattleFeedResponseSuccess>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BulkCreateReferralPayload: BulkCreateReferralPayload;
  BulkCreateReferralResponse: ResolversTypes['BulkCreateReferralResponseSuccess'] | ResolversTypes['ResponseError'];
  BulkCreateReferralResponseSuccess: ResolverTypeWrapper<BulkCreateReferralResponseSuccess>;
  BulkReferralCSVRow: ResolverTypeWrapper<BulkReferralCsvRow>;
  BulkWhitelistPayload: BulkWhitelistPayload;
  BulkWhitelistResponse: ResolversTypes['BulkWhitelistResponseSuccess'] | ResolversTypes['ResponseError'];
  BulkWhitelistResponseSuccess: ResolverTypeWrapper<BulkWhitelistResponseSuccess>;
  Byte: ResolverTypeWrapper<Scalars['Byte']>;
  Claim: ResolverTypeWrapper<Claim>;
  ClaimEdge: ResolverTypeWrapper<ClaimEdge>;
  ClaimPageInfo: ResolverTypeWrapper<ClaimPageInfo>;
  ClaimStatus: ClaimStatus;
  ClaimTimestamps: ResolverTypeWrapper<ClaimTimestamps>;
  ClaimType: ClaimType;
  ClaimsCsvRow: ResolverTypeWrapper<ClaimsCsvRow>;
  CompleteClaimPayload: CompleteClaimPayload;
  CompleteClaimResponse: ResolversTypes['CompleteClaimResponseSuccess'] | ResolversTypes['ResponseError'];
  CompleteClaimResponseSuccess: ResolverTypeWrapper<CompleteClaimResponseSuccess>;
  ConnectWalletPayload: ConnectWalletPayload;
  ConnectWalletResponse: ResolversTypes['ConnectWalletResponseSuccess'] | ResolversTypes['ResponseError'];
  ConnectWalletResponseSuccess: ResolverTypeWrapper<ConnectWalletResponseSuccess>;
  CountryCode: ResolverTypeWrapper<Scalars['CountryCode']>;
  CreateClaimPayload: CreateClaimPayload;
  CreateClaimResponse: ResolversTypes['CreateClaimResponseSuccess'] | ResolversTypes['ResponseError'];
  CreateClaimResponseSuccess: ResolverTypeWrapper<CreateClaimResponseSuccess>;
  CreatePartyBasketPayload: CreatePartyBasketPayload;
  CreatePartyBasketResponse: ResolversTypes['CreatePartyBasketResponseSuccess'] | ResolversTypes['ResponseError'];
  CreatePartyBasketResponseSuccess: ResolverTypeWrapper<CreatePartyBasketResponseSuccess>;
  CreateReferralPayload: CreateReferralPayload;
  CreateReferralResponse: ResolversTypes['CreateReferralResponseSuccess'] | ResolversTypes['ResponseError'];
  CreateReferralResponseSuccess: ResolverTypeWrapper<CreateReferralResponseSuccess>;
  CreateTournamentPayload: CreateTournamentPayload;
  CreateTournamentResponse: ResolversTypes['CreateTournamentResponseSuccess'] | ResolversTypes['ResponseError'];
  CreateTournamentResponseSuccess: ResolverTypeWrapper<CreateTournamentResponseSuccess>;
  CreateUserResponse: ResolversTypes['CreateUserResponseSuccess'] | ResolversTypes['ResponseError'];
  CreateUserResponseSuccess: ResolverTypeWrapper<CreateUserResponseSuccess>;
  CreateUserWithPasswordPayload: CreateUserWithPasswordPayload;
  CreateUserWithWalletPayload: CreateUserWithWalletPayload;
  Currency: ResolverTypeWrapper<Scalars['Currency']>;
  DID: ResolverTypeWrapper<Scalars['DID']>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteStreamResponse: ResolversTypes['DeleteStreamResponseSuccess'] | ResolversTypes['ResponseError'];
  DeleteStreamResponseSuccess: ResolverTypeWrapper<DeleteStreamResponseSuccess>;
  DeleteTournamentResponse: ResolversTypes['DeleteTournamentResponseSuccess'] | ResolversTypes['ResponseError'];
  DeleteTournamentResponseSuccess: ResolverTypeWrapper<DeleteTournamentResponseSuccess>;
  Duration: ResolverTypeWrapper<Scalars['Duration']>;
  EditPartyBasketPayload: EditPartyBasketPayload;
  EditPartyBasketResponse: ResolversTypes['EditPartyBasketResponseSuccess'] | ResolversTypes['ResponseError'];
  EditPartyBasketResponseSuccess: ResolverTypeWrapper<EditPartyBasketResponseSuccess>;
  EditStreamPayload: EditStreamPayload;
  EditStreamResponse: ResolversTypes['EditStreamResponseSuccess'] | ResolversTypes['ResponseError'];
  EditStreamResponseSuccess: ResolverTypeWrapper<EditStreamResponseSuccess>;
  EditTournamentPayload: EditTournamentPayload;
  EditTournamentResponse: ResolversTypes['EditTournamentResponseSuccess'] | ResolversTypes['ResponseError'];
  EditTournamentResponseSuccess: ResolverTypeWrapper<EditTournamentResponseSuccess>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']>;
  GUID: ResolverTypeWrapper<Scalars['GUID']>;
  GenerateClaimsCsvPayload: GenerateClaimsCsvPayload;
  GenerateClaimsCsvResponse: ResolversTypes['GenerateClaimsCsvResponseSuccess'] | ResolversTypes['ResponseError'];
  GenerateClaimsCsvResponseSuccess: ResolverTypeWrapper<GenerateClaimsCsvResponseSuccess>;
  GetLootboxByAddressResponse: ResolversTypes['LootboxResponseSuccess'] | ResolversTypes['ResponseError'];
  GetMyProfileResponse: ResolversTypes['GetMyProfileSuccess'] | ResolversTypes['ResponseError'];
  GetMyProfileSuccess: ResolverTypeWrapper<GetMyProfileSuccess>;
  GetPartyBasketResponse: ResolversTypes['GetPartyBasketResponseSuccess'] | ResolversTypes['ResponseError'];
  GetPartyBasketResponseSuccess: ResolverTypeWrapper<GetPartyBasketResponseSuccess>;
  GetWhitelistSignaturesPayload: GetWhitelistSignaturesPayload;
  GetWhitelistSignaturesResponse: ResolversTypes['GetWhitelistSignaturesResponseSuccess'] | ResolversTypes['ResponseError'];
  GetWhitelistSignaturesResponseSuccess: ResolverTypeWrapper<GetWhitelistSignaturesResponseSuccess>;
  HSL: ResolverTypeWrapper<Scalars['HSL']>;
  HSLA: ResolverTypeWrapper<Scalars['HSLA']>;
  HexColorCode: ResolverTypeWrapper<Scalars['HexColorCode']>;
  Hexadecimal: ResolverTypeWrapper<Scalars['Hexadecimal']>;
  IBAN: ResolverTypeWrapper<Scalars['IBAN']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  IPv4: ResolverTypeWrapper<Scalars['IPv4']>;
  IPv6: ResolverTypeWrapper<Scalars['IPv6']>;
  ISBN: ResolverTypeWrapper<Scalars['ISBN']>;
  ISO8601Duration: ResolverTypeWrapper<Scalars['ISO8601Duration']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  JWT: ResolverTypeWrapper<Scalars['JWT']>;
  Latitude: ResolverTypeWrapper<Scalars['Latitude']>;
  LocalDate: ResolverTypeWrapper<Scalars['LocalDate']>;
  LocalEndTime: ResolverTypeWrapper<Scalars['LocalEndTime']>;
  LocalTime: ResolverTypeWrapper<Scalars['LocalTime']>;
  Locale: ResolverTypeWrapper<Scalars['Locale']>;
  Long: ResolverTypeWrapper<Scalars['Long']>;
  Longitude: ResolverTypeWrapper<Scalars['Longitude']>;
  Lootbox: ResolverTypeWrapper<Lootbox>;
  LootboxChain: ResolverTypeWrapper<LootboxChain>;
  LootboxCustomSchema: ResolverTypeWrapper<LootboxCustomSchema>;
  LootboxCustomSchemaData: ResolverTypeWrapper<LootboxCustomSchemaData>;
  LootboxFeedEdge: ResolverTypeWrapper<LootboxFeedEdge>;
  LootboxFeedResponse: ResolversTypes['LootboxFeedResponseSuccess'] | ResolversTypes['ResponseError'];
  LootboxFeedResponseSuccess: ResolverTypeWrapper<LootboxFeedResponseSuccess>;
  LootboxMetadata: ResolverTypeWrapper<LootboxMetadata>;
  LootboxResponseSuccess: ResolverTypeWrapper<LootboxResponseSuccess>;
  LootboxSnapshot: ResolverTypeWrapper<LootboxSnapshot>;
  LootboxSnapshotTimestamps: ResolverTypeWrapper<LootboxSnapshotTimestamps>;
  LootboxSocials: ResolverTypeWrapper<LootboxSocials>;
  LootboxSocialsWithoutEmail: ResolverTypeWrapper<LootboxSocialsWithoutEmail>;
  LootboxTimestamps: ResolverTypeWrapper<LootboxTimestamps>;
  LootboxTournamentSnapshot: ResolverTypeWrapper<LootboxTournamentSnapshot>;
  LootboxTournamentStatus: LootboxTournamentStatus;
  LootboxVariant: LootboxVariant;
  MAC: ResolverTypeWrapper<Scalars['MAC']>;
  Mutation: ResolverTypeWrapper<{}>;
  MyTournamentResponse: ResolversTypes['MyTournamentResponseSuccess'] | ResolversTypes['ResponseError'];
  MyTournamentResponseSuccess: ResolverTypeWrapper<MyTournamentResponseSuccess>;
  NegativeFloat: ResolverTypeWrapper<Scalars['NegativeFloat']>;
  NegativeInt: ResolverTypeWrapper<Scalars['NegativeInt']>;
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']>;
  NonNegativeFloat: ResolverTypeWrapper<Scalars['NonNegativeFloat']>;
  NonNegativeInt: ResolverTypeWrapper<Scalars['NonNegativeInt']>;
  NonPositiveFloat: ResolverTypeWrapper<Scalars['NonPositiveFloat']>;
  NonPositiveInt: ResolverTypeWrapper<Scalars['NonPositiveInt']>;
  ObjectID: ResolverTypeWrapper<Scalars['ObjectID']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PartyBasket: ResolverTypeWrapper<PartyBasket>;
  PartyBasketStatus: PartyBasketStatus;
  PartyBasketTimestamps: ResolverTypeWrapper<PartyBasketTimestamps>;
  PartyBasketWhitelistSignature: ResolverTypeWrapper<PartyBasketWhitelistSignature>;
  PhoneNumber: ResolverTypeWrapper<Scalars['PhoneNumber']>;
  Port: ResolverTypeWrapper<Scalars['Port']>;
  PositiveFloat: ResolverTypeWrapper<Scalars['PositiveFloat']>;
  PositiveInt: ResolverTypeWrapper<Scalars['PositiveInt']>;
  PostalCode: ResolverTypeWrapper<Scalars['PostalCode']>;
  PublicUser: ResolverTypeWrapper<PublicUser>;
  PublicUserResponse: ResolversTypes['PublicUserResponseSuccess'] | ResolversTypes['ResponseError'];
  PublicUserResponseSuccess: ResolverTypeWrapper<PublicUserResponseSuccess>;
  Query: ResolverTypeWrapper<{}>;
  RGB: ResolverTypeWrapper<Scalars['RGB']>;
  RGBA: ResolverTypeWrapper<Scalars['RGBA']>;
  RedeemSignaturePayload: RedeemSignaturePayload;
  RedeemSignatureResponse: ResolversTypes['RedeemSignatureResponseSuccess'] | ResolversTypes['ResponseError'];
  RedeemSignatureResponseSuccess: ResolverTypeWrapper<RedeemSignatureResponseSuccess>;
  Referral: ResolverTypeWrapper<Referral>;
  ReferralResponse: ResolversTypes['ReferralResponseSuccess'] | ResolversTypes['ResponseError'];
  ReferralResponseSuccess: ResolverTypeWrapper<ReferralResponseSuccess>;
  ReferralTimestamps: ResolverTypeWrapper<ReferralTimestamps>;
  ReferralType: ReferralType;
  RemoveWalletPayload: RemoveWalletPayload;
  RemoveWalletResponse: ResolversTypes['RemoveWalletResponseSuccess'] | ResolversTypes['ResponseError'];
  RemoveWalletResponseSuccess: ResolverTypeWrapper<RemoveWalletResponseSuccess>;
  ResponseError: ResolverTypeWrapper<ResponseError>;
  RoutingNumber: ResolverTypeWrapper<Scalars['RoutingNumber']>;
  SafeInt: ResolverTypeWrapper<Scalars['SafeInt']>;
  Status: ResolverTypeWrapper<Status>;
  StatusCode: StatusCode;
  Stream: ResolverTypeWrapper<Stream>;
  StreamInput: StreamInput;
  StreamTimestamps: ResolverTypeWrapper<StreamTimestamps>;
  StreamType: StreamType;
  String: ResolverTypeWrapper<Scalars['String']>;
  Time: ResolverTypeWrapper<Scalars['Time']>;
  TimeZone: ResolverTypeWrapper<Scalars['TimeZone']>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']>;
  Tournament: ResolverTypeWrapper<Tournament>;
  TournamentMetadata: ResolverTypeWrapper<TournamentMetadata>;
  TournamentResponse: ResolversTypes['ResponseError'] | ResolversTypes['TournamentResponseSuccess'];
  TournamentResponseSuccess: ResolverTypeWrapper<TournamentResponseSuccess>;
  TournamentTimestamps: ResolverTypeWrapper<TournamentTimestamps>;
  URL: ResolverTypeWrapper<Scalars['URL']>;
  USCurrency: ResolverTypeWrapper<Scalars['USCurrency']>;
  UUID: ResolverTypeWrapper<Scalars['UUID']>;
  UnsignedFloat: ResolverTypeWrapper<Scalars['UnsignedFloat']>;
  UnsignedInt: ResolverTypeWrapper<Scalars['UnsignedInt']>;
  UpdateUserPayload: UpdateUserPayload;
  UpdateUserResponse: ResolversTypes['ResponseError'] | ResolversTypes['UpdateUserResponseSuccess'];
  UpdateUserResponseSuccess: ResolverTypeWrapper<UpdateUserResponseSuccess>;
  User: ResolverTypeWrapper<User>;
  UserClaimsResponse: ResolversTypes['ResponseError'] | ResolversTypes['UserClaimsResponseSuccess'];
  UserClaimsResponseSuccess: ResolverTypeWrapper<UserClaimsResponseSuccess>;
  UserSocials: ResolverTypeWrapper<UserSocials>;
  UserSocialsInput: UserSocialsInput;
  UtcOffset: ResolverTypeWrapper<Scalars['UtcOffset']>;
  Void: ResolverTypeWrapper<Scalars['Void']>;
  Wallet: ResolverTypeWrapper<Wallet>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AccountNumber: Scalars['AccountNumber'];
  AddStreamPayload: AddStreamPayload;
  AddStreamResponse: ResolversParentTypes['AddStreamResponseSuccess'] | ResolversParentTypes['ResponseError'];
  AddStreamResponseSuccess: AddStreamResponseSuccess;
  AuthenticateWalletPayload: AuthenticateWalletPayload;
  AuthenticateWalletResponse: ResolversParentTypes['AuthenticateWalletResponseSuccess'] | ResolversParentTypes['ResponseError'];
  AuthenticateWalletResponseSuccess: AuthenticateWalletResponseSuccess;
  BattleFeedEdge: BattleFeedEdge;
  BattleFeedResponse: ResolversParentTypes['BattleFeedResponseSuccess'] | ResolversParentTypes['ResponseError'];
  BattleFeedResponseSuccess: BattleFeedResponseSuccess;
  BigInt: Scalars['BigInt'];
  Boolean: Scalars['Boolean'];
  BulkCreateReferralPayload: BulkCreateReferralPayload;
  BulkCreateReferralResponse: ResolversParentTypes['BulkCreateReferralResponseSuccess'] | ResolversParentTypes['ResponseError'];
  BulkCreateReferralResponseSuccess: BulkCreateReferralResponseSuccess;
  BulkReferralCSVRow: BulkReferralCsvRow;
  BulkWhitelistPayload: BulkWhitelistPayload;
  BulkWhitelistResponse: ResolversParentTypes['BulkWhitelistResponseSuccess'] | ResolversParentTypes['ResponseError'];
  BulkWhitelistResponseSuccess: BulkWhitelistResponseSuccess;
  Byte: Scalars['Byte'];
  Claim: Claim;
  ClaimEdge: ClaimEdge;
  ClaimPageInfo: ClaimPageInfo;
  ClaimTimestamps: ClaimTimestamps;
  ClaimsCsvRow: ClaimsCsvRow;
  CompleteClaimPayload: CompleteClaimPayload;
  CompleteClaimResponse: ResolversParentTypes['CompleteClaimResponseSuccess'] | ResolversParentTypes['ResponseError'];
  CompleteClaimResponseSuccess: CompleteClaimResponseSuccess;
  ConnectWalletPayload: ConnectWalletPayload;
  ConnectWalletResponse: ResolversParentTypes['ConnectWalletResponseSuccess'] | ResolversParentTypes['ResponseError'];
  ConnectWalletResponseSuccess: ConnectWalletResponseSuccess;
  CountryCode: Scalars['CountryCode'];
  CreateClaimPayload: CreateClaimPayload;
  CreateClaimResponse: ResolversParentTypes['CreateClaimResponseSuccess'] | ResolversParentTypes['ResponseError'];
  CreateClaimResponseSuccess: CreateClaimResponseSuccess;
  CreatePartyBasketPayload: CreatePartyBasketPayload;
  CreatePartyBasketResponse: ResolversParentTypes['CreatePartyBasketResponseSuccess'] | ResolversParentTypes['ResponseError'];
  CreatePartyBasketResponseSuccess: CreatePartyBasketResponseSuccess;
  CreateReferralPayload: CreateReferralPayload;
  CreateReferralResponse: ResolversParentTypes['CreateReferralResponseSuccess'] | ResolversParentTypes['ResponseError'];
  CreateReferralResponseSuccess: CreateReferralResponseSuccess;
  CreateTournamentPayload: CreateTournamentPayload;
  CreateTournamentResponse: ResolversParentTypes['CreateTournamentResponseSuccess'] | ResolversParentTypes['ResponseError'];
  CreateTournamentResponseSuccess: CreateTournamentResponseSuccess;
  CreateUserResponse: ResolversParentTypes['CreateUserResponseSuccess'] | ResolversParentTypes['ResponseError'];
  CreateUserResponseSuccess: CreateUserResponseSuccess;
  CreateUserWithPasswordPayload: CreateUserWithPasswordPayload;
  CreateUserWithWalletPayload: CreateUserWithWalletPayload;
  Currency: Scalars['Currency'];
  DID: Scalars['DID'];
  Date: Scalars['Date'];
  DateTime: Scalars['DateTime'];
  DeleteStreamResponse: ResolversParentTypes['DeleteStreamResponseSuccess'] | ResolversParentTypes['ResponseError'];
  DeleteStreamResponseSuccess: DeleteStreamResponseSuccess;
  DeleteTournamentResponse: ResolversParentTypes['DeleteTournamentResponseSuccess'] | ResolversParentTypes['ResponseError'];
  DeleteTournamentResponseSuccess: DeleteTournamentResponseSuccess;
  Duration: Scalars['Duration'];
  EditPartyBasketPayload: EditPartyBasketPayload;
  EditPartyBasketResponse: ResolversParentTypes['EditPartyBasketResponseSuccess'] | ResolversParentTypes['ResponseError'];
  EditPartyBasketResponseSuccess: EditPartyBasketResponseSuccess;
  EditStreamPayload: EditStreamPayload;
  EditStreamResponse: ResolversParentTypes['EditStreamResponseSuccess'] | ResolversParentTypes['ResponseError'];
  EditStreamResponseSuccess: EditStreamResponseSuccess;
  EditTournamentPayload: EditTournamentPayload;
  EditTournamentResponse: ResolversParentTypes['EditTournamentResponseSuccess'] | ResolversParentTypes['ResponseError'];
  EditTournamentResponseSuccess: EditTournamentResponseSuccess;
  EmailAddress: Scalars['EmailAddress'];
  GUID: Scalars['GUID'];
  GenerateClaimsCsvPayload: GenerateClaimsCsvPayload;
  GenerateClaimsCsvResponse: ResolversParentTypes['GenerateClaimsCsvResponseSuccess'] | ResolversParentTypes['ResponseError'];
  GenerateClaimsCsvResponseSuccess: GenerateClaimsCsvResponseSuccess;
  GetLootboxByAddressResponse: ResolversParentTypes['LootboxResponseSuccess'] | ResolversParentTypes['ResponseError'];
  GetMyProfileResponse: ResolversParentTypes['GetMyProfileSuccess'] | ResolversParentTypes['ResponseError'];
  GetMyProfileSuccess: GetMyProfileSuccess;
  GetPartyBasketResponse: ResolversParentTypes['GetPartyBasketResponseSuccess'] | ResolversParentTypes['ResponseError'];
  GetPartyBasketResponseSuccess: GetPartyBasketResponseSuccess;
  GetWhitelistSignaturesPayload: GetWhitelistSignaturesPayload;
  GetWhitelistSignaturesResponse: ResolversParentTypes['GetWhitelistSignaturesResponseSuccess'] | ResolversParentTypes['ResponseError'];
  GetWhitelistSignaturesResponseSuccess: GetWhitelistSignaturesResponseSuccess;
  HSL: Scalars['HSL'];
  HSLA: Scalars['HSLA'];
  HexColorCode: Scalars['HexColorCode'];
  Hexadecimal: Scalars['Hexadecimal'];
  IBAN: Scalars['IBAN'];
  ID: Scalars['ID'];
  IPv4: Scalars['IPv4'];
  IPv6: Scalars['IPv6'];
  ISBN: Scalars['ISBN'];
  ISO8601Duration: Scalars['ISO8601Duration'];
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  JSONObject: Scalars['JSONObject'];
  JWT: Scalars['JWT'];
  Latitude: Scalars['Latitude'];
  LocalDate: Scalars['LocalDate'];
  LocalEndTime: Scalars['LocalEndTime'];
  LocalTime: Scalars['LocalTime'];
  Locale: Scalars['Locale'];
  Long: Scalars['Long'];
  Longitude: Scalars['Longitude'];
  Lootbox: Lootbox;
  LootboxChain: LootboxChain;
  LootboxCustomSchema: LootboxCustomSchema;
  LootboxCustomSchemaData: LootboxCustomSchemaData;
  LootboxFeedEdge: LootboxFeedEdge;
  LootboxFeedResponse: ResolversParentTypes['LootboxFeedResponseSuccess'] | ResolversParentTypes['ResponseError'];
  LootboxFeedResponseSuccess: LootboxFeedResponseSuccess;
  LootboxMetadata: LootboxMetadata;
  LootboxResponseSuccess: LootboxResponseSuccess;
  LootboxSnapshot: LootboxSnapshot;
  LootboxSnapshotTimestamps: LootboxSnapshotTimestamps;
  LootboxSocials: LootboxSocials;
  LootboxSocialsWithoutEmail: LootboxSocialsWithoutEmail;
  LootboxTimestamps: LootboxTimestamps;
  LootboxTournamentSnapshot: LootboxTournamentSnapshot;
  MAC: Scalars['MAC'];
  Mutation: {};
  MyTournamentResponse: ResolversParentTypes['MyTournamentResponseSuccess'] | ResolversParentTypes['ResponseError'];
  MyTournamentResponseSuccess: MyTournamentResponseSuccess;
  NegativeFloat: Scalars['NegativeFloat'];
  NegativeInt: Scalars['NegativeInt'];
  NonEmptyString: Scalars['NonEmptyString'];
  NonNegativeFloat: Scalars['NonNegativeFloat'];
  NonNegativeInt: Scalars['NonNegativeInt'];
  NonPositiveFloat: Scalars['NonPositiveFloat'];
  NonPositiveInt: Scalars['NonPositiveInt'];
  ObjectID: Scalars['ObjectID'];
  PageInfo: PageInfo;
  PartyBasket: PartyBasket;
  PartyBasketTimestamps: PartyBasketTimestamps;
  PartyBasketWhitelistSignature: PartyBasketWhitelistSignature;
  PhoneNumber: Scalars['PhoneNumber'];
  Port: Scalars['Port'];
  PositiveFloat: Scalars['PositiveFloat'];
  PositiveInt: Scalars['PositiveInt'];
  PostalCode: Scalars['PostalCode'];
  PublicUser: PublicUser;
  PublicUserResponse: ResolversParentTypes['PublicUserResponseSuccess'] | ResolversParentTypes['ResponseError'];
  PublicUserResponseSuccess: PublicUserResponseSuccess;
  Query: {};
  RGB: Scalars['RGB'];
  RGBA: Scalars['RGBA'];
  RedeemSignaturePayload: RedeemSignaturePayload;
  RedeemSignatureResponse: ResolversParentTypes['RedeemSignatureResponseSuccess'] | ResolversParentTypes['ResponseError'];
  RedeemSignatureResponseSuccess: RedeemSignatureResponseSuccess;
  Referral: Referral;
  ReferralResponse: ResolversParentTypes['ReferralResponseSuccess'] | ResolversParentTypes['ResponseError'];
  ReferralResponseSuccess: ReferralResponseSuccess;
  ReferralTimestamps: ReferralTimestamps;
  RemoveWalletPayload: RemoveWalletPayload;
  RemoveWalletResponse: ResolversParentTypes['RemoveWalletResponseSuccess'] | ResolversParentTypes['ResponseError'];
  RemoveWalletResponseSuccess: RemoveWalletResponseSuccess;
  ResponseError: ResponseError;
  RoutingNumber: Scalars['RoutingNumber'];
  SafeInt: Scalars['SafeInt'];
  Status: Status;
  Stream: Stream;
  StreamInput: StreamInput;
  StreamTimestamps: StreamTimestamps;
  String: Scalars['String'];
  Time: Scalars['Time'];
  TimeZone: Scalars['TimeZone'];
  Timestamp: Scalars['Timestamp'];
  Tournament: Tournament;
  TournamentMetadata: TournamentMetadata;
  TournamentResponse: ResolversParentTypes['ResponseError'] | ResolversParentTypes['TournamentResponseSuccess'];
  TournamentResponseSuccess: TournamentResponseSuccess;
  TournamentTimestamps: TournamentTimestamps;
  URL: Scalars['URL'];
  USCurrency: Scalars['USCurrency'];
  UUID: Scalars['UUID'];
  UnsignedFloat: Scalars['UnsignedFloat'];
  UnsignedInt: Scalars['UnsignedInt'];
  UpdateUserPayload: UpdateUserPayload;
  UpdateUserResponse: ResolversParentTypes['ResponseError'] | ResolversParentTypes['UpdateUserResponseSuccess'];
  UpdateUserResponseSuccess: UpdateUserResponseSuccess;
  User: User;
  UserClaimsResponse: ResolversParentTypes['ResponseError'] | ResolversParentTypes['UserClaimsResponseSuccess'];
  UserClaimsResponseSuccess: UserClaimsResponseSuccess;
  UserSocials: UserSocials;
  UserSocialsInput: UserSocialsInput;
  UtcOffset: Scalars['UtcOffset'];
  Void: Scalars['Void'];
  Wallet: Wallet;
};

export interface AccountNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['AccountNumber'], any> {
  name: 'AccountNumber';
}

export type AddStreamResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddStreamResponse'] = ResolversParentTypes['AddStreamResponse']> = {
  __resolveType: TypeResolveFn<'AddStreamResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type AddStreamResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddStreamResponseSuccess'] = ResolversParentTypes['AddStreamResponseSuccess']> = {
  stream?: Resolver<ResolversTypes['Stream'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthenticateWalletResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthenticateWalletResponse'] = ResolversParentTypes['AuthenticateWalletResponse']> = {
  __resolveType: TypeResolveFn<'AuthenticateWalletResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type AuthenticateWalletResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthenticateWalletResponseSuccess'] = ResolversParentTypes['AuthenticateWalletResponseSuccess']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BattleFeedEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['BattleFeedEdge'] = ResolversParentTypes['BattleFeedEdge']> = {
  cursor?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Tournament'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BattleFeedResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['BattleFeedResponse'] = ResolversParentTypes['BattleFeedResponse']> = {
  __resolveType: TypeResolveFn<'BattleFeedResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type BattleFeedResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['BattleFeedResponseSuccess'] = ResolversParentTypes['BattleFeedResponseSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['BattleFeedEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export type BulkCreateReferralResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkCreateReferralResponse'] = ResolversParentTypes['BulkCreateReferralResponse']> = {
  __resolveType: TypeResolveFn<'BulkCreateReferralResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type BulkCreateReferralResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkCreateReferralResponseSuccess'] = ResolversParentTypes['BulkCreateReferralResponseSuccess']> = {
  csv?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BulkReferralCsvRowResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkReferralCSVRow'] = ResolversParentTypes['BulkReferralCSVRow']> = {
  error?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BulkWhitelistResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkWhitelistResponse'] = ResolversParentTypes['BulkWhitelistResponse']> = {
  __resolveType: TypeResolveFn<'BulkWhitelistResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type BulkWhitelistResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['BulkWhitelistResponseSuccess'] = ResolversParentTypes['BulkWhitelistResponseSuccess']> = {
  errors?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  signatures?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface ByteScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Byte'], any> {
  name: 'Byte';
}

export type ClaimResolvers<ContextType = any, ParentType extends ResolversParentTypes['Claim'] = ResolversParentTypes['Claim']> = {
  chosenPartyBasket?: Resolver<Maybe<ResolversTypes['PartyBasket']>, ParentType, ContextType>;
  chosenPartyBasketAddress?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  chosenPartyBasketId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  chosenPartyBasketNFTBountyValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chosenPartyBasketName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claimerUserId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lootboxAddress?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  lootboxName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  originPartyBasketId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  referralCampaignName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referralId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  referralSlug?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  referralType?: Resolver<Maybe<ResolversTypes['ReferralType']>, ParentType, ContextType>;
  referrerId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  rewardFromClaim?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  rewardFromFriendReferred?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ClaimStatus'], ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['ClaimTimestamps'], ParentType, ContextType>;
  tournament?: Resolver<Maybe<ResolversTypes['Tournament']>, ParentType, ContextType>;
  tournamentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tournamentName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ClaimType'], ParentType, ContextType>;
  userLink?: Resolver<Maybe<ResolversTypes['PublicUser']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClaimEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClaimEdge'] = ResolversParentTypes['ClaimEdge']> = {
  cursor?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Claim'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClaimPageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClaimPageInfo'] = ResolversParentTypes['ClaimPageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClaimTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClaimTimestamps'] = ResolversParentTypes['ClaimTimestamps']> = {
  completedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClaimsCsvRowResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClaimsCsvRow'] = ResolversParentTypes['ClaimsCsvRow']> = {
  claimCreatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  claimId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimStatus?: Resolver<ResolversTypes['ClaimStatus'], ParentType, ContextType>;
  claimType?: Resolver<ResolversTypes['ClaimType'], ParentType, ContextType>;
  claimUpdatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  claimerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerProfileLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Discord?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Facebook?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Instagram?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Snapchat?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_TikTok?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Twitch?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Twitter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerSocial_Web?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claimerUsername?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lootboxAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lootboxLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lootboxName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originPartyBasketId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketManageLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketNFTBountyValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketRedeemLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referralCampaignName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referralId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referralLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referralSlug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referralType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerProfileLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Discord?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Facebook?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Instagram?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Snapchat?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_TikTok?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Twitch?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Twitter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerSocial_Web?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referrerUsername?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rewardFromClaim?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rewardFromFriendReferred?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tournamentId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tournamentName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompleteClaimResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompleteClaimResponse'] = ResolversParentTypes['CompleteClaimResponse']> = {
  __resolveType: TypeResolveFn<'CompleteClaimResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type CompleteClaimResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompleteClaimResponseSuccess'] = ResolversParentTypes['CompleteClaimResponseSuccess']> = {
  claim?: Resolver<ResolversTypes['Claim'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConnectWalletResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ConnectWalletResponse'] = ResolversParentTypes['ConnectWalletResponse']> = {
  __resolveType: TypeResolveFn<'ConnectWalletResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type ConnectWalletResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['ConnectWalletResponseSuccess'] = ResolversParentTypes['ConnectWalletResponseSuccess']> = {
  wallet?: Resolver<ResolversTypes['Wallet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface CountryCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['CountryCode'], any> {
  name: 'CountryCode';
}

export type CreateClaimResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateClaimResponse'] = ResolversParentTypes['CreateClaimResponse']> = {
  __resolveType: TypeResolveFn<'CreateClaimResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type CreateClaimResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateClaimResponseSuccess'] = ResolversParentTypes['CreateClaimResponseSuccess']> = {
  claim?: Resolver<ResolversTypes['Claim'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreatePartyBasketResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreatePartyBasketResponse'] = ResolversParentTypes['CreatePartyBasketResponse']> = {
  __resolveType: TypeResolveFn<'CreatePartyBasketResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type CreatePartyBasketResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreatePartyBasketResponseSuccess'] = ResolversParentTypes['CreatePartyBasketResponseSuccess']> = {
  partyBasket?: Resolver<ResolversTypes['PartyBasket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReferralResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateReferralResponse'] = ResolversParentTypes['CreateReferralResponse']> = {
  __resolveType: TypeResolveFn<'CreateReferralResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type CreateReferralResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateReferralResponseSuccess'] = ResolversParentTypes['CreateReferralResponseSuccess']> = {
  referral?: Resolver<ResolversTypes['Referral'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateTournamentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateTournamentResponse'] = ResolversParentTypes['CreateTournamentResponse']> = {
  __resolveType: TypeResolveFn<'CreateTournamentResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type CreateTournamentResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateTournamentResponseSuccess'] = ResolversParentTypes['CreateTournamentResponseSuccess']> = {
  tournament?: Resolver<ResolversTypes['Tournament'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserResponse'] = ResolversParentTypes['CreateUserResponse']> = {
  __resolveType: TypeResolveFn<'CreateUserResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type CreateUserResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserResponseSuccess'] = ResolversParentTypes['CreateUserResponseSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface CurrencyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Currency'], any> {
  name: 'Currency';
}

export interface DidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DID'], any> {
  name: 'DID';
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteStreamResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteStreamResponse'] = ResolversParentTypes['DeleteStreamResponse']> = {
  __resolveType: TypeResolveFn<'DeleteStreamResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type DeleteStreamResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteStreamResponseSuccess'] = ResolversParentTypes['DeleteStreamResponseSuccess']> = {
  stream?: Resolver<ResolversTypes['Stream'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteTournamentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteTournamentResponse'] = ResolversParentTypes['DeleteTournamentResponse']> = {
  __resolveType: TypeResolveFn<'DeleteTournamentResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type DeleteTournamentResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteTournamentResponseSuccess'] = ResolversParentTypes['DeleteTournamentResponseSuccess']> = {
  tournament?: Resolver<ResolversTypes['Tournament'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DurationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Duration'], any> {
  name: 'Duration';
}

export type EditPartyBasketResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['EditPartyBasketResponse'] = ResolversParentTypes['EditPartyBasketResponse']> = {
  __resolveType: TypeResolveFn<'EditPartyBasketResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type EditPartyBasketResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['EditPartyBasketResponseSuccess'] = ResolversParentTypes['EditPartyBasketResponseSuccess']> = {
  partyBasket?: Resolver<ResolversTypes['PartyBasket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EditStreamResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['EditStreamResponse'] = ResolversParentTypes['EditStreamResponse']> = {
  __resolveType: TypeResolveFn<'EditStreamResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type EditStreamResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['EditStreamResponseSuccess'] = ResolversParentTypes['EditStreamResponseSuccess']> = {
  stream?: Resolver<ResolversTypes['Stream'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EditTournamentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['EditTournamentResponse'] = ResolversParentTypes['EditTournamentResponse']> = {
  __resolveType: TypeResolveFn<'EditTournamentResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type EditTournamentResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['EditTournamentResponseSuccess'] = ResolversParentTypes['EditTournamentResponseSuccess']> = {
  tournament?: Resolver<ResolversTypes['Tournament'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export interface GuidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GUID'], any> {
  name: 'GUID';
}

export type GenerateClaimsCsvResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenerateClaimsCsvResponse'] = ResolversParentTypes['GenerateClaimsCsvResponse']> = {
  __resolveType: TypeResolveFn<'GenerateClaimsCsvResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type GenerateClaimsCsvResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenerateClaimsCsvResponseSuccess'] = ResolversParentTypes['GenerateClaimsCsvResponseSuccess']> = {
  csv?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetLootboxByAddressResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetLootboxByAddressResponse'] = ResolversParentTypes['GetLootboxByAddressResponse']> = {
  __resolveType: TypeResolveFn<'LootboxResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type GetMyProfileResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetMyProfileResponse'] = ResolversParentTypes['GetMyProfileResponse']> = {
  __resolveType: TypeResolveFn<'GetMyProfileSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type GetMyProfileSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetMyProfileSuccess'] = ResolversParentTypes['GetMyProfileSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetPartyBasketResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetPartyBasketResponse'] = ResolversParentTypes['GetPartyBasketResponse']> = {
  __resolveType: TypeResolveFn<'GetPartyBasketResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type GetPartyBasketResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetPartyBasketResponseSuccess'] = ResolversParentTypes['GetPartyBasketResponseSuccess']> = {
  partyBasket?: Resolver<ResolversTypes['PartyBasket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetWhitelistSignaturesResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetWhitelistSignaturesResponse'] = ResolversParentTypes['GetWhitelistSignaturesResponse']> = {
  __resolveType: TypeResolveFn<'GetWhitelistSignaturesResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type GetWhitelistSignaturesResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetWhitelistSignaturesResponseSuccess'] = ResolversParentTypes['GetWhitelistSignaturesResponseSuccess']> = {
  signatures?: Resolver<Array<Maybe<ResolversTypes['PartyBasketWhitelistSignature']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface HslScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HSL'], any> {
  name: 'HSL';
}

export interface HslaScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HSLA'], any> {
  name: 'HSLA';
}

export interface HexColorCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HexColorCode'], any> {
  name: 'HexColorCode';
}

export interface HexadecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Hexadecimal'], any> {
  name: 'Hexadecimal';
}

export interface IbanScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['IBAN'], any> {
  name: 'IBAN';
}

export interface IPv4ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['IPv4'], any> {
  name: 'IPv4';
}

export interface IPv6ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['IPv6'], any> {
  name: 'IPv6';
}

export interface IsbnScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ISBN'], any> {
  name: 'ISBN';
}

export interface Iso8601DurationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ISO8601Duration'], any> {
  name: 'ISO8601Duration';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export interface JwtScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JWT'], any> {
  name: 'JWT';
}

export interface LatitudeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Latitude'], any> {
  name: 'Latitude';
}

export interface LocalDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDate'], any> {
  name: 'LocalDate';
}

export interface LocalEndTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalEndTime'], any> {
  name: 'LocalEndTime';
}

export interface LocalTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalTime'], any> {
  name: 'LocalTime';
}

export interface LocaleScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Locale'], any> {
  name: 'Locale';
}

export interface LongScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Long'], any> {
  name: 'Long';
}

export interface LongitudeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Longitude'], any> {
  name: 'Longitude';
}

export type LootboxResolvers<ContextType = any, ParentType extends ResolversParentTypes['Lootbox'] = ResolversParentTypes['Lootbox']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  chainIdHex?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  factory?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxSharesSold?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metadata?: Resolver<ResolversTypes['LootboxMetadata'], ParentType, ContextType>;
  metadataDownloadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBaskets?: Resolver<Maybe<Array<ResolversTypes['PartyBasket']>>, ParentType, ContextType>;
  targetSharesSold?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['LootboxTimestamps'], ParentType, ContextType>;
  tournamentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  tournamentMetadata?: Resolver<Maybe<ResolversTypes['TournamentMetadata']>, ParentType, ContextType>;
  treasury?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  variant?: Resolver<ResolversTypes['LootboxVariant'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxChainResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxChain'] = ResolversParentTypes['LootboxChain']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  chainIdDecimal?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  chainIdHex?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  chainName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxCustomSchemaResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxCustomSchema'] = ResolversParentTypes['LootboxCustomSchema']> = {
  chain?: Resolver<ResolversTypes['LootboxChain'], ParentType, ContextType>;
  lootbox?: Resolver<ResolversTypes['LootboxCustomSchemaData'], ParentType, ContextType>;
  socials?: Resolver<ResolversTypes['LootboxSocials'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxCustomSchemaDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxCustomSchemaData'] = ResolversParentTypes['LootboxCustomSchemaData']> = {
  backgroundColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  backgroundImage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  badgeImage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  basisPointsReturnTarget?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  factory?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  fundraisingTarget?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fundraisingTargetMax?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lootboxThemeColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pricePerShare?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  returnAmountTarget?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetPaybackDate?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  tournamentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxFeedEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxFeedEdge'] = ResolversParentTypes['LootboxFeedEdge']> = {
  cursor?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['LootboxSnapshot'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxFeedResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxFeedResponse'] = ResolversParentTypes['LootboxFeedResponse']> = {
  __resolveType: TypeResolveFn<'LootboxFeedResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type LootboxFeedResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxFeedResponseSuccess'] = ResolversParentTypes['LootboxFeedResponseSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['LootboxFeedEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxMetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxMetadata'] = ResolversParentTypes['LootboxMetadata']> = {
  animation_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  background_color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  external_url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lootboxCustomSchema?: Resolver<Maybe<ResolversTypes['LootboxCustomSchema']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  youtube_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxResponseSuccess'] = ResolversParentTypes['LootboxResponseSuccess']> = {
  lootbox?: Resolver<ResolversTypes['Lootbox'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxSnapshotResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxSnapshot'] = ResolversParentTypes['LootboxSnapshot']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  backgroundColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  backgroundImage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  metadataDownloadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stampImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['LootboxSnapshotTimestamps'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxSnapshotTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxSnapshotTimestamps'] = ResolversParentTypes['LootboxSnapshotTimestamps']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxSocialsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxSocials'] = ResolversParentTypes['LootboxSocials']> = {
  discord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  facebook?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instagram?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  snapchat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tiktok?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  web?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  youtube?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxSocialsWithoutEmailResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxSocialsWithoutEmail'] = ResolversParentTypes['LootboxSocialsWithoutEmail']> = {
  discord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facebook?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instagram?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  snapchat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tiktok?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  web?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  youtube?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxTimestamps'] = ResolversParentTypes['LootboxTimestamps']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  indexedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LootboxTournamentSnapshotResolvers<ContextType = any, ParentType extends ResolversParentTypes['LootboxTournamentSnapshot'] = ResolversParentTypes['LootboxTournamentSnapshot']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  backgroundColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  backgroundImage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  metadataDownloadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBaskets?: Resolver<Maybe<Array<ResolversTypes['PartyBasket']>>, ParentType, ContextType>;
  socials?: Resolver<ResolversTypes['LootboxSocialsWithoutEmail'], ParentType, ContextType>;
  stampImage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['LootboxTournamentStatus'], ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['LootboxSnapshotTimestamps'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface MacScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MAC'], any> {
  name: 'MAC';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addStream?: Resolver<ResolversTypes['AddStreamResponse'], ParentType, ContextType, RequireFields<MutationAddStreamArgs, 'payload'>>;
  authenticateWallet?: Resolver<ResolversTypes['AuthenticateWalletResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateWalletArgs, 'payload'>>;
  bulkCreateReferral?: Resolver<ResolversTypes['BulkCreateReferralResponse'], ParentType, ContextType, RequireFields<MutationBulkCreateReferralArgs, 'payload'>>;
  bulkWhitelist?: Resolver<ResolversTypes['BulkWhitelistResponse'], ParentType, ContextType, RequireFields<MutationBulkWhitelistArgs, 'payload'>>;
  completeClaim?: Resolver<ResolversTypes['CompleteClaimResponse'], ParentType, ContextType, RequireFields<MutationCompleteClaimArgs, 'payload'>>;
  connectWallet?: Resolver<ResolversTypes['ConnectWalletResponse'], ParentType, ContextType, RequireFields<MutationConnectWalletArgs, 'payload'>>;
  createClaim?: Resolver<ResolversTypes['CreateClaimResponse'], ParentType, ContextType, RequireFields<MutationCreateClaimArgs, 'payload'>>;
  createPartyBasket?: Resolver<ResolversTypes['CreatePartyBasketResponse'], ParentType, ContextType, RequireFields<MutationCreatePartyBasketArgs, 'payload'>>;
  createReferral?: Resolver<ResolversTypes['CreateReferralResponse'], ParentType, ContextType, RequireFields<MutationCreateReferralArgs, 'payload'>>;
  createTournament?: Resolver<ResolversTypes['CreateTournamentResponse'], ParentType, ContextType, RequireFields<MutationCreateTournamentArgs, 'payload'>>;
  createUserRecord?: Resolver<ResolversTypes['CreateUserResponse'], ParentType, ContextType>;
  createUserWithPassword?: Resolver<ResolversTypes['CreateUserResponse'], ParentType, ContextType, RequireFields<MutationCreateUserWithPasswordArgs, 'payload'>>;
  createUserWithWallet?: Resolver<ResolversTypes['CreateUserResponse'], ParentType, ContextType, RequireFields<MutationCreateUserWithWalletArgs, 'payload'>>;
  deleteStream?: Resolver<ResolversTypes['DeleteStreamResponse'], ParentType, ContextType, RequireFields<MutationDeleteStreamArgs, 'id'>>;
  deleteTournament?: Resolver<ResolversTypes['DeleteTournamentResponse'], ParentType, ContextType, RequireFields<MutationDeleteTournamentArgs, 'id'>>;
  editPartyBasket?: Resolver<ResolversTypes['EditPartyBasketResponse'], ParentType, ContextType, RequireFields<MutationEditPartyBasketArgs, 'payload'>>;
  editStream?: Resolver<ResolversTypes['EditStreamResponse'], ParentType, ContextType, RequireFields<MutationEditStreamArgs, 'payload'>>;
  editTournament?: Resolver<ResolversTypes['EditTournamentResponse'], ParentType, ContextType, RequireFields<MutationEditTournamentArgs, 'payload'>>;
  generateClaimsCsv?: Resolver<ResolversTypes['GenerateClaimsCsvResponse'], ParentType, ContextType, RequireFields<MutationGenerateClaimsCsvArgs, 'payload'>>;
  getWhitelistSignatures?: Resolver<ResolversTypes['GetWhitelistSignaturesResponse'], ParentType, ContextType, RequireFields<MutationGetWhitelistSignaturesArgs, 'payload'>>;
  redeemSignature?: Resolver<ResolversTypes['RedeemSignatureResponse'], ParentType, ContextType, RequireFields<MutationRedeemSignatureArgs, 'payload'>>;
  removeWallet?: Resolver<ResolversTypes['RemoveWalletResponse'], ParentType, ContextType, RequireFields<MutationRemoveWalletArgs, 'payload'>>;
  updateUser?: Resolver<ResolversTypes['UpdateUserResponse'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'payload'>>;
  version?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type MyTournamentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyTournamentResponse'] = ResolversParentTypes['MyTournamentResponse']> = {
  __resolveType: TypeResolveFn<'MyTournamentResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type MyTournamentResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyTournamentResponseSuccess'] = ResolversParentTypes['MyTournamentResponseSuccess']> = {
  tournament?: Resolver<ResolversTypes['Tournament'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface NegativeFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NegativeFloat'], any> {
  name: 'NegativeFloat';
}

export interface NegativeIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NegativeInt'], any> {
  name: 'NegativeInt';
}

export interface NonEmptyStringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonEmptyString'], any> {
  name: 'NonEmptyString';
}

export interface NonNegativeFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeFloat'], any> {
  name: 'NonNegativeFloat';
}

export interface NonNegativeIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonNegativeInt'], any> {
  name: 'NonNegativeInt';
}

export interface NonPositiveFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonPositiveFloat'], any> {
  name: 'NonPositiveFloat';
}

export interface NonPositiveIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonPositiveInt'], any> {
  name: 'NonPositiveInt';
}

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectID'], any> {
  name: 'ObjectID';
}

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PartyBasketResolvers<ContextType = any, ParentType extends ResolversParentTypes['PartyBasket'] = ResolversParentTypes['PartyBasket']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  chainIdHex?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  creatorAddress?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  creatorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  factory?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  joinCommunityUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lootboxAddress?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lootboxSnapshot?: Resolver<Maybe<ResolversTypes['LootboxSnapshot']>, ParentType, ContextType>;
  maxClaimsAllowed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nftBountyValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  runningCompletedClaims?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PartyBasketStatus']>, ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['PartyBasketTimestamps'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PartyBasketTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PartyBasketTimestamps'] = ResolversParentTypes['PartyBasketTimestamps']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PartyBasketWhitelistSignatureResolvers<ContextType = any, ParentType extends ResolversParentTypes['PartyBasketWhitelistSignature'] = ResolversParentTypes['PartyBasketWhitelistSignature']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isRedeemed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nonce?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  partyBasketAddress?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  signature?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  signer?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['PartyBasketTimestamps'], ParentType, ContextType>;
  whitelistedAddress?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface PhoneNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PhoneNumber'], any> {
  name: 'PhoneNumber';
}

export interface PortScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Port'], any> {
  name: 'Port';
}

export interface PositiveFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PositiveFloat'], any> {
  name: 'PositiveFloat';
}

export interface PositiveIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PositiveInt'], any> {
  name: 'PositiveInt';
}

export interface PostalCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PostalCode'], any> {
  name: 'PostalCode';
}

export type PublicUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicUser'] = ResolversParentTypes['PublicUser']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  biography?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claims?: Resolver<Maybe<ResolversTypes['UserClaimsResponseSuccess']>, ParentType, ContextType, RequireFields<PublicUserClaimsArgs, 'first'>>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  headshot?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  socials?: Resolver<Maybe<ResolversTypes['UserSocials']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PublicUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicUserResponse'] = ResolversParentTypes['PublicUserResponse']> = {
  __resolveType: TypeResolveFn<'PublicUserResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type PublicUserResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublicUserResponseSuccess'] = ResolversParentTypes['PublicUserResponseSuccess']> = {
  user?: Resolver<ResolversTypes['PublicUser'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  battleFeed?: Resolver<ResolversTypes['BattleFeedResponse'], ParentType, ContextType, RequireFields<QueryBattleFeedArgs, 'first'>>;
  getLootboxByAddress?: Resolver<ResolversTypes['GetLootboxByAddressResponse'], ParentType, ContextType, RequireFields<QueryGetLootboxByAddressArgs, 'address'>>;
  getMyProfile?: Resolver<ResolversTypes['GetMyProfileResponse'], ParentType, ContextType>;
  getPartyBasket?: Resolver<ResolversTypes['GetPartyBasketResponse'], ParentType, ContextType, RequireFields<QueryGetPartyBasketArgs, 'address'>>;
  lootboxFeed?: Resolver<ResolversTypes['LootboxFeedResponse'], ParentType, ContextType, RequireFields<QueryLootboxFeedArgs, 'first'>>;
  myTournament?: Resolver<ResolversTypes['MyTournamentResponse'], ParentType, ContextType, RequireFields<QueryMyTournamentArgs, 'id'>>;
  publicUser?: Resolver<ResolversTypes['PublicUserResponse'], ParentType, ContextType, RequireFields<QueryPublicUserArgs, 'id'>>;
  referral?: Resolver<ResolversTypes['ReferralResponse'], ParentType, ContextType, RequireFields<QueryReferralArgs, 'slug'>>;
  tournament?: Resolver<ResolversTypes['TournamentResponse'], ParentType, ContextType, RequireFields<QueryTournamentArgs, 'id'>>;
  userClaims?: Resolver<ResolversTypes['UserClaimsResponse'], ParentType, ContextType, RequireFields<QueryUserClaimsArgs, 'first' | 'userId'>>;
  version?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export interface RgbScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RGB'], any> {
  name: 'RGB';
}

export interface RgbaScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RGBA'], any> {
  name: 'RGBA';
}

export type RedeemSignatureResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RedeemSignatureResponse'] = ResolversParentTypes['RedeemSignatureResponse']> = {
  __resolveType: TypeResolveFn<'RedeemSignatureResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type RedeemSignatureResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['RedeemSignatureResponseSuccess'] = ResolversParentTypes['RedeemSignatureResponseSuccess']> = {
  signature?: Resolver<ResolversTypes['PartyBasketWhitelistSignature'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReferralResolvers<ContextType = any, ParentType extends ResolversParentTypes['Referral'] = ResolversParentTypes['Referral']> = {
  campaignName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  claims?: Resolver<Maybe<Array<ResolversTypes['Claim']>>, ParentType, ContextType>;
  creatorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isRewardDisabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  nConversions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  referrerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  seedPartyBasket?: Resolver<Maybe<ResolversTypes['PartyBasket']>, ParentType, ContextType>;
  seedPartyBasketId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['ReferralTimestamps'], ParentType, ContextType>;
  tournament?: Resolver<Maybe<ResolversTypes['Tournament']>, ParentType, ContextType>;
  tournamentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['ReferralType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReferralResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferralResponse'] = ResolversParentTypes['ReferralResponse']> = {
  __resolveType: TypeResolveFn<'ReferralResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type ReferralResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferralResponseSuccess'] = ResolversParentTypes['ReferralResponseSuccess']> = {
  referral?: Resolver<ResolversTypes['Referral'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReferralTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferralTimestamps'] = ResolversParentTypes['ReferralTimestamps']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RemoveWalletResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveWalletResponse'] = ResolversParentTypes['RemoveWalletResponse']> = {
  __resolveType: TypeResolveFn<'RemoveWalletResponseSuccess' | 'ResponseError', ParentType, ContextType>;
};

export type RemoveWalletResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveWalletResponseSuccess'] = ResolversParentTypes['RemoveWalletResponseSuccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ResponseErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['ResponseError'] = ResolversParentTypes['ResponseError']> = {
  error?: Resolver<ResolversTypes['Status'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface RoutingNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RoutingNumber'], any> {
  name: 'RoutingNumber';
}

export interface SafeIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SafeInt'], any> {
  name: 'SafeInt';
}

export type StatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['Status'] = ResolversParentTypes['Status']> = {
  code?: Resolver<ResolversTypes['StatusCode'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StreamResolvers<ContextType = any, ParentType extends ResolversParentTypes['Stream'] = ResolversParentTypes['Stream']> = {
  creatorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['StreamTimestamps'], ParentType, ContextType>;
  tournamentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['StreamType'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StreamTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['StreamTimestamps'] = ResolversParentTypes['StreamTimestamps']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Time'], any> {
  name: 'Time';
}

export interface TimeZoneScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['TimeZone'], any> {
  name: 'TimeZone';
}

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TournamentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tournament'] = ResolversParentTypes['Tournament']> = {
  communityURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverPhoto?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creatorId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lootboxSnapshots?: Resolver<Maybe<Array<ResolversTypes['LootboxTournamentSnapshot']>>, ParentType, ContextType>;
  magicLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  prize?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  streams?: Resolver<Maybe<Array<ResolversTypes['Stream']>>, ParentType, ContextType>;
  timestamps?: Resolver<ResolversTypes['TournamentTimestamps'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tournamentDate?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  tournamentLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TournamentMetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['TournamentMetadata'] = ResolversParentTypes['TournamentMetadata']> = {
  status?: Resolver<ResolversTypes['LootboxTournamentStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TournamentResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['TournamentResponse'] = ResolversParentTypes['TournamentResponse']> = {
  __resolveType: TypeResolveFn<'ResponseError' | 'TournamentResponseSuccess', ParentType, ContextType>;
};

export type TournamentResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['TournamentResponseSuccess'] = ResolversParentTypes['TournamentResponseSuccess']> = {
  tournament?: Resolver<ResolversTypes['Tournament'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TournamentTimestampsResolvers<ContextType = any, ParentType extends ResolversParentTypes['TournamentTimestamps'] = ResolversParentTypes['TournamentTimestamps']> = {
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export interface UsCurrencyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['USCurrency'], any> {
  name: 'USCurrency';
}

export interface UuidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UUID'], any> {
  name: 'UUID';
}

export interface UnsignedFloatScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UnsignedFloat'], any> {
  name: 'UnsignedFloat';
}

export interface UnsignedIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UnsignedInt'], any> {
  name: 'UnsignedInt';
}

export type UpdateUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateUserResponse'] = ResolversParentTypes['UpdateUserResponse']> = {
  __resolveType: TypeResolveFn<'ResponseError' | 'UpdateUserResponseSuccess', ParentType, ContextType>;
};

export type UpdateUserResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateUserResponseSuccess'] = ResolversParentTypes['UpdateUserResponseSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  biography?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  headshot?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  partyBaskets?: Resolver<Maybe<Array<ResolversTypes['PartyBasket']>>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  socials?: Resolver<Maybe<ResolversTypes['UserSocials']>, ParentType, ContextType>;
  tournaments?: Resolver<Maybe<Array<ResolversTypes['Tournament']>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  wallets?: Resolver<Maybe<Array<ResolversTypes['Wallet']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserClaimsResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserClaimsResponse'] = ResolversParentTypes['UserClaimsResponse']> = {
  __resolveType: TypeResolveFn<'ResponseError' | 'UserClaimsResponseSuccess', ParentType, ContextType>;
};

export type UserClaimsResponseSuccessResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserClaimsResponseSuccess'] = ResolversParentTypes['UserClaimsResponseSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['ClaimEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['ClaimPageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSocialsResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserSocials'] = ResolversParentTypes['UserSocials']> = {
  discord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facebook?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instagram?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  snapchat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tiktok?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  web?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UtcOffsetScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UtcOffset'], any> {
  name: 'UtcOffset';
}

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type WalletResolvers<ContextType = any, ParentType extends ResolversParentTypes['Wallet'] = ResolversParentTypes['Wallet']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lootboxSnapshots?: Resolver<Maybe<Array<ResolversTypes['LootboxSnapshot']>>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AccountNumber?: GraphQLScalarType;
  AddStreamResponse?: AddStreamResponseResolvers<ContextType>;
  AddStreamResponseSuccess?: AddStreamResponseSuccessResolvers<ContextType>;
  AuthenticateWalletResponse?: AuthenticateWalletResponseResolvers<ContextType>;
  AuthenticateWalletResponseSuccess?: AuthenticateWalletResponseSuccessResolvers<ContextType>;
  BattleFeedEdge?: BattleFeedEdgeResolvers<ContextType>;
  BattleFeedResponse?: BattleFeedResponseResolvers<ContextType>;
  BattleFeedResponseSuccess?: BattleFeedResponseSuccessResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  BulkCreateReferralResponse?: BulkCreateReferralResponseResolvers<ContextType>;
  BulkCreateReferralResponseSuccess?: BulkCreateReferralResponseSuccessResolvers<ContextType>;
  BulkReferralCSVRow?: BulkReferralCsvRowResolvers<ContextType>;
  BulkWhitelistResponse?: BulkWhitelistResponseResolvers<ContextType>;
  BulkWhitelistResponseSuccess?: BulkWhitelistResponseSuccessResolvers<ContextType>;
  Byte?: GraphQLScalarType;
  Claim?: ClaimResolvers<ContextType>;
  ClaimEdge?: ClaimEdgeResolvers<ContextType>;
  ClaimPageInfo?: ClaimPageInfoResolvers<ContextType>;
  ClaimTimestamps?: ClaimTimestampsResolvers<ContextType>;
  ClaimsCsvRow?: ClaimsCsvRowResolvers<ContextType>;
  CompleteClaimResponse?: CompleteClaimResponseResolvers<ContextType>;
  CompleteClaimResponseSuccess?: CompleteClaimResponseSuccessResolvers<ContextType>;
  ConnectWalletResponse?: ConnectWalletResponseResolvers<ContextType>;
  ConnectWalletResponseSuccess?: ConnectWalletResponseSuccessResolvers<ContextType>;
  CountryCode?: GraphQLScalarType;
  CreateClaimResponse?: CreateClaimResponseResolvers<ContextType>;
  CreateClaimResponseSuccess?: CreateClaimResponseSuccessResolvers<ContextType>;
  CreatePartyBasketResponse?: CreatePartyBasketResponseResolvers<ContextType>;
  CreatePartyBasketResponseSuccess?: CreatePartyBasketResponseSuccessResolvers<ContextType>;
  CreateReferralResponse?: CreateReferralResponseResolvers<ContextType>;
  CreateReferralResponseSuccess?: CreateReferralResponseSuccessResolvers<ContextType>;
  CreateTournamentResponse?: CreateTournamentResponseResolvers<ContextType>;
  CreateTournamentResponseSuccess?: CreateTournamentResponseSuccessResolvers<ContextType>;
  CreateUserResponse?: CreateUserResponseResolvers<ContextType>;
  CreateUserResponseSuccess?: CreateUserResponseSuccessResolvers<ContextType>;
  Currency?: GraphQLScalarType;
  DID?: GraphQLScalarType;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DeleteStreamResponse?: DeleteStreamResponseResolvers<ContextType>;
  DeleteStreamResponseSuccess?: DeleteStreamResponseSuccessResolvers<ContextType>;
  DeleteTournamentResponse?: DeleteTournamentResponseResolvers<ContextType>;
  DeleteTournamentResponseSuccess?: DeleteTournamentResponseSuccessResolvers<ContextType>;
  Duration?: GraphQLScalarType;
  EditPartyBasketResponse?: EditPartyBasketResponseResolvers<ContextType>;
  EditPartyBasketResponseSuccess?: EditPartyBasketResponseSuccessResolvers<ContextType>;
  EditStreamResponse?: EditStreamResponseResolvers<ContextType>;
  EditStreamResponseSuccess?: EditStreamResponseSuccessResolvers<ContextType>;
  EditTournamentResponse?: EditTournamentResponseResolvers<ContextType>;
  EditTournamentResponseSuccess?: EditTournamentResponseSuccessResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  GUID?: GraphQLScalarType;
  GenerateClaimsCsvResponse?: GenerateClaimsCsvResponseResolvers<ContextType>;
  GenerateClaimsCsvResponseSuccess?: GenerateClaimsCsvResponseSuccessResolvers<ContextType>;
  GetLootboxByAddressResponse?: GetLootboxByAddressResponseResolvers<ContextType>;
  GetMyProfileResponse?: GetMyProfileResponseResolvers<ContextType>;
  GetMyProfileSuccess?: GetMyProfileSuccessResolvers<ContextType>;
  GetPartyBasketResponse?: GetPartyBasketResponseResolvers<ContextType>;
  GetPartyBasketResponseSuccess?: GetPartyBasketResponseSuccessResolvers<ContextType>;
  GetWhitelistSignaturesResponse?: GetWhitelistSignaturesResponseResolvers<ContextType>;
  GetWhitelistSignaturesResponseSuccess?: GetWhitelistSignaturesResponseSuccessResolvers<ContextType>;
  HSL?: GraphQLScalarType;
  HSLA?: GraphQLScalarType;
  HexColorCode?: GraphQLScalarType;
  Hexadecimal?: GraphQLScalarType;
  IBAN?: GraphQLScalarType;
  IPv4?: GraphQLScalarType;
  IPv6?: GraphQLScalarType;
  ISBN?: GraphQLScalarType;
  ISO8601Duration?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  JWT?: GraphQLScalarType;
  Latitude?: GraphQLScalarType;
  LocalDate?: GraphQLScalarType;
  LocalEndTime?: GraphQLScalarType;
  LocalTime?: GraphQLScalarType;
  Locale?: GraphQLScalarType;
  Long?: GraphQLScalarType;
  Longitude?: GraphQLScalarType;
  Lootbox?: LootboxResolvers<ContextType>;
  LootboxChain?: LootboxChainResolvers<ContextType>;
  LootboxCustomSchema?: LootboxCustomSchemaResolvers<ContextType>;
  LootboxCustomSchemaData?: LootboxCustomSchemaDataResolvers<ContextType>;
  LootboxFeedEdge?: LootboxFeedEdgeResolvers<ContextType>;
  LootboxFeedResponse?: LootboxFeedResponseResolvers<ContextType>;
  LootboxFeedResponseSuccess?: LootboxFeedResponseSuccessResolvers<ContextType>;
  LootboxMetadata?: LootboxMetadataResolvers<ContextType>;
  LootboxResponseSuccess?: LootboxResponseSuccessResolvers<ContextType>;
  LootboxSnapshot?: LootboxSnapshotResolvers<ContextType>;
  LootboxSnapshotTimestamps?: LootboxSnapshotTimestampsResolvers<ContextType>;
  LootboxSocials?: LootboxSocialsResolvers<ContextType>;
  LootboxSocialsWithoutEmail?: LootboxSocialsWithoutEmailResolvers<ContextType>;
  LootboxTimestamps?: LootboxTimestampsResolvers<ContextType>;
  LootboxTournamentSnapshot?: LootboxTournamentSnapshotResolvers<ContextType>;
  MAC?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  MyTournamentResponse?: MyTournamentResponseResolvers<ContextType>;
  MyTournamentResponseSuccess?: MyTournamentResponseSuccessResolvers<ContextType>;
  NegativeFloat?: GraphQLScalarType;
  NegativeInt?: GraphQLScalarType;
  NonEmptyString?: GraphQLScalarType;
  NonNegativeFloat?: GraphQLScalarType;
  NonNegativeInt?: GraphQLScalarType;
  NonPositiveFloat?: GraphQLScalarType;
  NonPositiveInt?: GraphQLScalarType;
  ObjectID?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  PartyBasket?: PartyBasketResolvers<ContextType>;
  PartyBasketTimestamps?: PartyBasketTimestampsResolvers<ContextType>;
  PartyBasketWhitelistSignature?: PartyBasketWhitelistSignatureResolvers<ContextType>;
  PhoneNumber?: GraphQLScalarType;
  Port?: GraphQLScalarType;
  PositiveFloat?: GraphQLScalarType;
  PositiveInt?: GraphQLScalarType;
  PostalCode?: GraphQLScalarType;
  PublicUser?: PublicUserResolvers<ContextType>;
  PublicUserResponse?: PublicUserResponseResolvers<ContextType>;
  PublicUserResponseSuccess?: PublicUserResponseSuccessResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RGB?: GraphQLScalarType;
  RGBA?: GraphQLScalarType;
  RedeemSignatureResponse?: RedeemSignatureResponseResolvers<ContextType>;
  RedeemSignatureResponseSuccess?: RedeemSignatureResponseSuccessResolvers<ContextType>;
  Referral?: ReferralResolvers<ContextType>;
  ReferralResponse?: ReferralResponseResolvers<ContextType>;
  ReferralResponseSuccess?: ReferralResponseSuccessResolvers<ContextType>;
  ReferralTimestamps?: ReferralTimestampsResolvers<ContextType>;
  RemoveWalletResponse?: RemoveWalletResponseResolvers<ContextType>;
  RemoveWalletResponseSuccess?: RemoveWalletResponseSuccessResolvers<ContextType>;
  ResponseError?: ResponseErrorResolvers<ContextType>;
  RoutingNumber?: GraphQLScalarType;
  SafeInt?: GraphQLScalarType;
  Status?: StatusResolvers<ContextType>;
  Stream?: StreamResolvers<ContextType>;
  StreamTimestamps?: StreamTimestampsResolvers<ContextType>;
  Time?: GraphQLScalarType;
  TimeZone?: GraphQLScalarType;
  Timestamp?: GraphQLScalarType;
  Tournament?: TournamentResolvers<ContextType>;
  TournamentMetadata?: TournamentMetadataResolvers<ContextType>;
  TournamentResponse?: TournamentResponseResolvers<ContextType>;
  TournamentResponseSuccess?: TournamentResponseSuccessResolvers<ContextType>;
  TournamentTimestamps?: TournamentTimestampsResolvers<ContextType>;
  URL?: GraphQLScalarType;
  USCurrency?: GraphQLScalarType;
  UUID?: GraphQLScalarType;
  UnsignedFloat?: GraphQLScalarType;
  UnsignedInt?: GraphQLScalarType;
  UpdateUserResponse?: UpdateUserResponseResolvers<ContextType>;
  UpdateUserResponseSuccess?: UpdateUserResponseSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserClaimsResponse?: UserClaimsResponseResolvers<ContextType>;
  UserClaimsResponseSuccess?: UserClaimsResponseSuccessResolvers<ContextType>;
  UserSocials?: UserSocialsResolvers<ContextType>;
  UtcOffset?: GraphQLScalarType;
  Void?: GraphQLScalarType;
  Wallet?: WalletResolvers<ContextType>;
};

