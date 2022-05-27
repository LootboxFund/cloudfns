import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";

import { decodeEVMLogs } from "../../api/evm";
import {
  Address,
  ILootboxMetadata,
  ContractAddress,
  convertHexToDecimal,
  BLOCKCHAINS,
} from "../../manifest/types.helpers";
import { BigNumber } from "ethers";
import manifest from "../../manifest/manifest";
import { encodeURISafe } from "../../api/helpers";
import { InstantLootboxCreated } from "../../api/event-abi";

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
  name: manifest.pipedream.actions.onCreateLootboxInstant.alias,
  description: `
    Pipeline for handling LootboxCreated event
    0. Parse the EVM logs
    1. Save lootbox/address.json to GBucket for FE to consume
    2. Save lootbox/address.txt to GBucket for OZ to consume
    3. Save lootbox/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: manifest.pipedream.actions.onCreateLootboxInstant.slug,
  // version: manifest.pipedream.actions.onCreateLootboxInstant.pipedreamSemver,
  version: "0.1.5",
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
    // eventABI: {
    //   // {{steps.defineEventABIs.$return_value.LootboxInstantFactory}}
    //   type: "object",
    // },
  },
  async run() {
    const { data: bucketData, stamp: bucketStamp } = manifest.storage.buckets;

    const credentials = JSON.parse((this as any).googleCloud.$auth.key_json);
    const { transaction, sentinel } = (this as any)
      .webhookTrigger as BlockTriggerEvent;

    console.log(`
    
        ----- transaction
    
    `);
    console.log(transaction);

    console.log(`
    ----- sentinel
`);
    console.log(sentinel);

    const chainID = sentinel.chainId;

    const chain =
      Object.values(BLOCKCHAINS).find(
        (chainRaw) => chainRaw.chainIdDecimal === chainID.toString()
      ) || BLOCKCHAINS.UNKNOWN;

    let lootboxName = "";
    let lootboxAddr = "";
    let stampDownloadablePath = "";
    let _lootboxURI: ILootboxMetadata | undefined = undefined;

    // decode events from the EVM logs
    const decodedLogs = decodeEVMLogs<Event_LootboxCreated>({
      eventName: "LootboxCreated",
      logs: transaction.logs,
      abiReps: [InstantLootboxCreated],
    });
    console.log(decodedLogs);

    // save the lootbox.json to gbucket
    const savedFragmentJSON = await Promise.all(
      decodedLogs.map(async (ev) => {
        if (!ev.lootbox || !ev._data || !ev.lootboxName) {
          console.log("invalid event", ev.lootbox, ev.lootboxName, ev._data);
          return;
        }

        lootboxName = ev.lootboxName;
        lootboxAddr = ev.lootbox;

        try {
          _lootboxURI = JSON.parse(ev._data) as ILootboxMetadata;
        } catch (err) {
          console.error("Could not parse lootbox URI", err);
        }

        const lootboxPublicUrl = `${manifest.microfrontends.webflow.lootboxUrl}?lootbox=${lootboxAddr}`;

        // Lootbox NFT ticket image
        const stampFilePath = `${bucketStamp.id}/${lootboxAddr}/lootbox.png`;
        stampDownloadablePath = `${
          manifest.storage.downloadUrl
        }/${encodeURISafe(stampFilePath)}?alt=media`;

        const lootboxURI: ILootboxMetadata = {
          image: stampDownloadablePath, // the stamp
          external_url: lootboxPublicUrl,
          description: _lootboxURI?.description || "",
          name: _lootboxURI?.name || "",
          background_color: _lootboxURI?.background_color || "000000",
          animation_url: _lootboxURI?.animation_url || "",
          youtube_url: _lootboxURI?.youtube_url || "",
          lootboxCustomSchema: {
            version: manifest.semver.id,
            chain: {
              address: ev.lootbox as ContractAddress,
              title: ev.lootboxName,
              chainIdHex: chain.chainIdHex,
              chainName: chain.slug,
              chainIdDecimal: convertHexToDecimal(chain.chainIdHex),
            },
            lootbox: {
              name: _lootboxURI?.lootboxCustomSchema?.lootbox?.name || "",
              description:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.description || "",
              image: _lootboxURI?.lootboxCustomSchema?.lootbox?.image || "",
              backgroundColor:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.backgroundColor ||
                "",
              backgroundImage:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.backgroundImage ||
                "",
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
                _lootboxURI?.lootboxCustomSchema?.lootbox?.fundraisingTarget ||
                "",
              fundraisingTargetMax:
                _lootboxURI?.lootboxCustomSchema?.lootbox
                  ?.fundraisingTargetMax || "",
              basisPointsReturnTarget:
                _lootboxURI?.lootboxCustomSchema?.lootbox
                  ?.basisPointsReturnTarget || "",
              returnAmountTarget:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.returnAmountTarget ||
                "",
              pricePerShare:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.pricePerShare || "",
              lootboxThemeColor:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.lootboxThemeColor ||
                "",
            },
            socials: {
              twitter: _lootboxURI?.lootboxCustomSchema?.socials?.twitter || "",
              email: _lootboxURI?.lootboxCustomSchema?.socials?.email || "",
              instagram:
                _lootboxURI?.lootboxCustomSchema?.socials?.instagram || "",
              tiktok: _lootboxURI?.lootboxCustomSchema?.socials?.tiktok || "",
              facebook:
                _lootboxURI?.lootboxCustomSchema?.socials?.facebook || "",
              discord: _lootboxURI?.lootboxCustomSchema?.socials?.discord || "",
              youtube: _lootboxURI?.lootboxCustomSchema?.socials?.youtube || "",
              snapchat:
                _lootboxURI?.lootboxCustomSchema?.socials?.snapchat || "",
              twitch: _lootboxURI?.lootboxCustomSchema?.socials?.twitch || "",
              web: _lootboxURI?.lootboxCustomSchema?.socials?.web || "",
            },
          },
        };

        return saveFileToGBucket({
          alias: `JSON for Instant Lootbox ${ev.lootbox} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.lootbox.toLowerCase()}/lootbox.json`,
          bucket: bucketData.id,
          data: JSON.stringify(lootboxURI),
        });
      })
    );

    return {
      json: savedFragmentJSON,
      name: lootboxName,
      publicUrl: `${manifest.microfrontends.webflow.lootboxUrl}?lootbox=${lootboxAddr}`,
      image: stampDownloadablePath,
    };
  },
});

export = action;
