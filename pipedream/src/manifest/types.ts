import { Address, ChainIDHex, ContractAddress, Url } from "../types";
import {
  OZChainSlugs,
  BucketType,
  SemanticVersion,
  SecretName,
  SecretVersion,
  OZSecretName,
  BucketId,
} from "../types";

type RepoSemver = string;
type DeployedSemver = string;
type ContractGroupSemver = string;
type StorageDownloadUrl = "https://storage.googleapis.com/storage/v1/b";

interface BaseSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
  build: string[];
  id: SemanticVersion;
}

interface OZSecret {
  name: OZSecretName;
}

type OpenZeppelinSemver = string;
interface OpenZeppelin {
  alias: string;
  multiSigs: Record<MultiSigSlug, MultiSig>;
  contracts: Record<ContractSlug, Contract>;
  autoTasks: Record<OZAutoTaskSlug, OZAutoTask>;
  sentinels: Record<OZSentinelSlug, OZSentinel>;
  semver: OpenZeppelinSemver;
  secrets: OZSecret[];
}

export enum MultiSigSlugs {
  LootboxDAO = "LootboxDAO",
  LootboxDAO_Treasury = "LootboxDAO_Treasury",
}
type MultiSigSlug = MultiSigSlugs;
interface MultiSig {
  alias: string;
  address: Address;
  signers: Address[];
  chainHexID: ChainIDHex;
  threshold: number;
  slug: MultiSigSlug;
}

export enum OZTeammemberSlugs {
  Oxterran = "Oxterran",
  Oxnewton = "Oxnewton",
}

export type OZAutoTaskID = string & { readonly _: unique symbol };
export enum OZAutoTaskSlugs {
  onCreateInstantLootbox = "onCreateInstantLootbox",
  onCreateEscrowLootbox = "onCreateEscrowLootbox",
}
type OZAutoTaskSlug = OZAutoTaskSlugs;
interface OZAutoTask {
  id: OZAutoTaskID;
  alias: string;
  semver: RepoSemver;
  slug: OZAutoTaskSlug;
  // webhookEndpoint: Url;
}

export type OZSentinelID = string & { readonly _: unique symbol };
export enum OZSentinelSlugs {
  onCreateLootboxInstant = "onCreateLootboxInstant",
  onCreateLootboxEscrow = "onCreateLootboxEscrow",
}
type OZSentinelSlug = OZSentinelSlugs;
interface OZSentinel {
  id: OZSentinelID;
  alias: string;
  semver: RepoSemver;
  slug: OZSentinelSlug;
  ozChainSlug: OZChainSlugs;
  contractWatchAddress: Address;
}

type LootboxManifestSemver = string;
interface Lootbox {
  alias: string;
  semver: LootboxManifestSemver;
  contracts: Record<ContractSlug, Contract>;
}

export enum ContractSlugs {
  LootboxInstantFactory = "LootboxInstantFactory",
  LootboxEscrowFactory = "LootboxEscrowFactory",
}
type ContractSlug = ContractSlugs;
interface Contract {
  address: Address;
  slug: ContractSlug;
}

interface LootboxFactory extends Contract {
  alias: string;
  contractGroupSemver: ContractGroupSemver;
}

type PipedreamSemver = string;
interface Pipedream {
  alias: string;
  semver: PipedreamSemver;
  email: string;
  sources: Record<PipedreamSourceSlug, PipedreamSource>;
  actions: Record<PipedreamActionSlug, PipedreamAction>;
}

export enum PipedreamSourceSlugs {
  onCreateInstantLootbox = "onCreateInstantLootbox",
  onCreateEscrowLootbox = "onCreateEscrowLootbox",
  onUploadABI = "onUploadABI",
}
export type PipedreamSourceID = string & { readonly _: unique symbol };
type PipedreamSourceSlug = PipedreamSourceSlugs;

interface PipedreamSource {
  alias: string;
  pipedreamID: PipedreamSourceID;
  semver: DeployedSemver;
  slug: PipedreamSourceSlug;
  webhookEndpoint: Url;
}

export enum PipedreamActionSlugs {
  defineEventABIs = "defineEventABIs",
  onCreateInstantLootbox = "onCreateInstantLootbox",
  onCreateEscrowLootbox = "onCreateEscrowLootbox",
  onUploadABI = "onUploadABI",
}
type PipedreamActionSlug = PipedreamActionSlugs;
export type PipedreamActionID = string & { readonly _: unique symbol };
interface PipedreamAction {
  alias: string;
  pipedreamID: PipedreamActionID;
  pipedreamSemver: DeployedSemver;
  slug: PipedreamActionSlug;
}

export enum PipedreamWorkflowSlugs {
  onCreateInstantLootbox = "onCreateInstantLootbox",
  onCreateEscrowLootbox = "onCreateEscrowLootbox",
  onUploadABI = "onUploadABI",
}
export type PipedreamWorkflowID = string & { readonly _: unique symbol };

export enum CloudRunContainerSlugs {
  stampNewLootbox = "stampNewLootbox",
}
type CloudRunContainerSlug = CloudRunContainerSlugs;
interface CloudRun {
  alias: string;
  semver: SemanticVersion;
  containers: Record<CloudRunContainerSlug, CloudRunContainer>;
}
interface CloudRunContainer {
  slug: CloudRunContainerSlug;
  fullRoute: Url;
}

interface GoogleCloud {
  alias: string;
  projectID: string;
  semver: SemanticVersion;
}

type MicrofrontendsSemver = string;
interface Microfrontends {
  alias: string;
  semver: MicrofrontendsSemver;
  widgets: Record<WidgetSlug, Widget>;
  webflow: Webflow;
}

export enum WidgetSlugs {
  fundraiserPage = "fundraiserPage",
  createLootbox = "createLootbox",
}
type WidgetSlug = WidgetSlugs;
type WidgetSemver = string;
interface Widget {
  alias: string;
  semver: WidgetSemver;
  slug: WidgetSlug;
}

type WebflowSemver = string;
interface Webflow {
  alias: string;
  semver: WebflowSemver;
  email: string;
  lootboxUrl: string;
}

interface SecretManagerSecret {
  name: SecretName;
  version: SecretVersion;
}
interface SecretManager {
  secrets: SecretManagerSecret[];
}

interface Chain {
  chainIDHex: ChainIDHex;
  chainName: string;
  priceFeedUSD: ContractAddress;
}

interface Bucket {
  id: BucketId;
}

interface Storage {
  downloadUrl: StorageDownloadUrl;
  buckets: Record<BucketType, Bucket>;
}

export interface GlobalMainfest_v0_2_8_sandbox {
  alias: string;
  date: Date;
  description: string;
  chain: Chain;
  semver: BaseSemver;
  openZeppelin: OpenZeppelin;
  pipedream: Pipedream;
  googleCloud: GoogleCloud;
  cloudRun: CloudRun;
  microfrontends: Microfrontends;
  secretManager: SecretManager;
  lootbox: Lootbox;
  storage: Storage;
}
