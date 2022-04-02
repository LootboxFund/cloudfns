import manifest from "./manifest.json";

const secret = manifest.secretManager.secrets.find(
  (secret) => secret.name === "JWT_ON_CREATE_LOOTBOX"
);

export const constants = {
  PIPEDREAM_WEBHOOK: manifest.pipedream.sources.onCreateLootbox.webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootbox.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateLootbox.slug,
  PROJECT_ID: manifest.googleCloud.projectID,
  SECRET_NAME: secret?.name,
  SECRET_VERSION: secret?.version,
};
