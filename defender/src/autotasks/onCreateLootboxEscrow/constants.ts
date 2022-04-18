import manifest from "./manifest.json";

export const constants = {
  PIPEDREAM_WEBHOOK:
    manifest.pipedream.sources.onCreateLootboxEscrow.webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootboxEscrow.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateLootboxEscrow.slug,
  PROJECT_ID: manifest.googleCloud.projectID,
};
