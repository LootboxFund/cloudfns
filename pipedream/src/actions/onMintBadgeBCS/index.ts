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

const gbucketRoute = `https://gbucket.co/route`;

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

interface IBadgeMetadata {
  /** points to stamp image - opensea compatible */
  image: string;
  /** points to badge page on lootbox.fund - opensea compatible */
  external_url: string;
  /** description of the lootbox - opensea compatible */
  description: string;
  /** name of the lootbox - opensea compatible */
  name: string;
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

    let badgeFactory = "";
    let ticketId = "";

    // save the badge.json to gbucket
    const savedFragmentJSON = await Promise.all(
      decodedLogs.map(async (ev) => {
        if (
          !ev.purchaser ||
          !ev.ticketId ||
          !ev.badgeFactory ||
          !ev.memberName ||
          !ev.guildName
        ) {
          console.log(
            "invalid event",
            ev.purchaser,
            ev.ticketId,
            ev.badgeFactory,
            ev.memberName,
            ev.guildName
          );
          return;
        }

        badgeFactory = ev.badgeFactory;
        ticketId = ev.ticketId;

        const badgeMetadata: IBadgeMetadata = {
          external_url: `https://lootbox.fund/badge/bcs?badge=${ev.badgeFactory}&id=${ev.ticketId}`,
          name: `${ev.memberName} - ${ev.guildName}`,
          description: `Membership badge in ${ev.guildName} for member ${ev.memberName}`,
          image: `${gbucketRoute}/${ev.badgeFactory}/${ev.ticketId}.png`,
        };

        return saveFileToGBucket({
          alias: `JSON for Badge ${ev.badgeFactory} ID ${ev.ticketId} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.badgeFactory}/${ev.ticketId}.json`,
          bucket: bucketData.id,
          data: JSON.stringify(badgeMetadata),
        });
      })
    );

    // Lootbox NFT ticket image
    const filePath = `${badgeFactory}/${ticketId}.png`;
    const downloadablePath = `${gbucketRoute}/${encodeURISafe(
      filePath
    )}?alt=media`;

    return {
      json: savedFragmentJSON,
      name: `Badge ${badgeFactory} Member ${ticketId}`,
      publicUrl: `https://lootbox.fund/badge/bcs?badge=${badgeFactory}&id=${ticketId}`,
      image: downloadablePath,
    };
  },
});

export = action;
