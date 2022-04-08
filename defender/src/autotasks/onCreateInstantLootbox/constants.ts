import manifest from "./manifest.json";

export const constants = {
  PIPEDREAM_WEBHOOK:
    manifest.pipedream.sources.onCreateInstantLootbox.webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateInstantLootbox.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateInstantLootbox.slug,
  PROJECT_ID: manifest.googleCloud.projectID,
};
