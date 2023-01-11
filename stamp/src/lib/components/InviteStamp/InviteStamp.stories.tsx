import React from "react";
import { $CardViewport } from "../Generics";
import { useEffect } from "react";
import { ContractAddress, LootboxID, ReferralSlug } from "@wormgraph/helpers";
import InviteStamp from ".";

export default {
  title: "InviteStamp",
  component: InviteStamp,
};

const Template = () => {
  return (
    <$CardViewport width="900px" height="1650px">
      <InviteStamp
        coverPhoto={
          "https://lexica-serve-encoded-images2.sharif.workers.dev/full_jpg/2f8a30cc-a1ae-475c-8b82-b91fd96316d7"
        }
        sponsorLogos={[]}
        teamName={"Big Boidem"}
        themeColor={"#9f5497"}
        // themeColor={"#A3D11A"}
        playerHeadshot={
          "https://lexica-serve-encoded-images2.sharif.workers.dev/md/e2036ab2-efc5-4150-bf7f-f205b059cb45"
        }
        referralSlug={"newton" as ReferralSlug}
        ticketValue={"2.1 ETH"}
      />
    </$CardViewport>
  );
};

export const Basic = Template.bind({});
Basic.args = {};
