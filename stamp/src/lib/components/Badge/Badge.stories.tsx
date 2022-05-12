import React from "react";
import Badge from ".";
import { $CardViewport } from "../Generics";
import { useEffect } from "react";
import { ContractAddress } from "@wormgraph/helpers";

export default {
  title: "Badge",
  component: Badge,
};

const Template = () => {
  const [badgeAddress, setBadgeAddress] = React.useState<ContractAddress>(
    "0x1c69bcBCb7f860680cDf9D4914Fc850a61888f89" as ContractAddress
  );
  const ticketID = "0";

  useEffect(() => {
    setBadgeAddress(badgeAddress);
  }, []);

  return (
    <$CardViewport width="500px" height="700px">
      <Badge
        ticketID={ticketID}
        backgroundImage="https://i.pinimg.com/originals/81/58/59/8158595c37f199953cf6a13d7034d258.png"
        logoImage="https://qph.fs.quoracdn.net/main-qimg-6c48d7960b41bb4d1cdd310087430503-lq"
        themeColor="#00bcd4"
        guildName="Steppe Industry Faction"
        memberName="John Doe"
        badgeAddress={badgeAddress}
        chainIdHex="0x38"
        numShares="180.02"
      />
    </$CardViewport>
  );
};

export const Basic = Template.bind({});
Basic.args = {};
