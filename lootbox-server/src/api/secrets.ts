import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { manifest } from "../manifest";

const client = new SecretManagerServiceClient();

export const getSecret = async (
  secretName: string,
  secretVersion: number | string
): Promise<string> => {
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

export const getWhitelisterPrivateKey = async (): Promise<string> => {
  const secretConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "PARTY_BASKET_WHITELISTER_PRIVATE_KEY"
  );

  if (!secretConfig) {
    console.error(
      'No secret config found for "PARTY_BASKET_WHITELISTER_PRIVATE_KEY"'
    );
    throw new Error("Secret Not Found");
  }

  const whitelisterPrivateKey = await getSecret(
    secretConfig.name,
    secretConfig.version
  );

  return whitelisterPrivateKey;
};

export const getStampSecret = async (): Promise<string> => {
  const secretConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "STAMP_SECRET"
  );

  if (!secretConfig) {
    console.error('No secret config found for "STAMP_SECRET"');
    throw new Error("Secret Not Found");
  }

  const whitelisterPrivateKey = await getSecret(
    secretConfig.name,
    secretConfig.version
  );

  return whitelisterPrivateKey;
};
