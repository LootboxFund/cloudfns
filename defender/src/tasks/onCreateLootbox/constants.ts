import { Manifest } from "../../index";
const manifest = Manifest.default;

export const constants = {
  PIPEDREAM_WEBHOOK: (manifest.pipedream.sources.onCreateLootbox as any).webhookEndpoint,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootbox.id,
  FOLDER_NAME: manifest.openZeppelin.autoTasks.onCreateLootbox.slug,
  SECRET: "mysecret",
};
