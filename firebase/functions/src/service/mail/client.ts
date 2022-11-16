import * as sgMail from "@sendgrid/mail";

/**
 * Note: process.env.SENDGRID_API_KEY should come from cloud function
 * i.e.
 *      export const emailUserBatch = functions
 *      .runWith({
 *          secrets: [SENDGRID_API_SECRET],
 *      })
 */
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export default sgMail;
