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
