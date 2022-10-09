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
  Address,
} from "@wormgraph/helpers";
import { $Horizontal } from "../Generics";
import ReactDOMServer from "react-dom/server";

export interface TicketProps {
  backgroundImage: Url;
  logoImage: Url;
  themeColor: string;
  name: string;
  lootboxAddress: Address;
  chainIdHex: ChainIDHex;
  ticketID?: string;
}
export const Ticket = (props: TicketProps) => {
  const {
    backgroundImage,
    logoImage,
    name,
    ticketID,
    lootboxAddress,
    chainIdHex,
    themeColor,
  } = props;
  const networkLogo =
    BLOCKCHAINS[chainIdHexToSlug(chainIdHex) as ChainSlugs].currentNetworkLogo;
  const networkName = chainIdHexToName(chainIdHex);
  return (
    <section style={StyleTicketContainer({ backgroundImage })}>
      <div style={StyleTicketTag()}>
        <$Horizontal verticalCenter style={{ textAlign: "center" }}>
          Fan rewards powered by LOOTBOX 🎁
        </$Horizontal>
      </div>
      <div
        style={StyleTicketLogo({
          backgroundImage: logoImage,
          backgroundShadowColor: themeColor,
        })}
      ></div>
      {ticketID ? (
        <div style={StyleTicketTag()}>
          <span style={StyleTagText()}>{name}</span>
          <div style={StyleDivider()} />
          <div style={StyleTicketInfo()}>
            <span style={StyleTicketIDText()}>{`#${ticketID}`}</span>
          </div>
        </div>
      ) : (
        <div style={StyleTicketTag()}>
          <span style={StyleTagText()}>{name}</span>
        </div>
      )}
      <div style={StyleTagAddressFooter()}>
        <$Horizontal verticalCenter style={{ textAlign: "center" }}>
          {`Redeem at www.lootbox.fund (${networkName})`}
        </$Horizontal>
        <$Horizontal verticalCenter>
          {lootboxAddress}
          <img
            src={networkLogo}
            style={{ width: "1.2rem", height: "1.2rem", marginLeft: "5px" }}
          />
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
  boxShadow: backgroundShadowColor
    ? `0px 0px 40px 10px ${backgroundShadowColor}`
    : "0px 10px 10px rgba(0, 0, 0, 0.2)",
  background: `url("${backgroundImage}")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex" as "flex",
  flexDirection: "column" as "column",
  justifyContent: "center" as "center",
});

const StyleTicketTag = () => ({
  width: "85%",
  display: "flex" as "flex",
  flexDirection: "row" as "row",
  justifyContent: "space-around",
  background: "rgba(0, 0, 0, 0.5)",
  borderRadius: "10px",
  margin: "auto",
  padding: "10px",
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

const StyleTicketInfo = () => ({
  display: "flex",
  flexDirection: "column" as "column",
  justifyContent: "space-evenly",
  alignItems: "center",
  flex: 1,
  padding: "5px",
});

const StyleTicketIDText = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 800,
  fontSize: "3rem",
  lineHeight: "3rem",
  textAlign: "center" as "center",
  position: "relative" as "relative",
  color: "#ffffff",
  width: "100%",
  // maxWidth: "50%",
});

const StyleTagInfoText = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "1.2rem",
  lineHeight: "1.3rem",
  textAlign: "center" as "center",
  position: "relative" as "relative",
  color: "#ffffff",
  width: "100%",
});

const StyleTagHeader = () => ({
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
