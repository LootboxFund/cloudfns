import { FunctionComponent } from "react";

interface QRCodeProps {
  qrLink: string;
  width?: number;
  height?: number;
}
// const QRCode: FunctionComponent<QRCodeProps> = (props: QRCodeProps) => {
//   const ref = useRef<HTMLDivElement>();
//   useEffect(() => {
//     const link = `${manifest.microfrontends.webflow.referral}?r=${props.qrLink}`;
//     var options_object = {
//       // ====== Basic
//       text: link,
//       width: props.width ?? 300,
//       height: props.height ?? 300,
//       colorDark: "#000000",
//       colorLight: "#ffffff",
//       correctLevel: QRCodeComponent.CorrectLevel.H, // L, M, Q, <H></H>
//       quietZone: 12,
//       /*
//         title: 'QR Title', // content

//         titleColor: "#004284", // color. default is "#000"
//         titleBackgroundColor: "#fff", // background color. default is "#fff"
//         titleHeight: 70, // height, including subTitle. default is 0
//         titleTop: 25, // draws y coordinates. default is 30
//     */
//     };
//     if (ref.current) {
//       new QRCodeComponent(ref.current, options_object);
//     }
//   }, [props.qrLink]);

//   return (
//     <div
//       id="qrcode"
//       ref={ref}
//       style={{ margin: "auto", position: "absolute", top: "0px", left: "0px" }}
//     />
//   );
// };

// export default QRCode;

const QRCode: FunctionComponent<QRCodeProps> = ({
  qrLink,
  height = 300,
  width = 300,
}: QRCodeProps) => {
  // const ref = createRef<HTMLDivElement>();
  // // const ref = useRef<HTMLDivElement>();
  // useEffect(() => {
  //   const link = `${manifest.microfrontends.webflow.referral}?r=${qrLink}`;
  //   var options_object = {
  //     // ====== Basic
  //     text: link,
  //     width: width,
  //     height: height,
  //     colorDark: "#000000",
  //     colorLight: "#ffffff",
  //     correctLevel: QRCodeComponent.CorrectLevel.H, // L, M, Q, <H></H>
  //     quietZone: 12,
  //     /*
  //       title: 'QR Title', // content

  //       titleColor: "#004284", // color. default is "#000"
  //       titleBackgroundColor: "#fff", // background color. default is "#fff"
  //       titleHeight: 70, // height, including subTitle. default is 0
  //       titleTop: 25, // draws y coordinates. default is 30
  //   */
  //   };
  //   if (ref.current) {
  //     new QRCodeComponent(ref.current, options_object);
  //   }
  // }, [qrLink]);

  return (
    <img
      id="barcode"
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrLink
      )}&amp;size=${width}x${height}&margin=12`}
      alt=""
      title="🎁 LOOTBOX"
      width={width}
      height={height}
    />
    // <div
    //   id="qrcode"
    //   ref={ref}
    //   style={{ margin: "auto", position: "absolute", top: "0px", left: "0px" }}
    // />
  );
};

export default QRCode;
