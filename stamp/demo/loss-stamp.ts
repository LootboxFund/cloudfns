import { generateLossStamp } from "../src/lib/api/stamp";

const demo = async () => {
  console.log(`Generating image...`);
  const now = new Date().valueOf();
  const tempLocalPath = `export/image_${now}.png`;
  const linkToImage = await generateLossStamp(tempLocalPath, {
    coverPhoto:
      "https://lexica-serve-encoded-images2.sharif.workers.dev/full_jpg/2f8a30cc-a1ae-475c-8b82-b91fd96316d7",
    teamName: "Big Boidem",
    themeColor: "#065535",
    // playerHeadshot:
    //   "https://png2.cleanpng.com/sh/6d6c8f72967f33151f4e8b1d6db0c554/L0KzQYm3V8I0N6ZviZH0aYP2gLBuTfNzaaRtReZCaX72cbBwlQkua6Nmi9o2bnn3grE0iBFzfF5uRd54dnWwecW0hPlocaVmRdlqbXX1PbL9ggRiel46eqcBNnSzQbO7VMcyPl85SqkENkW5RIK8U8I0QWE7TakCM0i3PsH1h5==/kisspng-crash-twinsanity-crash-nitro-kart-i-love-it-digita-gamer-avatar-5b566d01b44716.4279656415323906577384.png",
    playerHeadshot:
      "https://storage.googleapis.com/lootbox-constants-staging/assets/space-girl-headshot-removebg-preview.png",
    // ticketValue: "$1000 USD",
    qrCodeLink: "https://go.lootbox.fund/r?r=12345678",
    sponsorLogos: [
      "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b330348341eb29d8ecbe_image%20130%20(Traced).png",
      "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b34e162261acd46ca9d9_image%20128%20(Traced).png",
      "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b38e4fdd781b6a729125_image%20129%20(Traced).png",
      "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b3446e8f58197256869a_download-removebg-preview%20(1)%201%20(Traced).png",
    ],
    eventName: "Chaos Regime Sports META",
    hostName: "Magneetus Jones III",
    ticketValue: "3 FREE 2 Jollibee Fried 4 Chicken",
  });
  console.log(`linkToImage = ${linkToImage}`);
};
demo();
