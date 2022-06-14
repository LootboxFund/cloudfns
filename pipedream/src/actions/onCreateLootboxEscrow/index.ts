import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";
import { decodeEVMLogs } from "../../api/evm";
import { stampNewLootbox } from "../../api/stamp";
import {
  Address,
  ContractAddress,
  convertHexToDecimal,
  BLOCKCHAINS,
} from "../../manifest/types.helpers";
import { BigNumber, ethers } from "ethers";
import manifest from "../../manifest/manifest";
import { encodeURISafe } from "../../api/helpers";
import { EscrowLootboxCreated } from "../../api/event-abi";
import {
  LootboxMetadata,
  Lootbox,
  LootboxVariant,
  LootboxTournamentStatus,
} from "../../api/graphql/generated/types";

interface Event_LootboxCreated {
  lootboxName: string;
  lootbox: Address;
  issuer: Address;
  treasury: Address;
  targetSharesSold: BigNumber;
  maxSharesSold: BigNumber;
  _data: string;
}

const action = defineAction({
  name: manifest.pipedream.actions.onCreateLootboxEscrow.alias,
  description: `
    Pipeline for handling LootboxCreated event
    0. Parse the EVM logs
    1. Save lootbox/address.json to GBucket for FE to consume
    2. Save lootbox/address.txt to GBucket for OZ to consume
    3. Save lootbox/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: manifest.pipedream.actions.onCreateLootboxEscrow.slug,
  // version: manifest.pipedream.actions.onCreateLootboxEscrow.pipedreamSemver,
  version: "0.1.1",
  type: "action",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
    webhookTrigger: {
      // {{steps.trigger.event}}
      type: "object",
    },
  },
  async run() {
    const {
      SecretManagerServiceClient,
    } = require("@google-cloud/secret-manager");

    const { data: bucketData, stamp: bucketStamp } = manifest.storage.buckets;

    const stampNewLootboxSecretConfig = manifest.secretManager.secrets.find(
      (secret) => secret.name === "STAMP_SECRET"
    );

    if (!stampNewLootboxSecretConfig) {
      throw new Error("Secret config not set up in manifest");
    }

    const credentials = JSON.parse((this as any).googleCloud.$auth.key_json);
    const { transaction, sentinel, timestamp } = (this as any)
      .webhookTrigger as BlockTriggerEvent;

    console.log(`
    
        ----- transaction
    
    `);
    console.log(transaction);

    console.log(`
        ----- sentinel
    `);
    console.log(sentinel);

    const gsmClient = new SecretManagerServiceClient({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });

    let secret = undefined;

    try {
      const [jwtSecretResponse] = await gsmClient.accessSecretVersion({
        // name: `projects/lootbox-fund-staging/secrets/${jwtSecretConfig.name}/versions/${jwtSecretConfig.version}`,
        name: `projects/${manifest.googleCloud.projectID}/secrets/${stampNewLootboxSecretConfig.name}/versions/${stampNewLootboxSecretConfig.version}`,
      });

      secret = jwtSecretResponse?.payload?.data?.toString();

      if (!secret) {
        throw new Error("Stamp Secret Not Found");
      }
    } catch (err) {
      console.log("Error fetching stamp secret", err);
      (this as any).httpInterface.respond({
        status: 500,
      });
      return;
    }

    const factoryAddress = sentinel.addresses[0] as Address | undefined;

    const chainID = sentinel.chainId;

    const chain =
      Object.values(BLOCKCHAINS).find(
        (chainRaw) => chainRaw.chainIdDecimal === chainID.toString()
      ) || BLOCKCHAINS.UNKNOWN;

    // decode events from the EVM logs
    const decodedLogs = decodeEVMLogs<Event_LootboxCreated>({
      eventName: "LootboxCreated",
      logs: transaction.logs,
      abiReps: [EscrowLootboxCreated],
    });

    const event: Event_LootboxCreated | undefined = decodedLogs.find((log) => {
      return !!log.lootbox && !!log.lootboxName;
    });

    if (!event) {
      throw new Error(`Event not found ${transaction.transactionHash}`);
    }

    let _lootboxURI: LootboxMetadata | undefined = undefined;
    if (event?._data) {
      try {
        _lootboxURI = JSON.parse(event._data) as LootboxMetadata;
      } catch (err) {
        console.error("Could not parse lootbox URI", err);
      }
    }

    let lootboxPublicUrl: string | undefined;

    try {
      lootboxPublicUrl = await stampNewLootbox(secret, {
        logoImage: _lootboxURI?.lootboxCustomSchema?.lootbox?.image || "",
        backgroundImage:
          _lootboxURI?.lootboxCustomSchema?.lootbox?.backgroundImage || "",
        badgeImage: _lootboxURI?.lootboxCustomSchema?.lootbox?.badgeImage || "",
        themeColor:
          _lootboxURI?.lootboxCustomSchema?.lootbox?.lootboxThemeColor || "",
        name: event.lootboxName,
        ticketID: "0x",
        lootboxAddress: event.lootbox as ContractAddress,
        chainIdHex: chain.chainIdHex,
        numShares: ethers.utils.formatEther(event.maxSharesSold),
      });
    } catch (err) {
      console.error(err);
    }

    // Lootbox NFT ticket image
    const stampFilePath = `${bucketStamp.id}/${event.lootbox}/lootbox.png`;
    const stampDownloadablePath = `${
      manifest.storage.downloadUrl
    }/${encodeURISafe(stampFilePath)}?alt=media`;

    const tournamentId =
      _lootboxURI?.lootboxCustomSchema?.lootbox?.tournamentId;

    const coercedLootboxURI: LootboxMetadata = {
      image: stampDownloadablePath, // the stamp
      external_url: lootboxPublicUrl || "",
      description: _lootboxURI?.description || "",
      name: _lootboxURI?.name || "",
      background_color: _lootboxURI?.background_color || "000000",
      animation_url: _lootboxURI?.animation_url || "",
      youtube_url: _lootboxURI?.youtube_url || "",
      lootboxCustomSchema: {
        version: manifest.semver.id,
        chain: {
          address: event.lootbox as ContractAddress,
          title: event.lootboxName,
          chainIdHex: chain.chainIdHex,
          chainName: chain.slug,
          chainIdDecimal: convertHexToDecimal(chain.chainIdHex),
        },
        lootbox: {
          factory: factoryAddress || "",
          name: _lootboxURI?.lootboxCustomSchema?.lootbox?.name || "",
          description:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.description || "",
          image: _lootboxURI?.lootboxCustomSchema?.lootbox?.image || "",
          backgroundColor:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.backgroundColor || "",
          backgroundImage:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.backgroundImage || "",
          badgeImage:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.badgeImage || "",
          transactionHash: transaction.transactionHash,
          blockNumber: transaction.blockNumber,
          targetPaybackDate:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.targetPaybackDate ||
            new Date().valueOf(),
          createdAt:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.createdAt ||
            new Date().valueOf(),
          fundraisingTarget:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.fundraisingTarget || "",
          fundraisingTargetMax:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.fundraisingTargetMax ||
            "",
          basisPointsReturnTarget:
            _lootboxURI?.lootboxCustomSchema?.lootbox
              ?.basisPointsReturnTarget || "",
          returnAmountTarget:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.returnAmountTarget || "",
          pricePerShare:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.pricePerShare || "",
          lootboxThemeColor:
            _lootboxURI?.lootboxCustomSchema?.lootbox?.lootboxThemeColor || "",
          tournamentId: tournamentId || "",
        },
        socials: {
          twitter: _lootboxURI?.lootboxCustomSchema?.socials?.twitter || "",
          email: _lootboxURI?.lootboxCustomSchema?.socials?.email || "",
          instagram: _lootboxURI?.lootboxCustomSchema?.socials?.instagram || "",
          tiktok: _lootboxURI?.lootboxCustomSchema?.socials?.tiktok || "",
          facebook: _lootboxURI?.lootboxCustomSchema?.socials?.facebook || "",
          discord: _lootboxURI?.lootboxCustomSchema?.socials?.discord || "",
          youtube: _lootboxURI?.lootboxCustomSchema?.socials?.youtube || "",
          snapchat: _lootboxURI?.lootboxCustomSchema?.socials?.snapchat || "",
          twitch: _lootboxURI?.lootboxCustomSchema?.socials?.twitch || "",
          web: _lootboxURI?.lootboxCustomSchema?.socials?.web || "",
        },
      },
    };

    const jsonDownloadPath = await saveFileToGBucket({
      alias: `JSON for Escrow Lootbox ${event.lootbox} triggered by tx hash ${transaction.transactionHash}`,
      credentials,
      fileName: `${event.lootbox.toLowerCase()}/lootbox.json`,
      bucket: bucketData.id,
      data: JSON.stringify(coercedLootboxURI),
    });

    const lootboxDatabaseSchema: Lootbox = {
      address: event.lootbox as Address,
      factory: factoryAddress || "",
      name: event.lootboxName,
      chainIdHex: chain.chainIdHex,
      issuer: event.issuer,
      treasury: event.treasury,
      targetSharesSold: event.targetSharesSold?.toString() || "",
      maxSharesSold: event.maxSharesSold?.toString() || "",
      timestamps: {
        createdAt: timestamp,
        indexedAt: new Date().valueOf(),
        updatedAt: new Date().valueOf(),
      },
      metadata: coercedLootboxURI,
      metadataDownloadUrl: jsonDownloadPath,
      variant: LootboxVariant.Escrow,
    };

    if (tournamentId) {
      lootboxDatabaseSchema.tournamentId = tournamentId;
      lootboxDatabaseSchema.tournamentMetadata = {
        status: LootboxTournamentStatus.Pending,
      };
    }

    return {
      json: jsonDownloadPath,
      name: event.lootboxName,
      publicUrl: lootboxPublicUrl,
      image: stampDownloadablePath,
      lootboxDatabaseSchema,
      userEmail: coercedLootboxURI.lootboxCustomSchema?.socials.email || "",
    };
  },
});

export = action;
