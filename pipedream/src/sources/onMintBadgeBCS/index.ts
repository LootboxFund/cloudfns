/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_76u2zgb/configuration
 */

const source = {
  key: "onMintBadgeBCS",
  name: "Badge BCS OnMint",
  description:
    "Webhook entry point for handling a MintBadge event. OZ sends to Pipedream here.",
  version: "0.1.0",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
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
  },
  async run(event: any) {
    // ########################################################
    //
    //                    AUTHENTICATION
    //
    // ########################################################

    // --------------- Checks the Authorization Header exists and correctly formed ---------------

    const secret = event?.headers?.secret;

    if (secret !== "mysecret") {
      console.log("Invalid or missing auth header");
      (this as any).httpInterface.respond({
        status: 401,
      });
      return;
    }

    // ##################################################
    // ##################################################

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
