/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_yLugbaW/configuration
 */

// @ts-nocheck
import http from "../../http.app.mjs";
import get from "lodash.get";

// Core HTTP component
export default {
  key: "webhook_onIndexGuildTokens",
  name: "Webhook - onIndexGuildTokens",
  description:
    "Webhook entry point for indexing all JSON files on a GBucket route",
  version: "0.1.1",
  type: "source",
  props: {
    httpInterface: {
      type: "$.interface.http",
      customResponse: true,
    },
    emitBodyOnly: {
      type: "boolean",
      label: "Body Only",
      description:
        "This source emits an event representing the full HTTP request by default. Select `true` to emit the body only.",
      optional: true,
      default: false,
    },
    resStatusCode: {
      type: "string",
      label: "Response Status Code",
      description: "The status code to return in the HTTP response",
      optional: true,
      default: "200",
    },
    resContentType: {
      type: "string",
      label: "Response Content-Type",
      description:
        "The `Content-Type` of the body returned in the HTTP response",
      optional: true,
      default: "application/json",
    },
    resBody: {
      type: "string",
      label: "Response Body",
      description: "The body to return in the HTTP response",
      optional: true,
      default: '{ "success": true }',
    },
    http,
    secret: "string",
  },
  async run(event) {
    const { headers } = event;
    const secret = get(headers, "secret");
    if (secret !== this.secret) {
      this.http.respond({
        status: 400,
      });
    }

    const summary = `${event.method} ${event.path}`;

    this.httpInterface.respond({
      status: this.resStatusCode,
      body: this.resBody,
      headers: {
        "content-type": this.resContentType,
      },
    });

    if (this.emitBodyOnly) {
      this.$emit(event.body, {
        summary,
      });
    } else {
      this.$emit(event, {
        summary,
      });
    }
  },
};
