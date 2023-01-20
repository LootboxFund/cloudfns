import { storage } from "./firebase";
import { manifest } from "../manifest";
import { getRandomImageFromLexicaHardcoded } from "./lexica-images";

interface GBucketSaveFragProps {
  fileName: string;
  data: string;
  bucket: string;
}

export const saveCsvToStorage = async ({
  fileName,
  data,
  bucket,
}: GBucketSaveFragProps) => {
  const file = storage.bucket(bucket).file(fileName);

  await file.save(data);

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  return signedUrl;
};

export const retrieveRandomImage = async (prompt?: string) => {
  return getRandomImageFromLexicaHardcoded();
};

export const retrieveRandomColor = () => {
  const randomHexColor =
    "#" + Math.floor(Math.random() * 16777215).toString(16);
  return randomHexColor;
};

/**
 * The function uses a for loop to generate a random 6-digit hex color. It selects a random
 * character from the letters string, which contains all possible hex digits except for the last 4.
 * This means that the generated color will have a higher chance of being dark, as it is less likely
 * to contain the lighter digits 8, 9, A, B, C, D, E, F.
 */
export const retrieveRandomDarkColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 12)];
  }
  return color;
};
