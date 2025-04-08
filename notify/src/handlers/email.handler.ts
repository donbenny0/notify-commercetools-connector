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
                to: recipient || 'donbennyy@gmail.com',
                from: SENDER_EMAIL_ID,
                subject: 'Sending with Twilio SendGrid is Fun',
                text: message,
                html: message,
            };
            const response = await sgMail.send(msg);
            return response;
        } catch (error) {
            logger.error(`Error sending email message: ${error}`);
            throw new Error(`Error sending email message: ${error}`);
        }
    },
};