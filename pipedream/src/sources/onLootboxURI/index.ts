/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_76u2zgb/configuration
 */
import get from "lodash/get";
import { Manifest } from "../../index"; 
const manifest = Manifest.default

const source = {
  key: manifest.pipedream.sources.onLootboxURI.slug,
  name: manifest.pipedream.sources.onLootboxURI.alias,
  description: "Webhook entry point to upload Lootbox URI to GBucket",
  version: "0.0.2",
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
      optional: false,
      default: true,
    },
    resStatusCode: {
      type: "string",
      label: "Response Status Code",
      description: "The status code to return in the HTTP response",
      optional: false,
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
