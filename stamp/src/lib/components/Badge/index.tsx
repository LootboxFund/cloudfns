import * as React from "react";
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
  TYPOGRAPHY,
} from "@wormgraph/helpers";
import { $Horizontal } from "../Generics";
import ReactDOMServer from "react-dom/server";

export interface BadgeProps {
  backgroundImage: Url;
  logoImage: Url;
  themeColor: string;
  guildName: string;
  memberName: string;
  ticketID: string;
  badgeAddress: ContractAddress;
  chainIdHex: ChainIDHex;
}

export const Ticket = (props: BadgeProps) => {
  const {
    backgroundImage,
    logoImage,
    guildName,
    memberName,
    ticketID,
    badgeAddress,
    chainIdHex,
    themeColor,
  } = props;
  const networkLogo =
    BLOCKCHAINS[chainIdHexToSlug(chainIdHex) as ChainSlugs].currentNetworkLogo;
  const networkName = chainIdHexToName(chainIdHex);
  return (
    <section style={StyleTicketContainer({ backgroundImage })}>
      <div style={StyleTagAddressHeader()}>
        <$Horizontal verticalCenter style={{ textAlign: "center" }}>
          {`Powered by $GUILD`}
        </$Horizontal>
      </div>

      <div
        style={StyleTicketLogo({
          backgroundImage: logoImage,
          backgroundShadowColor: themeColor,
        })}
      ></div>

      <div style={StyleTicketTag()}>
        <span style={StyleTicketIDText()}>
          {props.memberName || "Member Name"}
        </span>
        <div style={{ height: "10px", width: "100%" }}></div>
        <span style={StyleTagInfoText()}>
          {props.guildName || "Guild Name"}
        </span>
      </div>
      <div style={StyleTagAddressFooter()}>
        <$Horizontal
          verticalCenter
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            fontWeight: "normal",
          }}
        >
          {`In partnership with BlockchainSpace & Lootbox Fund. View on www.lootbox.fund/badge`}
        </$Horizontal>
        <$Horizontal
          verticalCenter
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            fontWeight: "normal",
          }}
        >
          {`(${networkName})`} {badgeAddress} {`#${ticketID}`}
        </$Horizontal>
      </div>
    </section>
  );
};

const StyleTicketContainer = ({
  backgroundImage,
}: {
  backgroundImage: string;
}) => ({
  height: "100%",
  width: "100%",
  maxHeight: "700px",
  maxWidth: "500px",
  display: "flex" as "flex",
  flexDirection: "column" as "column",
  justifyContent: "center" as "center",
  gap: "10px",
  border: "0px solid transparent",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
  background: `url("${backgroundImage}")`,
  backgroundSize: "cover",
  cursor: "pointer",
  backgroundPosition: "center",
});

const StyleTicketLogo = ({
  backgroundImage,
  backgroundShadowColor,
}: {
  backgroundImage: string;
  backgroundShadowColor: string;
}) => ({
  width: "100%",
  height: "100%",
  maxWidth: "300px",
  maxHeight: "300px",
  border: "0px solid transparent",
  borderRadius: "50%",
  margin: "auto auto 0px",
  boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.2)",
  background: `url("${backgroundImage}")`,
  filter: `drop-shadow(0px 0px 22px ${backgroundShadowColor})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex" as "flex",
  flexDirection: "column" as "column",
  justifyContent: "center" as "center",
});

const StyleTicketTag = () => ({
  width: "85%",
  display: "flex" as "flex",
  flexDirection: "column" as "column",
  justifyContent: "space-around",
  background: "rgba(0, 0, 0, 0.5)",
  borderRadius: "10px",
  margin: "auto",
  padding: "20px",
  alignItems: "center",
});

const StyleTagText = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 800,
  fontSize: "2rem",
  lineHeight: "2.2rem",
  textAlign: "center" as "center",
  position: "relative" as "relative",
  color: "#ffffff",
  width: "100%",
  // maxWidth: "50%",
  padding: "5px",
  flex: 1,
});

const StylePoweredBy = () => ({
  background: "rgba(0, 0, 0, 0.1)",
  borderRadius: "10px",
  fontFamily: `${TYPOGRAPHY.fontFamily.regular}`,
  fontWeight: `${TYPOGRAPHY.fontWeight.bold}`,
  fontSize: `1rem`,
  lineHeight: `1.5rem`,
  padding: `10px 20px`,
  textAlign: `center`,
  position: `relative`,
  color: `#ffffff`,
  width: `auto`,
  margin: `auto`,
});

const StyleTicketIDText = () => ({
  fontFamily: `${TYPOGRAPHY.fontFamily.regular}`,
  fontWeight: `${TYPOGRAPHY.fontWeight.bold}`,
  fontSize: `1.8rem`,
  textAlign: `center` as "center",
  position: `relative` as "relative",
  color: `#ffffff`,
  width: `100%`,
  margin: `auto`,
  wordBreak: "break-all" as "break-all",
});

export const $TagText = styled.span`
  font-family: ${TYPOGRAPHY.fontFamily.regular};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-size: ${TYPOGRAPHY.fontSize.large};
  line-height: ${TYPOGRAPHY.fontSize.xlarge};
  text-align: center;
  position: relative;
  color: #ffffff;
  width: 100%;
  margin: auto;
  word-break: break-all;
`;

const StyleTicketInfo = () => ({
  display: "flex",
  flexDirection: "column" as "column",
  justifyContent: "space-evenly",
  alignItems: "center",
  flex: 1,
  padding: "5px",
});

const $VTicketTag = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 20px 10px;
  box-sizing: border-box;
`;

const StyleTagInfoText = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "1.2rem",
  textAlign: "center" as "center",
  position: "relative" as "relative",
  color: "#ffffff",
  width: "100%",
});

const StyleTagAddressHeader = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "1rem",
  color: "rgba(256, 256, 256, 0.6)",
  height: "auto",
  display: "flex",
  flexDirection: "column" as "column",
  justifyContent: "space-evenly" as "space-evenly",
  alignItems: "center" as "center",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  padding: "5px",
});

const StyleTagAddressFooter = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "1rem",
  color: "rgba(256, 256, 256, 0.6)",
  height: "auto",
  display: "flex",
  flexDirection: "column" as "column",
  justifyContent: "space-evenly" as "space-evenly",
  alignItems: "center" as "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: "5px",
});

const StyleDivider = () => ({
  border: "3px solid rgba(255, 255, 255, 0.33)",
  transform: "rotate(0deg)",
  height: "100%",
});

export default Ticket;
