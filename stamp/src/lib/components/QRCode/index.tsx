import { FunctionComponent } from "react";

interface QRCodeProps {
  qrLink: string;
  width?: number;
  height?: number;
  showURL?: boolean;
}

const QRCode: FunctionComponent<QRCodeProps> = ({
  qrLink,
  height = 300, // in px
  width = 300, // in px
  showURL = true,
}: QRCodeProps) => {
  const urlSectionHeight = showURL ? 30 : 0; // in px
  let shortURL = qrLink
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "");
  if (shortURL.endsWith("/")) {
    shortURL = shortURL.slice(0, -1);
  }

  return (
    <div
      style={{
        width: width,
        height: height + urlSectionHeight,
      }}
    >
      {showURL && (
        <div
          style={{
            height: urlSectionHeight,
            color: "#00AC1C",
            whiteSpace: "nowrap",
            overflow: "hidden",
            width: width,
            fontFamily: "'Open Sans'",
            fontSize: "20px",
            fontWeight: 800,
          }}
        >
          🔒 {shortURL}
        </div>
      )}
      <img
        id="qrcode"
        // See their docs here: https://goqr.me/api/doc/create-qr-code/
        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          qrLink
        )}&amp;size=${width}x${height}&margin=12`}
        alt=""
        title="🎁 LOOTBOX"
        width={width}
        height={height}
      />
    </div>
  );
};

export default QRCode;
