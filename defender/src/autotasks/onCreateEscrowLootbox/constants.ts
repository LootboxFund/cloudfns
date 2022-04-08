import manifest from "./manifest.json";

export const constants = {
  PIPEDREAM_WEBHOOK:
    manifest.pipedream.sources.onCreateEscrowLootbox.webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateEscrowLootbox.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateEscrowLootbox.slug,
  PROJECT_ID: manifest.googleCloud.projectID,
};
