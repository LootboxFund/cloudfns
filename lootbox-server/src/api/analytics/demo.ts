// we generate a demo event & ad for each new host
// so that they have something to explore and will quickly understand how lootbox works

/** Possible demo use cases:
 * - esports tournament
 * - festival
 * - streamer giveaway
 * - after ticket claim questions
 */

import { TournamentID, UserID, UserIdpID } from "@wormgraph/helpers";
import * as tournamentService from "../../service/tournament";
import * as LootboxService from "../../service/lootbox";
import { createLootbox } from "../firestore/lootbox";
import { CreateLootboxPayload } from "../../graphql/generated/types";

export enum DemoEventType {
  EsportsTournament = "esports-tournament",
  Festival = "festival",
  StreamerGiveaway = "streamer-giveaway",
}
export const createDemoEvent = async (
  demoEventType: DemoEventType,
  userID: UserID
) => {
  // ✅ create event
  // ⬜️ create 4 lootboxes
  // ⬜️ create 4 referral links
  // ⬜️ create 200 claims (120 unverified, 80 verified)
  // ⬜️ create 1 offer as afterticketclaim
  // ⬜️ create 1 ad & adset
  // ⬜️ create ad events (clicks, views, answers)
  // ⬜️ create 1 voucher prize deposit
};

const createDemoEvent_Esports = async (userID: UserID) => {
  const tournamentDB = await tournamentService.create(
    {
      title: "Demo Esports Tournament",
      description:
        "This is a demo esports tournament to show new hosts how LOOTBOX works.",
      tournamentLink: "https://www.communitygaming.io/",
      coverPhoto:
        "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Flion.jpeg?alt=media",
      prize: "$100 USD",
    },
    userID as unknown as UserIdpID
  );
  const demoLootboxes = [
    {
      name: "Team Articuno",
      tournamentID: tournamentDB.id,
      backgroundImage:
        "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Farticuno.jpeg?alt=media",
      themeColor: "#0c7196",
      nftBountyValue: "$5 USD",
      maxTickets: 20,
      description: "Demo Lootbox for Team Articuno",
      stampMetadata: {
        headshot:
          "https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/assets%2Fgeneral%2Farticuno_player.png?alt=media",
      },
    },
    // {
    //   name: "",
    //   tournamentID: tournamentDB.id,
    //   backgroundImage: "",
    //   themeColor: "",
    //   nftBountyValue: 0,
    //   maxTickets: 0,
    //   description: "",
    //   stampMetadata: {
    //      headshot: "",
    //   }
    // },
  ];
  const demoLootboxDBs = await Promise.all(
    demoLootboxes.map((lb) => createLootbox(lb, userID))
  );
};

const createDemoLootbox = async (payload: CreateLootboxPayload, userID) => {
  const lootbox = await LootboxService.create(
    {
      description: "A demo Lootbox for an esports tournament",
      backgroundImage: payload.backgroundImage,
      themeColor: payload.themeColor,
      nftBountyValue: payload.nftBountyValue,
      maxTickets: payload.maxTickets,
      lootboxName: payload.name,
      tournamentID: payload.tournamentID as unknown as TournamentID,
      stampMetadata: {
        playerHeadshot: payload.stampMetadata.playerHeadshot ?? undefined,
        logoURLs: payload.stampMetadata.logoURLs ?? undefined,
      },
    },
    userID
  );
};
