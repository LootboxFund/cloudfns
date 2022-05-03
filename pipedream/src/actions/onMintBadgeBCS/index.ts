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
import { encodeURISafe } from "../../api/helpers";

const BadgeMintedABI: ABIUtilRepresenation = {
  abi: `
event MintBadge(
  address indexed purchaser,
  uint256 ticketId,
  address badgeFactory,
  string memberName,
  string guildName
);
`,
  keys: ["purchaser", "ticketId", "badgeFactory", "memberName", "guildName"],
};

interface Event_BadgeMinted {
  purchaser: Address;
  ticketId: string;
  badgeFactory: Address;
  memberName: string;
  guildName: string;
}

const action = defineAction({
  name: "onMintBadgeBCS",
  description: `
    Pipeline for handling BadgeMinted event
    0. Parse the EVM logs
    1. Save badge/address.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: "onMintBadgeBCS",
  version: "0.1.0",
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
    const bucketData = { id: "lootbox-bcsbadge-data-prod" };
    const bucketStamp = {
      id: "lootbox-bcsbadge-stamp-prod",
    };

    const credentials = JSON.parse((this as any).googleCloud.$auth.key_json);
    const { transaction } = (this as any).webhookTrigger as BlockTriggerEvent;
    console.log(`
    
        ----- transaction
    
    `);
    console.log(transaction);

    // decode events from the EVM logs
    const decodedLogs = decodeEVMLogs<Event_BadgeMinted>({
      eventName: "MintBadge",
      logs: transaction.logs,
      abiReps: [BadgeMintedABI],
    });
    console.log(decodedLogs);

    let lootboxName = "";
    let lootboxAddr = "";
    let _lootboxURI: any | undefined = undefined;

    // save the lootbox.json to gbucket
    const savedFragmentJSON = await Promise.all(
      decodedLogs.map(async (ev) => {
        if (!ev.badgeName || !ev.badge || !ev.issuer) {
          console.log("invalid event", ev.badgeName, ev.badge, ev.issuer);
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
          address: ev.lootbox as ContractAddress,
          name: _lootboxURI?.name || "",
          description: _lootboxURI?.description || "",
          image: _lootboxURI?.image || "",
          backgroundColor: _lootboxURI?.backgroundColor || "",
          backgroundImage: _lootboxURI?.backgroundImage || "",
          badgeImage: _lootboxURI?.badgeImage || "",
          lootbox: {
            address: ev.lootbox as ContractAddress,
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber,
            chainIdHex: _lootboxURI?.lootbox?.chainIdHex || "",
            chainIdDecimal: _lootboxURI?.lootbox?.chainIdDecimal || "",
            chainName: _lootboxURI?.lootbox?.chainName || "",
            targetPaybackDate:
              _lootboxURI?.lootbox?.targetPaybackDate || new Date().valueOf(),
            createdAt: _lootboxURI?.lootbox?.createdAt || new Date().valueOf(),
            fundraisingTarget: _lootboxURI?.lootbox?.fundraisingTarget || "",
            fundraisingTargetMax:
              _lootboxURI?.lootbox?.fundraisingTargetMax || "",
            basisPointsReturnTarget:
              _lootboxURI?.lootbox?.basisPointsReturnTarget || "",
            returnAmountTarget: _lootboxURI?.lootbox?.returnAmountTarget || "",
            pricePerShare: _lootboxURI?.lootbox?.pricePerShare || "",
            lootboxThemeColor: _lootboxURI?.lootbox?.lootboxThemeColor || "",
          },
          socials: {
            twitter: _lootboxURI?.socials?.twitter || "",
            email: _lootboxURI?.socials?.email || "",
            instagram: _lootboxURI?.socials?.instagram || "",
            tiktok: _lootboxURI?.socials?.tiktok || "",
            facebook: _lootboxURI?.socials?.facebook || "",
            discord: _lootboxURI?.socials?.discord || "",
            youtube: _lootboxURI?.socials?.youtube || "",
            snapchat: _lootboxURI?.socials?.snapchat || "",
            twitch: _lootboxURI?.socials?.twitch || "",
            web: _lootboxURI?.socials?.web || "",
          },
        };

        return saveFileToGBucket({
          alias: `JSON for Instant Lootbox ${ev.lootbox} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.lootbox}.json`,
          chainIdHex: manifest.chain.chainIDHex,
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

    // Lootbox NFT ticket image
    const filePath = `${bucketStamp.id}/${manifest.chain.chainIDHex}/${lootboxAddr}.png`;
    const downloadablePath = `${manifest.storage.downloadUrl}/${encodeURISafe(
      filePath
    )}?alt=media`;

    return {
      json: savedFragmentJSON,
      name: lootboxName,
      publicUrl: `${manifest.microfrontends.webflow.lootboxUrl}?lootbox=${lootboxAddr}`,
      image: downloadablePath,
    };
  },
});

export = action;
