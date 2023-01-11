import { ReferralSlug } from "@wormgraph/helpers";
import e from "express";
import { FunctionComponent } from "react";

export interface InviteStampProps {
  coverPhoto: string;
  sponsorLogos: string[];
  teamName: string;
  playerHeadshot?: string;
  themeColor: string;
  ticketValue: string;
  referralSlug: ReferralSlug;
}

const InviteStamp: FunctionComponent<InviteStampProps> = (props) => {
  const prizeValues = props.ticketValue
    .slice(0, 20)
    .split(/([\d,\.]+)/g)
    .filter((v) => v !== "");
  const hasNumber = prizeValues.some((v) => !isNaN(Number(v)));

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
        fontSize: "120px",
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
          gap: "10px",
          zIndex: "3",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0",
            flex: "1",
            position: "relative",
            fontSize: "inherit",
            fontWeight: "700",
            fontFamily: "inherit",
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
            fontSize: "64px",
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
            }}
          >
            LOOTBOX <span style={{ fontStyle: "normal" }}>🎁</span>
          </strong>
          <p
            style={{
              margin: "0",
              position: "absolute",
              top: "70px",
              left: "0px",
              fontSize: "42px",
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
          height: "1220px",
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
            top: "727px",
            left: "-1px",
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(26, 26, 26, 0.54) 40.26%, #1a1a1a 75.33%)",
            width: "902px",
            height: "493px",
            flexShrink: "0",
            zIndex: "1",
          }}
        />
        <div
          style={{
            margin: "0",
            position: "absolute",
            top: "895.67px",
            left: "0px",
            width: "900px",
            height: "324px",
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
              width: "300px",
              height: "324px",
              flexShrink: "0",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                backgroundColor: "#d9d9d9",
                width: "300px",
                height: "324px",
              }}
            />
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
              {/* <h6
                style={{
                  margin: "0",
                  position: "relative",
                  fontSize: "inherit",
                  lineHeight: "103.68%",
                  fontWeight: "700",
                  fontFamily: "inherit",
                }}
              >
                $
              </h6>
              <h2
                style={{
                  margin: "0",
                  position: "relative",
                  fontSize: "180px",
                  lineHeight: "103.68%",
                  fontWeight: "700",
                  fontFamily: "inherit",
                }}
              >
                50
              </h2>
              <h6
                style={{
                  margin: "0",
                  position: "relative",
                  fontSize: "inherit",
                  fontWeight: "700",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ lineHeight: "103.68%" }}>{`USD `}</span>
              </h6> */}
            </div>
            <h3
              style={{
                margin: "0",
                alignSelf: "stretch",
                position: "relative",
                fontSize: "56px",
                fontWeight: "700",
                fontFamily: "inherit",
              }}
            >
              {props.teamName.slice(0, 20)}
            </h3>
          </div>
        </div>
        {props.playerHeadshot && (
          <img
            style={{
              position: "absolute",
              margin: "0",
              bottom: "324.33px",
              left: "calc(50% - 450px)",
              width: "495px",
              height: "387px",
              flexShrink: "0",
              objectFit: "cover",
              zIndex: "3",
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
          height: "110px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "row",
          padding: "26px 40px 0px",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1",
          fontSize: "25px",
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        <p
          style={{
            margin: "0",
            flex: "1",
            position: "relative",
            lineHeight: "110%",
            display: "inline-block",
            height: "94px",
          }}
        >
          Visit https://lootbox.tickets. This free fan ticket entitles the
          holder to fan prizes up to the above value if this contestant wins a
          predefined achievement. This is not redeemable as cash nor permitted
          for sale.
        </p>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          borderRadius: "0px 0px 38px 38px",
          backgroundColor: "#1a1a1a",
          height: "145px",
          flexShrink: "0",
          display: "flex",
          flexDirection: "row",
          padding: "16px",
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
            gap: "15px",
          }}
        >
          <img
            style={{
              flex: "1",
              position: "relative",
              maxWidth: "100%",
              overflow: "hidden",
              height: "112px",
              objectFit: "cover",
            }}
            alt=""
            src="../rectangle-173@1x.png"
          />
          <img
            style={{
              flex: "1",
              position: "relative",
              maxWidth: "100%",
              overflow: "hidden",
              height: "112px",
              objectFit: "cover",
            }}
            alt=""
            src="../rectangle-174@1x.png"
          />
          <img
            style={{
              flex: "1",
              position: "relative",
              maxWidth: "100%",
              overflow: "hidden",
              height: "112px",
              objectFit: "cover",
            }}
            alt=""
            src="../rectangle-175@1x.png"
          />
          <img
            style={{
              flex: "1",
              position: "relative",
              maxWidth: "100%",
              overflow: "hidden",
              height: "112px",
              objectFit: "cover",
            }}
            alt=""
            src="../rectangle-1731@1x.png"
          />
        </div>
      </div>
    </div>
  );
};

export default InviteStamp;
