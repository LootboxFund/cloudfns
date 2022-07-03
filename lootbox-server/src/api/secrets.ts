import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { manifest } from "../manifest";

const client = new SecretManagerServiceClient();

export const getSecret = async (
  secretName: string,
  secretVersion: number | string
): Promise<string> => {
  console.log("fetching secret", secretName, secretVersion);
  const [secretPayload] = await client.accessSecretVersion({
    name: `projects/${manifest.googleCloud.projectID}/secrets/${secretName}/versions/${secretVersion}`,
  });

  const secret = secretPayload?.payload?.data?.toString();

  if (!secret) {
    console.error(
      "secret not found in secret manager",
      secretName,
      secretVersion
    );
    throw new Error("Secret Not Found");
  }

  return secret;
};
