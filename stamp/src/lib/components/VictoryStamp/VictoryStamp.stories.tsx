import { $CardViewport } from "../Generics";
import VictoryStamp from ".";

export default {
  title: "VictoryStamp",
  component: VictoryStamp,
};

const Template = () => {
  return (
    <$CardViewport width="900px" height="1650px">
      <VictoryStamp
        coverPhoto={
          "https://lexica-serve-encoded-images2.sharif.workers.dev/full_jpg/2f8a30cc-a1ae-475c-8b82-b91fd96316d7"
        }
        sponsorLogos={[
          "https://png2.cleanpng.com/sh/44a45ac16450e34761814b09a88bf1cc/L0KzQYi4UsIxN5p7iZGAYUPkQoa3hcA6PWNpTJC5OUi3SYe3WcE2OWQ8TqI5MUSzQ4m5VcYxP191htk=/5a3a250e0952d4.09849609151376001403825607.png",
          "https://png2.cleanpng.com/sh/379e97d71ffc3f714cc08576b386ff48/L0KzQYi4UsIxN6ZxfZGAYUPkQbaAVMM4QGc6T5C5MkS0QIq7UME2OWQ8Tao8MkS1Qoi7WMQ1Ol91htk=/5a3a1e74378657.02410940151375832422748442.png",
          "https://png2.cleanpng.com/sh/be9a4f5f9e98703d7f1153cb4af7a861/L0KzQYm3VMA2N6J6fZH0aYP2gLBuTfJicZ8ye9H2cHHxiX70gf5ib5ZyfdD9LXPyfsT8jQRqdpgyeud8aX7og8S0gB9ve15oh995YX78Pb32hB8uPZJoTqJtNEm8QoSAUMAvPWg8UKY5MEm0RYO5WcI5QWcATasDOT7zfri=/kisspng-bain-company-management-consulting-business-cons-company-logo-5ac60d49923700.5778400915229289695989.png",
          "https://png2.cleanpng.com/sh/bdaee07e3ddf6b4c023de8fb6b857540/L0KzQYm3VcI5N6F9kZH0aYP2gLBuTfRmdJDujOZuLXTsd7r7gfwua5DziAd1dHHxhH70gf5ib5ZyfdD9LXPyfsT8jQRqdpgyiNN7ZX73cb20gfR3caR0ius2NXKzcrXtUsI3P2QAfKo3M0O0RoO6UsEyPWM8TaI9Nke3RIO5WL5xdpg=/kisspng-deloitte-digital-consultant-management-consulting-parental-advisory-5b0bdf226739d8.3316232115275046744228.png",
        ]}
        teamName={"Big Boidem"}
        themeColor={"#9f5497"}
        // playerHeadshot={
        //   "https://png2.cleanpng.com/sh/6d6c8f72967f33151f4e8b1d6db0c554/L0KzQYm3V8I0N6ZviZH0aYP2gLBuTfNzaaRtReZCaX72cbBwlQkua6Nmi9o2bnn3grE0iBFzfF5uRd54dnWwecW0hPlocaVmRdlqbXX1PbL9ggRiel46eqcBNnSzQbO7VMcyPl85SqkENkW5RIK8U8I0QWE7TakCM0i3PsH1h5==/kisspng-crash-twinsanity-crash-nitro-kart-i-love-it-digita-gamer-avatar-5b566d01b44716.4279656415323906577384.png"
        // }
        playerHeadshot="https://png2.cleanpng.com/sh/524a89e01501170c6fa886f07af32999/L0KzQYm3V8A6N6lmiZH0aYP2gLBuTgRpfZ5nRdpAbXHxPbPsiPF3cZD3Rd9qc3PyhH7qjPlxNZJ3jJ9wYX3ogn7olvF1aaMyTdQ9MnWzRrLoUMVma2YzSas6OUS6Q4m4VcMyOWEATKo7NkW5SXB3jvc=/kisspng-thumb-human-behavior-mascot-clip-art-gamer-avatar-5b42e06aa05ec5.1919473815311094826569.png"
        qrCodeLink="https://go.lootbox.fund/r?r=12345678"
        ticketValue={"2.1 ETH"}
      />
    </$CardViewport>
  );
};

export const Basic = Template.bind({});
Basic.args = {};
