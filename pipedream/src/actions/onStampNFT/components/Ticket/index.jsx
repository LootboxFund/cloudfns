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

const SPACING_VALS = [4, 8, 16, 24, 48];

const $Horizontal = styled.div`
  display: flex;
  ${(props) => props.flex && `flex: ${props.flex};`};
  ${(props) =>
    props.justifyContent && `justify-content: ${props.justifyContent};`};
  ${(props) => props.verticalCenter && "align-items: center;"};
  ${(props) => props.baseline && "align-items: baseline;"};
  ${(props) => props.flexWrap && "flex-wrap: wrap;"};
  ${(props) => props.alignItems && `align-items: ${props.alignItems};`};
  ${(props) => props.height && `height: ${props.height};`}
  ${(props) => props.width && `width: ${props.width};`}
  ${(props) => props.overflowHidden && `overflow: hidden;`}
  ${(props) => props.position && `position: ${props.position};`}
  
  & > *:not(:last-child) {
    margin-right: ${(props) =>
      props.spacing && `${SPACING_VALS[props.spacing - 1]}px`};
  }
`;

// interface TicketProps {
//   backgroundImage: Url;
//   logoImage: Url;
//   themeColor: string;
//   name: string;
//   ticketID: string;
//   lootboxAddress: ContractAddress;
//   chainIdHex: ChainIDHex;
//   numShares: string;
// }
const Ticket = (props) => {
  const {
    backgroundImage,
    logoImage,
    name,
    ticketID,
    lootboxAddress,
    chainIdHex,
    numShares,
    themeColor,
  } = props;
  const networkLogo =
    BLOCKCHAINS[chainIdHexToSlug(chainIdHex)].currentNetworkLogo;
  const networkName = chainIdHexToName(chainIdHex);
  return (
    <section style={StyleTicketContainer({ backgroundImage })}>
      <div
        style={StyleTicketLogo({
          backgroundImage: logoImage,
          backgroundShadowColor: themeColor,
        })}
      ></div>

      <div style={StyleTicketTag()}>
        <span style={StyleTagText()}>{name}</span>
        <div style={StyleDivider()} />
        <div style={StyleTicketInfo()}>
          <span style={StyleTicketIDText()}>{`#${ticketID}`}</span>
          <span
            style={StyleTagInfoText()}
          >{`Profit Sharing NFT with ${numShares} shares`}</span>
        </div>
      </div>
      <div style={StyleTagAddressFooter()}>
        <$Horizontal verticalCenter style={{ textAlign: "center" }}>
          {`Redeem at www.lootbox.fund (${networkName})`}
        </$Horizontal>
        <$Horizontal verticalCenter>
          {lootboxAddress}
          <img
            src={networkLogo}
            style={{ width: "1.3rem", height: "1.3rem", marginLeft: "5px" }}
          />
        </$Horizontal>
      </div>
    </section>
  );
};

const StyleTicketContainer = ({ backgroundImage }) => ({
  height: "100%",
  width: "100%",
  maxHeight: "700px",
  maxWidth: "500px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
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

const StyleTicketLogo = ({ backgroundImage, backgroundShadowColor }) => ({
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
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

const StyleTicketTag = () => ({
  width: "85%",
  display: "flex",
  flexDirection: "row",
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
  textAlign: "center",
  position: "relative",
  color: "#ffffff",
  width: "100%",
  maxWidth: "50%",
  padding: "5px",
  flex: 1,
});

const StyleTicketInfo = () => ({
  display: "flex",
  flexDirection: "column",
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
  textAlign: "center",
  position: "relative",
  color: "#ffffff",
  width: "100%",
  maxWidth: "50%",
});

const StyleTagInfoText = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "1.2rem",
  lineHeight: "1.3rem",
  textAlign: "center",
  position: "relative",
  color: "#ffffff",
  width: "100%",
});

const StyleTagAddressFooter = () => ({
  fontFamily: "sans-serif",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "1.2rem",
  color: "rgba(256, 256, 256, 0.6)",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-evenly",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: "5px",
});

const StyleDivider = () => ({
  border: "3px solid rgba(255, 255, 255, 0.33)",
  transform: "rotate(0deg)",
  height: "100%",
});

module.exports = Ticket;
