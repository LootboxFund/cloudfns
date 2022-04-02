import manifest from "./manifest.json";

export const constants = {
  PIPEDREAM_WEBHOOK: manifest.pipedream.sources.onCreateLootbox.webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootbox.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateLootbox.slug,
};
