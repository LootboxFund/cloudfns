/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_76u2zgb/configuration
 */
import { defineComponent } from "ironpipe";
import get from "lodash/get";

// Core HTTP component
const source = {
  key: "webhook_onCreateGuildToken",
  name: "Webhook - onCreateGuildToken",
  description:
    "Webhook entry point for creating an index of all JSON files stored on GBucket route",
  version: "0.0.1",
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
    // http,
    secret: "string",
  },
  async run(event: any) {
    const { headers } = event;
    const secret = get(headers, "secret");
    if (secret !== (this as any).secret) {
      (this as any).http.respond({
        status: 400,
      });
    }

    const summary = `${event.method} ${event.path}`;

    (this as any).httpInterface.respond({
      status: (this as any).resStatusCode,
      body: (this as any).resBody,
      headers: {
        "content-type": (this as any).resContentType,
      },
    });

    if ((this as any).emitBodyOnly) {
      (this as any).$emit(event.body, {
        summary,
      });
    } else {
      (this as any).$emit(event, {
        summary,
      });
    }
  },
};

export = source;
