/**
 * PLEASE READ:
 *
 * This code should only be used for local deployments (files like `autotasks/onCreateLootbox/build.ts`)
 * (i.e. by calling $yarn deploy)
 * Because it calls external dependencies that might not be bundled into the autotask / sentinel code
 *
 * Thats because ATM, defender does not support private npm packages ? maybe (tbd)
 *
 * Scripts takes credentials from GCP [DEFAULT_APPLCIATION_CREDENTIALS], authentication should be
 * via gcloud CLI with:
 *
 *  $ gcloud auth application-default login
 *
 * ALWAYS remember to revoke your credentials after deployement:
 *
 *  $ gcloud auth application-default revoke
 */

import {
  latest as Manifest,
  SecretName,
  SecretVersion,
} from "@wormgraph/manifest";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const manifest = Manifest.default;

const client = new SecretManagerServiceClient();

interface DefenderCredentials {
  apiKey: string;
  apiSecret: string;
}

// Creates a path to a secret in GCP Secret manager
// I.e. projects/guildfx-exchange/secrets/test_secret/versions/latest
const buildSecretsPath = (
  projectName: string,
  secretName: SecretName,
  version: SecretVersion
) => `projects/${projectName}/secrets/${secretName}/versions/${version}`;

export const getDefenderApiCredentials = async (): Promise<
  DefenderCredentials | undefined
> => {
  const apiKeyConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "defenderApiKey"
  );
  const apiSecretConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "defenderApiSecret"
  );

  if (!apiKeyConfig || !apiSecretConfig) {
    console.error("Credentials not configured in Manifest");
    return;
  }

  const [[defenderApiKeyResponse], [defenderApiSecretResponse]] =
    await Promise.all([
      client.accessSecretVersion({
        name: buildSecretsPath(
          manifest.googleCloud.projectID,
          "defenderApiKey",
          apiKeyConfig.version
        ),
      }),
      client.accessSecretVersion({
        name: buildSecretsPath(
          manifest.googleCloud.projectID,
          "defenderApiSecret",
          apiSecretConfig.version
        ),
      }),
    ]);

  const [apiKey, apiSecret] = [
    defenderApiKeyResponse?.payload?.data?.toString(),
    defenderApiSecretResponse?.payload?.data?.toString(),
  ];

  if (!apiKey || !apiSecret) {
    console.error("Credentials not configured in GCP Secret Manager");
    return;
  }

  return {
    apiKey,
    apiSecret,
  };
};
