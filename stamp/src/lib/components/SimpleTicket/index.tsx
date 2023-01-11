import { FunctionComponent } from "react";

export interface SimpleTicketProps {
  coverPhoto: string;
  sponsorLogos: string[];
  teamName: string;
  playerHeadshot?: string;
  themeColor: string;
}
const SimpleTicket: FunctionComponent<SimpleTicketProps> = (props) => {
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
          height: "1230px",
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
              maxHeight: "620px",
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
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0), ${props.themeColor}AB 50%, ${props.themeColor})`,
            width: "900px",
            height: "167px",
            flexShrink: "0",
            zIndex: "2",
          }}
        />
      </div>
      <div
        style={{
          alignSelf: "stretch",
          backgroundColor: props.themeColor,
          height: "110px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "row",
          padding: "26px 50px 10px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1",
          fontSize: "62px",
          fontFamily: "'Fira Sans'",
        }}
      >
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "23px",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "358px",
              flexShrink: "0",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontWeight: "800" }}>🎁</span>
            <i style={{ fontWeight: "800" }}> LOOTBOX</i>
          </div>
          <div
            style={{
              position: "relative",
              fontSize: "42px",
              fontFamily: "'Open Sans'",
              textAlign: "left",
            }}
          >
            Gamers win you stuff
          </div>
        </div>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          borderRadius: "0px 0px 38px 38px",
          backgroundColor: props.themeColor,
          height: "130px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "row",
          padding: "20px 40px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "0",
        }}
      >
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {props.sponsorLogos.slice(0, 4).map((logo, idx) => {
            return (
              <img
                key={`sponsor-logo-${idx}`}
                src={logo}
                style={{
                  maxWidth: "200px",
                  flex: "1",
                  position: "relative",
                  maxHeight: "88px",
                  height: "100%",
                  objectFit: "contain",
                  backgroundPosition: "center",
                  filter: "grayscale(100%)",
                  margin: "auto",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SimpleTicket;
