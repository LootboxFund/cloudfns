import react from "react";
import styled from "styled-components";
import {
  ContractAddress,
  Url,
  COLORS,
  ChainIDHex,
  BLOCKCHAINS,
  chainIdHexToSlug,
  chainIdHexToName,
  ChainSlugs,
} from "@lootboxfund/helpers";
import { $Horizontal } from "../Generics";

export interface TicketProps {
  backgroundImage: Url;
  logoImage: Url;
  themeColor: string;
  name: string;
  ticketID: string;
  lootboxAddress: ContractAddress;
  chainIdHex: ChainIDHex;
  numShares: string;
  blockNumber: string;
}
export const Ticket = (props: TicketProps) => {
  const {
    backgroundImage,
    logoImage,
    name,
    ticketID,
    lootboxAddress,
    chainIdHex,
    numShares,
    blockNumber,
  } = props;
  const networkLogo =
    BLOCKCHAINS[chainIdHexToSlug(chainIdHex) as ChainSlugs].currentNetworkLogo;
  const networkName = chainIdHexToName(chainIdHex);
  return (
    <$TicketContainer backgroundImage={backgroundImage}>
      <$TicketLogo
        backgroundImage={logoImage}
        backgroundShadowColor={props.themeColor}
      ></$TicketLogo>

      <$TicketTag>
        <$TagText>{name}</$TagText>
        <$Divider />
        <$TicketInfo>
          <$TicketIDText>{`#${ticketID}`}</$TicketIDText>
          <$TagInfoText>{`Profit Sharing NFT with ${numShares} shares`}</$TagInfoText>
        </$TicketInfo>
      </$TicketTag>
      <$TagAddressFooter>
        <$Horizontal verticalCenter style={{ textAlign: "center" }}>
          {`Redeem at www.lootbox.fund (${networkName})`}
        </$Horizontal>
        <$Horizontal verticalCenter>
          {lootboxAddress}
          <img
            src={networkLogo}
            style={{ width: "0.9rem", height: "0.9rem", marginLeft: "5px" }}
          />
        </$Horizontal>
      </$TagAddressFooter>
    </$TicketContainer>
  );
};

const BASE_CONTAINER = `
  height: 100%;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const $TicketContainer = styled.section<{
  backgroundColor?: string;
  backgroundImage?: string | undefined;
}>`
  ${BASE_CONTAINER}
  border: 0px solid transparent;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  background: ${(props) =>
    props.backgroundColor
      ? props.backgroundColor
      : `${COLORS.surpressedBackground}15`};
  ${(props) =>
    props.backgroundImage ? `background: url("${props.backgroundImage}");` : ""}
  background-size: cover;
  cursor: pointer;
  background-position: center;
`;

export const $TicketRedeemContainer = styled.section`
  ${BASE_CONTAINER}
  padding: 20px 20px 0px;
`;

export const $TicketLogo = styled.div<{
  backgroundImage?: string;
  backgroundShadowColor?: string;
  width?: string;
  height?: string;
}>`
  width: ${(props) => (props.width ? props.width : "100%")};
  height: ${(props) => (props.height ? props.height : "100%")};
  max-width: ${(props) => (props.backgroundImage ? "220px" : "100px")};
  max-height: ${(props) => (props.backgroundImage ? "220px" : "100px")};
  border: 0px solid transparent;
  border-radius: 50%;
  margin: auto auto 0px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.05);
  ${(props) =>
    props.backgroundImage && `background: url("${props.backgroundImage}");`}
  ${(props) =>
    props.backgroundShadowColor &&
    `filter: drop-shadow(0px 0px 22px ${props.backgroundShadowColor});`}
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const $TicketTag = styled.section`
  width: 85%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  margin: auto auto 20px;
`;

export const $TagText = styled.p`
  font-family: sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 1.5rem;
  line-height: 1.7rem;
  text-align: center;
  position: relative;
  color: #ffffff;
  width: 100%;
  max-width: 50%;
  padding: 5px;
  flex: 1;
`;
const $TicketInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  flex: 1;
  padding: 5px;
`;
export const $TicketIDText = styled.span`
  font-family: sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 2rem;
  line-height: 2rem;
  text-align: center;
  position: relative;
  color: #ffffff;
  width: 100%;
  max-width: 50%;
`;

const $TagInfoText = styled.span`
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 0.8rem;
  line-height: 1rem;
  text-align: center;
  position: relative;
  color: #ffffff;
  width: 100%;
`;

const $TagAddressFooter = styled.div`
  font-family: sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 0.8rem;
  color: rgba(256, 256, 256, 0.7);
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
`;

const $Divider = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.33);
  transform: rotate(0deg);
`;

export default Ticket;
