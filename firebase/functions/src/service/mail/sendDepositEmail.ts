import sgClient from "./client";
import { MailDataRequired } from "@sendgrid/mail";
import { manifest, SecretName } from "../../manifest";
import { DepositEmailParams } from "@wormgraph/helpers";

const DEPOSIT_EMAIL_TEMPLATE_ID = manifest.sendgrid.emailTemplates.lootboxDeposit.id; // ID for the dynamic template email designed in the sendgrid UI
// const UNSUBSCRIBE_GROUP_ID = NaN; // ID for the unsubscribe group initialized in the sendgrid UI
const FROM_EMAIL = "alerts@lootbox.fyi";
const FROM_NAME = "Lootbox Alerts";

interface SendDepositEmailRequest {
    toEmail: string;
    lootboxImg: string;
    lootboxName: string;
    lootboxRedeemURL: string;
}
const SENDGRID_DEPOSIT_EMAIL_API_KEY: SecretName = "SENDGRID_DEPOSIT_EMAIL_API_KEY";

export const sendDepositEmail = async (request: SendDepositEmailRequest) => {
    if (!process.env[SENDGRID_DEPOSIT_EMAIL_API_KEY]) {
        throw new Error("EMAIL_API_KEY not found in environment");
    }
    const dynamicTemplateData: DepositEmailParams = {
        lootboxImg: request.lootboxImg,
        lootboxName: request.lootboxName,
        lootboxRedeemURL: request.lootboxRedeemURL,
    };

    const emailRequest: MailDataRequired = {
        templateId: DEPOSIT_EMAIL_TEMPLATE_ID,
        to: request.toEmail,
        from: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        dynamicTemplateData,
        // asm: {
        //     groupId: UNSUBSCRIBE_GROUP_ID,
        // },
    };

    return sgClient.send(emailRequest);
};
