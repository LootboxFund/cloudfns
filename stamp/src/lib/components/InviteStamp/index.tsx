import QRCode from "../QRCode";
import { FunctionComponent } from "react";
import LogoSection from "../LogoSection";
import { LOGO_URL } from "../../../constants";

export interface InviteStampProps {
  coverPhoto: string;
  sponsorLogos: string[];
  teamName: string;
  playerHeadshot?: string;
  themeColor: string;
  ticketValue: string;
  qrCodeLink: string;
  eventName?: string;
  hostName?: string;
}

const InviteStamp: FunctionComponent<InviteStampProps> = (props) => {
  const prizeValues = props.ticketValue
    .slice(0, 20)
    .split(/([\d,\.]+)/g)
    .filter((v) => v !== "");
  const hasNumber = prizeValues.some((v) => !isNaN(Number(v)));
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
        textAlign: "left",
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
          padding: "30px 40px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          // gap: "10px",
          zIndex: "3",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0",
            flex: "1",
            position: "relative",
            fontWeight: "700",
            fontFamily: "inherit",
            fontSize: "150px",
          }}
        >
          FREE
        </h2>
        <div
          style={{
            flex: "1",
            position: "relative",
            height: "127px",
            textAlign: "left",
            fontSize: "72px",
            color: "rgba(255, 255, 255, 0.68)",
            fontFamily: "'Fira Sans'",
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
              width: "398.38px",
              whiteSpace: "nowrap",
            }}
          >
            LOOTBOX&nbsp;
            <img
              src={LOGO_URL}
              alt="Lootbox Fan Tickets"
              style={{
                height: "72px",
                width: "72px",
                marginBottom: "-10px",
                fontSize: "20px",
                fontWeight: "normal",
              }}
            />
          </strong>
          <p
            style={{
              margin: "0",
              position: "absolute",
              top: "76px",
              left: "0px",
              fontSize: "40px",
              fontFamily: "'Open Sans'",
              color: "rgba(255, 255, 255, 0.6)",
              display: "inline-block",
              width: "405px",
              whiteSpace: "nowrap",
            }}
          >
            Gamers win you stuff
          </p>
        </div>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          height: "1240px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "relative",
          zIndex: "2",
          fontSize: "36px",
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
            backgroundPosition: "center",
            zIndex: "0",
          }}
          alt=""
          id="bg1"
          src={props.coverPhoto}
        />
        <div
          style={{
            position: "absolute",
            margin: "0",
            // top: "767px",
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(26, 26, 26, 0.54) 40.26%, #1a1a1a 75.33%)",
            width: "900px",
            height: "493px",
            flexShrink: "0",
            zIndex: "1",
          }}
        />
        <div
          style={{
            margin: "0",
            position: "absolute",
            bottom: "0px",
            left: "0px",
            width: "900px",
            flexShrink: "0",
            display: "flex",
            flexDirection: "row",
            padding: "0px 40px",
            boxSizing: "border-box",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "40px",
            zIndex: "2",
          }}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#ffffff",
              flexShrink: "0",
            }}
          >
            <QRCode qrLink={props.qrCodeLink} width={300} height={300} />
          </div>
          <div
            style={{
              flex: "1",
              height: "324px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h6
              style={{
                margin: "0",
                alignSelf: "stretch",
                position: "relative",
                fontSize: "inherit",
                display: "flex",
                fontStyle: "italic",
                fontWeight: "700",
                fontFamily: "inherit",
                color: "rgba(255, 255, 255, 0.81)",
                alignItems: "center",
                flexShrink: "0",
              }}
            >
              CHANCE TO WIN
            </h6>
            <div
              style={{
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                gap: "16px",
                fontSize: "42px",
              }}
            >
              {prizeValues.map((val, idx) => {
                const isBig = !hasNumber || !isNaN(Number(val));
                if (isBig) {
                  return (
                    <h2
                      key={`prize-value-${val}`}
                      style={{
                        margin: "0",
                        position: "relative",
                        fontSize: "140px",
                        fontWeight: "700",
                        fontFamily: "inherit",
                        lineHeight: "110%",
                      }}
                    >
                      {val}
                    </h2>
                  );
                } else {
                  return (
                    <h6
                      key={`prize-value-${val}`}
                      style={{
                        margin: "0",
                        position: "relative",
                        fontSize: "inherit",
                        fontWeight: "700",
                        fontFamily: "inherit",
                        ...(hasNumber && !isBig && { lineHeight: "100px" }),
                      }}
                    >
                      {val}
                    </h6>
                  );
                }
              })}
            </div>
            <h3
              style={{
                margin: "0",
                alignSelf: "stretch",
                position: "relative",
                fontSize: "56px",
                fontWeight: "700",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {props.teamName.slice(0, 20)}
            </h3>
          </div>
        </div>
        {/* <div
          style={{
            position: "absolute",
            margin: "0",
            top: "167px",
            left: "900px",
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0), ${props.themeColor}BB 50%, ${props.themeColor})`,
            width: "900px",
            height: "167px",
            flexShrink: "0",
            transform: " rotate(-180deg)",
            transformOrigin: "0 0",
            zIndex: "4",
          }}
        /> */}
        {props.playerHeadshot && (
          <img
            style={{
              position: "absolute",
              margin: "0",
              bottom: "330px",
              // left: "calc(50% - 450px)",
              left: "40px", // takes left padding into account from QR code
              maxWidth: "300px",
              width: "100%",
              maxHeight: "380px",
              flexShrink: "0",
              objectFit: "contain",
              backgroundPosition: "center",
              zIndex: "1",
            }}
            alt=""
            id="headshot"
            src={props.playerHeadshot}
          />
        )}
      </div>
      <div
        style={{
          alignSelf: "stretch",
          backgroundColor: "#1a1a1a",
          height: "100px",
          display: "flex",
          flexDirection: "column",
          padding: "0px 40px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1",
          fontSize: "18px",
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        {tournamentLine && (
          <p
            style={{
              margin: "16px 0px 8px 0px",
              width: "100%",
              display: "inline-block",
              fontSize: "26px",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {tournamentLine}
          </p>
        )}
        <p
          style={{
            margin: 0,
            width: "100%",
            lineHeight: "110%",
            display: "inline-block",
          }}
        >
          Visit https://lootbox.tickets. This free fan ticket may entitle the
          holder to fan prizes up to the above value if this contestant wins.
          This is not redeemable as cash nor permitted for sale.
        </p>
      </div>
      <LogoSection logoUrls={props.sponsorLogos} />
    </div>
  );
};

export default InviteStamp;
