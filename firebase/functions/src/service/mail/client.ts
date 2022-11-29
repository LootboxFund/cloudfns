import sgMail from "@sendgrid/mail";
import { SecretName } from "@wormgraph/manifest";

/**
 * Note: process.env.SENDGRID_API_KEY should come from cloud function
 * i.e.
 *      export const emailUserBatch = functions
 *      .runWith({
 *          secrets: [SENDGRID_API_SECRET],
 *      })
 */
const SENDGRID_DEPOSIT_EMAIL_API_KEY: SecretName = "SENDGRID_DEPOSIT_EMAIL_API_KEY";

sgMail.setApiKey(process.env[SENDGRID_DEPOSIT_EMAIL_API_KEY] || "");

export default sgMail;
