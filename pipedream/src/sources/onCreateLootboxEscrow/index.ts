/**
 * DO NOT COMPILE IN TYPESCRIPT
 * This file will have errors since `import http from "../../http.app.mjs";` will not work
 * It depends on Pipedream env dependencies. The only reason why this file is here is for git source control records
 * View this Pipedream Source in GUI: https://pipedream.com/sources/dc_76u2zgb/configuration
 */
import manifest from "../../manifest/manifest";

const source = {
  key: manifest.pipedream.sources.onCreateLootboxEscrow.slug,
  name: manifest.pipedream.sources.onCreateLootboxEscrow.alias,
  description:
    "Webhook entry point for handling a LootboxCreated event. OZ sends to Pipedream here.",
  // version: manifest.pipedream.sources.onCreateLootbox.semver,
  version: "0.3.0",
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
    var jwt = require("jsonwebtoken");
    const {
      SecretManagerServiceClient,
    } = require("@google-cloud/secret-manager");

    // ########################################################
    //
    //                    AUTHENTICATION
    //
    // ########################################################

    const jwtSecretConfig = manifest.secretManager.secrets.find(
      (secret) => secret.name === "JWT_ON_CREATE_LOOTBOX"
    );

    if (!jwtSecretConfig) {
      throw new Error("JWT Secret config not set up in manifest");
    }

    // --------------- Checks the Authorization Header exists and correctly formed ---------------

    const authHeader = event?.headers?.authorization?.startsWith("Bearer ");

    if (!authHeader) {
      console.log("Invalid or missing auth header");
      (this as any).httpInterface.respond({
        status: 401,
      });
      return;
    }

    const jwtToken = event.headers.authorization.substring(
      7,
      event.headers.authorization.length
    );

    // --------------- Load the JWT Signing Secret from GSM ---------------

    const serviceAccountKey = JSON.parse(
      (this as any).googleCloud.$auth.key_json
    );

    const gsmClient = new SecretManagerServiceClient({
      projectId: serviceAccountKey.project_id,
      credentials: {
        client_email: serviceAccountKey.client_email,
        private_key: serviceAccountKey.private_key,
      },
    });

    let secret = undefined;

    try {
      const [jwtSecretResponse] = await gsmClient.accessSecretVersion({
        // name: `projects/lootbox-fund-staging/secrets/${jwtSecretConfig.name}/versions/${jwtSecretConfig.version}`,
        name: `projects/${manifest.googleCloud.projectID}/secrets/${jwtSecretConfig.name}/versions/${jwtSecretConfig.version}`,
      });

      secret = jwtSecretResponse?.payload?.data?.toString();

      if (!secret) {
        throw new Error("JWT Secret Not Found");
      }
    } catch (err) {
      console.log("Error fetching jwt secret", err);
      (this as any).httpInterface.respond({
        status: 500,
      });
      return;
    }

    // --------------- Verify JWT Token ---------------

    try {
      jwt.verify(jwtToken, secret, {
        maxAge: "30s", // only accepts tokens up to 30 seconds old
      });
      console.log("valid jwt");
    } catch (err) {
      console.log("invalid jwt", err);
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
