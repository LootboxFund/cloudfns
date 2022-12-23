import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  names,
  animals,
  NumberDictionary,
} from "unique-names-generator";
import * as allLexicaImageSets from "./sets";
import heroPortraits from "./sets/lex-set-hero-portraits";
import epicBackgrounds from "./sets/lex-set-epic-backgrounds";
import eventScenes from "./sets/lex-set-event-scenes";
import abstractObjects from "./sets/lex-set-abstract-objects";
import animeScene from "./sets/lex-set-anime-backgrounds";

const customDictionaries = {
  corporations: [
    "Corp",
    "Inc",
    "Co",
    "Limited",
    "Company",
    "Agency",
    "Studios",
    "Group",
    "Experts",
  ],
  emailClients: [
    "gmail",
    "hotmail",
    "qq",
    "outlook",
    "live",
    "microsoft",
    "protonmail",
    "apple",
    "yahoo",
    "orange",
    "Naver",
    "163",
    "bell",
    "Xfinity",
    "aol",
    "samsung",
    "de",
    "gmx",
  ],
  advertisers: ["Ads", "Marketing", "Sales"],
  organizers: ["Events", "Experiences", "Festival", "Tournament", "Hosting"],
};
type nameType = "advertiser" | "user" | "lootbox" | "organizer" | "event";
interface RandomNameConfig {
  type?: nameType;
  seedEmail?: string;
}
export const getRandomUserName = async (nameConfig?: RandomNameConfig) => {
  // generate based on email
  if (nameConfig?.seedEmail) {
    const generatedUsername = parseEmailIntoUsername(
      nameConfig.seedEmail,
      nameConfig.type
    );

    if (generatedUsername) return generatedUsername;
  }
  // otherwise generate from random library
  const randomNum = NumberDictionary.generate({ min: 100, max: 999 });
  let dictionaries: string[][] = [adjectives, animals, randomNum];
  if (nameConfig?.type === "lootbox") {
    dictionaries = [["Team"], adjectives, animals];
  }
  if (nameConfig?.type === "advertiser") {
    dictionaries = [
      adjectives,
      names,
      customDictionaries.advertisers,
      customDictionaries.corporations,
    ];
  }
  if (nameConfig?.type === "organizer") {
    dictionaries = [
      adjectives,
      names,
      customDictionaries.organizers,
      customDictionaries.corporations,
    ];
  }
  if (nameConfig?.type === "event") {
    dictionaries = [adjectives, names, customDictionaries.organizers];
  }
  const config: Config = {
    dictionaries,
    separator: " ",
    length: dictionaries.length,
    style: "capital",
  };
  const randomName = uniqueNamesGenerator(config);

  return randomName;
};

export const getRandomImageFromLexicaHardcoded = async () => {
  return randomFromArray(randomImages);
};

export const getRandomPortraitFromLexicaHardcoded = async () => {
  return randomFromArray(heroPortraits.images.map((i) => i.src));
};

export const getRandomBackgroundFromLexicaHardcoded = async () => {
  return randomFromArray(epicBackgrounds.images.map((i) => i.src));
};

export const getRandomEventCoverFromLexicaHardcoded = async () => {
  return randomFromArray(
    eventScenes.images.concat(animeScene.images).map((i) => i.src)
  );
};

export const getRandomAdOfferCoverFromLexicaHardcoded = async () => {
  return randomFromArray(abstractObjects.images.map((i) => i.src));
};

// export const getRandomLootboxImagePairingFromLexica = async () => {
//   const randomLootboxImagePairs = [
//     { logo: [] background: [] },
//   ]
// }

export const randomImages: string[] = Object.values(allLexicaImageSets).reduce(
  (acc, curr) => {
    if (curr && curr.images) {
      return acc.concat(curr.images.map((img) => img.src));
    }
    return acc;
  },
  [] as string[]
);
const randomFromArray = (arr: string[]): string => {
  // Get a random index from the array
  var randomIndex = Math.floor(Math.random() * arr.length);

  // Return the value at the random index
  return arr[randomIndex];
};

export const parseEmailIntoUsername = (email, type?: nameType) => {
  // Use a regular expression to match the email and domain
  const regex =
    /^([a-zA-Z0-9]+(?:[\.+_-][a-zA-Z0-9]+)*)@((?:[a-zA-Z0-9]+\.)+[a-zA-Z]{2,})$/;

  // Use the `exec` method to capture the email and domain
  const matches = regex.exec(email);

  // Check if the email and domain were matched
  if (matches === null) {
    // The email was not in the expected format, so return null
    return null;
  }

  // Get the email and domain from the matches array
  // @ts-ignore
  var email = matches[1];
  var domain = matches[2];

  // Remove non-letter characters from the email
  email = email.replace(/[^a-zA-Z]/g, "");

  // Remove the ".com" and TLD from the domain
  domain = domain.replace(/\.com$|\.[a-zA-Z]{2,}$/g, "");

  if (type === "advertiser") {
    const companyName = customDictionaries.emailClients.includes(
      domain.toLowerCase()
    )
      ? `${email} Ads ${randomFromArray(customDictionaries.corporations)}`
      : `${domain} Ads - ${email}`;
    return companyName;
  }
  if (type === "organizer") {
    const companyName = customDictionaries.emailClients.includes(
      domain.toLowerCase()
    )
      ? `${email} Events ${randomFromArray(customDictionaries.corporations)}`
      : `${domain} Events - ${email}`;
    return companyName;
  }
  const randomNum = NumberDictionary.generate({ min: 100, max: 999 });
  return customDictionaries.emailClients.includes(domain.toLowerCase())
    ? `${email} ${randomNum}`
    : `${email} ${domain} ${randomNum}`;
};
