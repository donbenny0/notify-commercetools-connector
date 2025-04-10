import twilio, { Twilio } from 'twilio';
import { ChannelHandler } from "../interface/channels.interface";
import { logger } from "../utils/logger.utils";
import GlobalError from '../errors/global.error';

const client: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const smsHandler: ChannelHandler = {
    async sendMessage(message, recipient) {
        try {
            logger.info(`Sending SMS message to ${recipient}`);
            logger.info(message);
            // // Send the message
            const response = await client.messages.create({
                body: message,
                from: '+18656066758',
                to: '+917306227380'
            });
            return response;
        } catch (error: any) {
            logger.error(`Error sending SMS message: ${error}`);
            throw new GlobalError(error.statusCode || 500, error.message || `Failed to send message`);

        }
    },
};
