import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  names,
} from "unique-names-generator";
import * as allLexicaImageSets from "./sets";
import heroPortraits from "./sets/lex-set-hero-portraits";
import epicBackgrounds from "./sets/lex-set-epic-backgrounds";
import eventScenes from "./sets/lex-set-event-scenes";
import abstractObjects from "./sets/lex-set-abstract-objects";

export const getRandomUserName = async () => {
  const config: Config = {
    dictionaries: [adjectives, names],
    separator: " ",
    length: 2,
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
  return randomFromArray(eventScenes.images.map((i) => i.src));
};

export const getRandomAdOfferCoverFromLexicaHardcoded = async () => {
  return randomFromArray(abstractObjects.images.map((i) => i.src));
};

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
