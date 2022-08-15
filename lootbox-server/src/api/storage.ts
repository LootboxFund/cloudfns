import { storage } from "./firebase";
import { manifest } from "../manifest";

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
