// import twilio, { Twilio } from 'twilio';
import { ChannelHandler } from '../interface/channels.interface';
// import { generateMessage } from '../utils/helpers.utils';
import { logger } from '../utils/logger.utils';

// const client: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const whatsappHandler: ChannelHandler = {
    async sendMessage(message, recipient) {
        try {
            // const messageBody = await generateMessage(message);
            logger.info(`Sending WhatsApp message to ${recipient}`);
            logger.info(message);
            // // Send the message
            // const response = await client.messages.create({
            //     body: messageBody,
            //     from: `whatsapp:${process.env.TWILIO_FROM_NUMBER}`,
            //     to: `whatsapp:${recipient}`,
            // });
        } catch (error) {
            logger.error(`Error sending WhatsApp message: ${error}`);
            throw new Error(`Error sending WhatsApp message: ${error}`);
        }
    },
};