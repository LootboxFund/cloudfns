import { $CardViewport } from "../Generics";
import InviteStamp from ".";

export default {
  title: "InviteStamp",
  component: InviteStamp,
};

const Template = () => {
  return (
    <$CardViewport width="900px" height="1650px">
      <InviteStamp
        coverPhoto={
          "https://lexica-serve-encoded-images2.sharif.workers.dev/full_jpg/2f8a30cc-a1ae-475c-8b82-b91fd96316d7"
        }
        sponsorLogos={[
          "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b330348341eb29d8ecbe_image%20130%20(Traced).png",
          "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b34e162261acd46ca9d9_image%20128%20(Traced).png",
          "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b38e4fdd781b6a729125_image%20129%20(Traced).png",
          "https://uploads-ssl.webflow.com/63bd0f8e51e48f5336cc7adb/63c1b3446e8f58197256869a_download-removebg-preview%20(1)%201%20(Traced).png",
        ]}
        teamName={"Big Boidem"}
        themeColor={"#9f5497"}
        // playerHeadshot={
        //   "https://png2.cleanpng.com/sh/6d6c8f72967f33151f4e8b1d6db0c554/L0KzQYm3V8I0N6ZviZH0aYP2gLBuTfNzaaRtReZCaX72cbBwlQkua6Nmi9o2bnn3grE0iBFzfF5uRd54dnWwecW0hPlocaVmRdlqbXX1PbL9ggRiel46eqcBNnSzQbO7VMcyPl85SqkENkW5RIK8U8I0QWE7TakCM0i3PsH1h5==/kisspng-crash-twinsanity-crash-nitro-kart-i-love-it-digita-gamer-avatar-5b566d01b44716.4279656415323906577384.png"
        // }
        playerHeadshot="https://storage.googleapis.com/lootbox-constants-staging/assets/space-girl-headshot-removebg-preview.png"
        qrCodeLink="https://go.lootbox.fund/r?r=12345678"
        // ticketValue={"2.1 ETH"}
        // ticketValue={"3 FREE Jollibee Fried Chicken Sandwiches"}
        eventName="Chaos Regime Sports META"
        hostName="Magneetus Jones III"
        // ticketValue={"$50 USD (out of 100)"}
        ticketValue="Free Prizes Bae"
      />
    </$CardViewport>
  );
};

export const Basic = Template.bind({});
Basic.args = {};
