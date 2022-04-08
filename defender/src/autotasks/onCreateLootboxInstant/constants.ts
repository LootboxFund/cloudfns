import manifest from "./manifest.json";

export const constants = {
  PIPEDREAM_WEBHOOK:
    manifest.pipedream.sources.onCreateLootboxInstant.webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootboxInstant.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateLootboxInstant.slug,
  PROJECT_ID: manifest.googleCloud.projectID,
};
