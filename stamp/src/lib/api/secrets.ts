import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { manifest } from "../../manifest";

const client = new SecretManagerServiceClient();

export const getAuthenticationSecret = async () => {
  const secretConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "STAMP_SECRET"
  );

  if (!secretConfig) {
    throw new Error("Stamp secret not configured");
  }

  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${manifest.googleCloud.projectID}/secrets/${secretConfig.name}/versions/${secretConfig.version}`,
  });

  const secret = accessResponse?.payload?.data?.toString();

  if (!secret) {
    throw new Error("Stamp Secret Not Found");
  }
  return secret;
};
