import GlobalError from '../errors/global.error';
import { ChannelHandler } from '../interface/channels.interface';
import { logger } from '../utils/logger.utils';
import sgMail from '@sendgrid/mail'

const SG_API_KEY = process.env.SENDGRID_API_KEY || 'INVALID_API_KEY'
const SENDER_EMAIL_ID = process.env.SENDGRID_SENDER_EMAIL_ID || 'INVALID_EMAIL_ID'
sgMail.setApiKey(SG_API_KEY)

export const emailHandler: ChannelHandler = {
    async sendMessage(message, recipient) {
        try {

            logger.info(`Sending email message to ${recipient}`);
            logger.info(message);
            const msg = {
                to: 'donbennyy@gmail.com',
                from: SENDER_EMAIL_ID,
                subject: 'Sending with Twilio SendGrid is Fun',
                text: message,
                html: message,
            };
            const response = await sgMail.send(msg);
            console.log('message for email', response)
            return response;
        } catch (error) {
            logger.error(`Error sending email message: ${error}`);
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
                    message: 'Failed to send Email',
                    details: String(error)
                });
            }
        }
    },
};