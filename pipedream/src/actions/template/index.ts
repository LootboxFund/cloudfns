import { defineAction } from "ironpipe";

const action = defineAction({
  name: "Template Action",
  description: "Template Action for Pipedream Typescript",
  key: "templateAction",
  version: "0.1.0",
  type: "action",
  props: {
    // googleCloud: {
    //   type: "app",
    //   app: "google_cloud",
    // },
    // webhookTrigger: {
    //   type: "object",
    // },
  },
  async run() {
    console.log(this.$props);
  },
});

export = action;
