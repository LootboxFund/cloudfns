/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_76u2zgb/configuration
 */

const source = {
  key: "sandbox_source",
  name: "Sandbox - Source",
  description:
    "Webhook entry point for creating an index of all JSON files stored on GBucket route",
  version: "0.1.5",
  props: {},
  async run() {
    (this as any).$emit(
      {},
      {
        hello: "world",
      }
    );
    // const { headers } = event;
    // const secret = get(headers, "secret");
    // if (secret !== this.secret) {
    //   this.http.respond({
    //     status: 400,
    //   });
    // }

    // const summary = `${event.method} ${event.path}`;

    // this.httpInterface.respond({
    //   status: this.resStatusCode,
    //   body: this.resBody,
    //   headers: {
    //     "content-type": this.resContentType,
    //   },
    // });

    // if (this.emitBodyOnly) {
    //   this.$emit(event.body, {
    //     summary,
    //   });
    // } else {
    //   this.$emit(event, {
    //     summary,
    //   });
    // }
  },
};

export = source;
