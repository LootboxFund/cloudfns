import QRCode from "../QRCode";
import { FunctionComponent } from "react";
import LogoSection from "../LogoSection";

export interface LossStampProps {
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

const LossStamp: FunctionComponent<LossStampProps> = (props) => {
  const prizeValues = props.ticketValue
    .slice(0, 20)
    .split(/([\d,\.]+)/g)
    .filter((v) => v !== "");
  const hasNumber = prizeValues.some((v) => !isNaN(Number(v)));
  const bottomColor = "#191919";
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
        fontSize: "64px",
        color: "rgba(255, 255, 255, 0.71)",
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
          // zIndex: "3",
          textAlign: "center",
          fontFamily: "'Fira Sans'",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "820.69px",
            height: "77px",
            flexShrink: "0",
          }}
        >
          <i
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              display: "inline-block",
              fontWeight: "800",
              width: "305.79px",
              zIndex: 5,
            }}
          >
            LOOTBOX
          </i>
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "317.5px",
              fontSize: "42px",
              fontFamily: "'Open Sans'",
              textAlign: "left",
              display: "inline-block",
              width: "503.19px",
              whiteSpace: "nowrap",
              zIndex: 5,
            }}
          >
            Gamers win you stuff 🎁
          </div>
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
          fontSize: "300px",
          color: "#fff",
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
        <img
          style={{
            position: "absolute",
            margin: "0",
            bottom: "260px",
            left: "40px",
            maxWidth: "420px",
            width: "100%",
            maxHeight: "520px",
            flexShrink: "0",
            objectFit: "contain",
            backgroundPosition: "center",
            zIndex: "1",
          }}
          alt=""
          id="headshot"
          src={props.playerHeadshot}
        />
        <div
          style={{
            position: "absolute",
            margin: "0",
            top: "750px",
            // background: `linear-gradient(180deg, rgba(0, 0, 0, 0), ${props.themeColor}BB 40.26%, ${props.themeColor} 75.33%)`,
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(26, 26, 26, 0.54) 40.26%, #1a1a1a 75.33%)`,
            width: "900px",
            height: "493px",
            flexShrink: "0",
            zIndex: "2",
          }}
        />
        <div
          style={{
            margin: "0",
            position: "absolute",
            top: "843.67px",
            left: "0px",
            width: "900px",
            display: "flex",
            flexDirection: "row",
            boxSizing: "border-box",
            alignItems: "center",
            justifyContent: "flex-start",
            zIndex: "3",
            textAlign: "center",
          }}
        >
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <h1
              style={{
                margin: "0",
                position: "relative",
                textAlign: "center",
                flexShrink: "0",
                fontSize: "inherit",
                fontFamily: "inherit",
                lineHeight: "100%",
              }}
            >
              LOSE
            </h1>
            <div
              style={{
                position: "relative",
                width: "900px",
                height: "110px",
                flexShrink: "0",
                fontSize: "90px",
                fontFamily: "'Open Sans'",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: "auto",
                  position: "absolute",
                  top: "-30px",
                  left: "0px",
                  fontSize: "inherit",
                  fontWeight: "700",
                  fontFamily: "inherit",
                  width: "100%",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {props.teamName.slice(0, 18)}
              </h3>
            </div>
          </div>
        </div>
        <div
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
        />
        <div
          style={{
            margin: "0",
            position: "absolute",
            // top: "0",
            top: "-30px",
            left: "60px",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            zIndex: "5",
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
        <div
          style={{
            position: "absolute",
            margin: "0",
            top: "-40px",
            left: "541px",
            boxShadow: `0px 4px 100px ${props.themeColor}`,
            width: "334px",
            height: "404.12px",
            flexShrink: "0",
            zIndex: "6",
            fontSize: "48px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              borderRadius: "20px",
              backgroundColor: props.themeColor,
              width: "334px",
              height: "403.82px",
            }}
          />
          <b
            style={{
              position: "absolute",
              top: "338px",
              left: "20px",
              lineHeight: "103.68%",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              width: "300px",
              height: "55px",
            }}
          >
            PLAY AGAIN
          </b>
          <div
            style={{
              position: "absolute",
              top: "22px",
              left: "17px",
              width: "300px",
              height: "324px",
            }}
          >
            {/* <img
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "300px",
                height: "324px",
                objectFit: "cover",
              }}
              alt=""
              src="../rectangle-173@1x.png"
            /> */}
            <QRCode
              qrLink={props.qrCodeLink}
              width={300}
              height={300}
              showURL={false}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          backgroundColor: bottomColor,
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
              margin: "8px 0px",
              width: "100%",
              display: "inline-block",
              fontSize: "26px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            {tournamentLine}
          </p>
        )}
        <p
          style={{
            margin: "0",
            width: "100%",
            lineHeight: "110%",
            display: "inline-block",
            textAlign: "center",
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

export default LossStamp;
