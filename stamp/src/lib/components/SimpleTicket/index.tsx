import { FunctionComponent } from "react";
import { LOGO_URL } from "../../../constants";
import LogoSection from "../LogoSection";

export interface SimpleTicketProps {
  coverPhoto: string;
  teamName: string;
  playerHeadshot?: string;
  themeColor: string;
  sponsorLogos: string[];
  eventName?: string;
  hostName?: string;
}
const SimpleTicket: FunctionComponent<SimpleTicketProps> = (props) => {
  const tournamentLine =
    props.eventName && props.hostName
      ? `${props.eventName} hosted by ${props.hostName}`
      : props.eventName
      ? `${props.eventName}`
      : props.hostName
      ? `${props.hostName}`
      : undefined;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "1650px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
        color: "#fff",
        fontFamily: "'Open Sans'",
      }}
    >
      <div
        style={{
          alignSelf: "stretch",
          borderRadius: "100px 100px 0px 0px",
          backgroundColor: props.themeColor,
          height: "180px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "row",
          padding: "30px 0px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "3",
        }}
      >
        <h2
          style={{
            margin: "0",
            flex: "1",
            position: "relative",
            fontWeight: "700",
            fontFamily: "inherit",
            fontSize: "100px",
          }}
        >
          {props.teamName.slice(0, 18)}
        </h2>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          height: "1260px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "relative",
          zIndex: "2",
        }}
      >
        <img
          style={{
            alignSelf: "stretch",
            flex: "1",
            position: "relative",
            maxWidth: "100%",
            overflow: "hidden",
            maxHeight: "100%",
            objectFit: "cover",
            zIndex: "0",
          }}
          alt=""
          id="bg1"
          src={props.coverPhoto}
        />

        {props.playerHeadshot && (
          <img
            style={{
              position: "absolute",
              margin: "0",
              // bottom: "324.33px",
              bottom: "0px",
              // left: "calc(50% - 450px)",
              left: "40px", // takes left padding into account from QR code
              maxWidth: "420px",
              width: "100%",
              maxHeight: "520px",
              flexShrink: "0",
              objectFit: "contain",
              zIndex: "2",
            }}
            alt=""
            id="headshot"
            src={props.playerHeadshot}
          />
        )}

        <div
          style={{
            position: "absolute",
            margin: "0",
            bottom: "0px",
            left: "calc(50% - 450px)",
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0), ${props.themeColor}BB 50%, ${props.themeColor})`,
            width: "900px",
            height: "200px",
            flexShrink: "0",
            zIndex: "2",
          }}
        />
      </div>

      <div
        style={{
          alignSelf: "stretch",
          backgroundColor: props.themeColor,
          height: "80px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "row",
          padding: "26px 40px 10px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: "1",
          fontFamily: "Open Sans",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: "34px",
          lineHeight: "57px",
        }}
      >
        <div
          style={{
            flex: "1",
            height: "100%",
            position: "relative",
            textAlign: "left",
            fontFamily: "'Fira Sans'",
            marginTop: "-24px",
          }}
        >
          <strong
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              display: "inline-block",
              fontStyle: "italic",
              fontWeight: "800",
              whiteSpace: "nowrap",
              opacity: 0.5,
            }}
          >
            LOOTBOX&nbsp;
            <img
              src={LOGO_URL}
              alt="Lootbox Fan Tickets"
              style={{
                height: "42px",
                width: "42px",
                marginBottom: "-10px",
                fontSize: "20px",
                fontWeight: "normal",
                filter: "grayscale(100%)",
              }}
            />
          </strong>
          <p
            style={{
              margin: "0",
              position: "absolute",
              top: "32px",
              left: "0px",
              fontFamily: "'Open Sans'",
              display: "inline-block",
              opacity: 0.5,
              fontSize: "22px",
            }}
          >
            Gamers win you stuff
          </p>
        </div>

        {(props.eventName || props.hostName) && (
          <span
            style={{
              opacity: 0.5,
              width: "70%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textAlign: "right",
            }}
          >
            {props.eventName || props.hostName}
          </span>
        )}
      </div>

      <LogoSection
        logoUrls={props.sponsorLogos}
        backgroundColor={props.themeColor}
      />
    </div>
  );
};

export default SimpleTicket;
