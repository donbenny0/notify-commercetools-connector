import twilio, { Twilio } from 'twilio';
import { ChannelHandler } from "../interface/channels.interface";
import { logger } from "../utils/logger.utils";
import GlobalError from '../errors/global.error';

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
                from: '+18656066758',
                to: '+917306227380'
            });
            console.log('message for sms', response)
            return response;
        } catch (error) {
            logger.error(`Error sending SMS message: ${error}`);
            if (error instanceof Error) {
                throw new GlobalError({
                    statusCode: 500,
                    message: error.message,
                    details: error.message,
                    originalError: error
                });
            } else {
                throw new GlobalError({
                    statusCode: 500,
                    message: 'Failed to send SMS',
                    details: String(error)
                });
            }
        }
    },
};
