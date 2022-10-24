import React from "react";
import Ticket from ".";
import { $CardViewport } from "../Generics";
import { useEffect } from "react";
import { ContractAddress, LootboxID } from "@wormgraph/helpers";

export default {
  title: "Ticket",
  component: Ticket,
};

const Template = () => {
  const [lootboxAddress, setLootboxAddress] = React.useState<ContractAddress>(
    "0x1c69bcBCb7f860680cDf9D4914Fc850a61888f89" as ContractAddress
  );
  const ticketID = "0";

  useEffect(() => {
    setLootboxAddress(lootboxAddress);
  }, []);

  return (
    <$CardViewport width="500px" height="700px">
      <Ticket
        ticketID={ticketID}
        backgroundImage="https://i.pinimg.com/originals/81/58/59/8158595c37f199953cf6a13d7034d258.png"
        logoImage="https://qph.fs.quoracdn.net/main-qimg-6c48d7960b41bb4d1cdd310087430503-lq"
        themeColor="#00bcd4"
        name="Steppe Industry Faction"
        lootboxAddress={lootboxAddress}
        chainIdHex="0x38"
        lootboxID={"ljsdbfljb123jlhbasd" as LootboxID}
      />
    </$CardViewport>
  );
};

export const Basic = Template.bind({});
Basic.args = {};
