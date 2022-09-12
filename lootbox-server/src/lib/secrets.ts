import { getSecret } from "../api/secrets";
import { manifest } from "../manifest";

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
