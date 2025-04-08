import twilio, { Twilio } from 'twilio';
import { ChannelHandler } from "../interface/channels.interface";
import { logger } from "../utils/logger.utils";

const client: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const smsHandler: ChannelHandler = {
    async sendMessage(message, recipient) {
        try {
            // const messageBody = await generateMessage(message);
            logger.info(`Sending SMS message to ${recipient}`);
            logger.info(message);
            // // Send the message
            const response = await client.messages.create({
                body: message,
                from: `${process.env.TWILIO_FROM_SMS_NUMBER}`,
                to: recipient || '+917306227380'
            });
            return response;
        } catch (error) {
            logger.error(`Error sending SMS message: ${error}`);
            throw new Error(`Error sending SMS message: ${error}`);
        }
    },
};
