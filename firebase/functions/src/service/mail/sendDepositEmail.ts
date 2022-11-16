import sgClient from "./client";
import { MailDataRequired } from "@sendgrid/mail";

const DEPOSIT_EMAIL_TEMPLATE_ID = ""; // ID for the dynamic template email designed in the sendgrid UI
const TRACKING_UNSUBSCRIBE_GROUP_ID = NaN; // ID for the unsubscribe group initialized in the sendgrid UI
const FROM_EMAIL = "alerts@lootbox.fyi";
const FROM_NAME = "Lootbox";

/**
 * Data for the template email from sendgrid's UI
 */
interface DepositEmailTemplateData {
    /** Business name the parcel was purchased from */
    businessName: string;
}

interface SendEmailRequest {
    toEmail: string;
}

export const sendDepositEmail = async (request: SendEmailRequest) => {
    const dynamicTemplateData: DepositEmailTemplateData = {
        businessName: "TODO!!!!!",
    };

    const emailRequest: MailDataRequired = {
        templateId: DEPOSIT_EMAIL_TEMPLATE_ID,
        to: request.toEmail,
        from: {
            email: FROM_EMAIL,
            name: FROM_NAME,
        },
        dynamicTemplateData,
        asm: {
            groupId: TRACKING_UNSUBSCRIBE_GROUP_ID,
        },
    };

    return sgClient.send(emailRequest);
};
