import { SecretName } from "@wormgraph/manifest";

// Creates a path to a secret in GCP Secret manager
// I.e. projects/lootbox-fund-development/secrets/test_secret/versions/latest
export const buildSecretsPath = (
  projectName: string,
  secretName: SecretName,
  version: number | "latest"
) => `projects/${projectName}/secrets/${secretName}/versions/${version}`;
