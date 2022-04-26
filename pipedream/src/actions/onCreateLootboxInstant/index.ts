import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";

import { decodeEVMLogs } from "../../api/evm";
import {
  Address,
  ABIUtilRepresenation,
  ITicketMetadata,
  ContractAddress,
  convertHexToDecimal,
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
  maxSharesSold: BigNumber;
  sharePriceUSD: BigNumber;
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
  version: "0.4.5",
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
    const { transaction } = (this as any).webhookTrigger as BlockTriggerEvent;
    console.log(`
    
        ----- transaction
    
    `);
    console.log(transaction);

    // decode events from the EVM logs
    const decodedLogs = decodeEVMLogs<Event_LootboxCreated>({
      eventName: "LootboxCreated",
      logs: transaction.logs,
      abiReps: [InstantLootboxCreated],
    });
    console.log(decodedLogs);

    let lootboxName = "";
    let lootboxAddr = "";
    let _lootboxURI: ITicketMetadata | undefined = undefined;

    // Lootbox NFT ticket image
    const stampFilePath = `${bucketStamp.id}/${manifest.chain.chainIDHex}/${lootboxAddr}.png`;
    const stampDownloadablePath = `${
      manifest.storage.downloadUrl
    }/${encodeURISafe(stampFilePath)}?alt=media`;

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
          _lootboxURI = JSON.parse(ev._data) as ITicketMetadata;
        } catch (err) {
          console.error("Could not parse lootbox URI", err);
        }

        const lootboxURI: ITicketMetadata = {
          image: stampDownloadablePath, // the stamp
          external_url: _lootboxURI?.external_url || "",
          description: _lootboxURI?.description || "",
          name: _lootboxURI?.name || "",
          background_color: _lootboxURI?.background_color || "000000",
          animation_url: _lootboxURI?.animation_url || "",
          youtube_url: _lootboxURI?.youtube_url || "",
          lootboxCustomSchema: {
            address: ev.lootbox as ContractAddress,
            name: _lootboxURI?.lootboxCustomSchema?.name || "",
            description: _lootboxURI?.lootboxCustomSchema?.description || "",
            image: _lootboxURI?.lootboxCustomSchema?.image || "",
            backgroundColor:
              _lootboxURI?.lootboxCustomSchema?.backgroundColor || "",
            backgroundImage:
              _lootboxURI?.lootboxCustomSchema?.backgroundImage || "",
            badgeImage: _lootboxURI?.lootboxCustomSchema?.badgeImage || "",
            lootbox: {
              address: ev.lootbox as ContractAddress,
              transactionHash: transaction.transactionHash,
              blockNumber: transaction.blockNumber,
              chainIdHex:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.chainIdHex || "",
              chainIdDecimal:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.chainIdDecimal || "",
              chainName:
                _lootboxURI?.lootboxCustomSchema?.lootbox?.chainName || "",
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
          fileName: `${ev.lootbox}.json`,
          bucket: bucketData.id,
          data: JSON.stringify({
            address: ev.lootbox,
            title: ev.lootboxName,
            chainIdHex: manifest.chain.chainIDHex,
            chainIdDecimal: convertHexToDecimal(manifest.chain.chainIDHex),
            data: lootboxURI,
          }),
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
