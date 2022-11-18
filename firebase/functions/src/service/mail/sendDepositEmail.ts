import sgClient from "./client";
import { MailDataRequired } from "@sendgrid/mail";
import { manifest } from "../../manifest";
import { DepositEmailParams } from "@wormgraph/helpers";

const DEPOSIT_EMAIL_TEMPLATE_ID = manifest.sendgrid.emailTemplates.lootboxDeposit.id; // ID for the dynamic template email designed in the sendgrid UI
// const UNSUBSCRIBE_GROUP_ID = NaN; // ID for the unsubscribe group initialized in the sendgrid UI
const FROM_EMAIL = "alerts@lootbox.fyi";
const FROM_NAME = "Lootbox";

interface SendEmailRequest {
    toEmail: string;
}

export const sendDepositEmail = async (request: SendEmailRequest) => {
    const dynamicTemplateData: DepositEmailParams = {
        lootboxImg: "",
        lootboxName: "",
        lootboxRedeemURL: "",
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
