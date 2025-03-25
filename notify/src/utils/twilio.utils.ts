import twilio, { Twilio } from 'twilio';
import { logger } from './logger.utils';
import { PhoneNumberValidationError, MessageSendError } from '../errors/twilio.error';
import { generateMessage } from './helpers.utils';

// Twilio configuration
const accountSid: string | undefined = process.env.TWILIO_ACCOUNT_SID;
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber: string | undefined = process.env.TWILIO_FROM_NUMBER;


// Create Twilio client
const client: Twilio = twilio(accountSid, authToken);

// Send WhatsApp notification
const sendMessage = async (resource: object, recipient: string) => {
    if (!recipient || !(await validatePhoneNumber(recipient))) {
        throw new PhoneNumberValidationError(recipient || 'undefined');
    }

    try {
        // Message body
        const messageBody = await generateMessage(resource);

        // Send the message
        const response = await client.messages.create({
            body: messageBody,
            from: `whatsapp:${fromPhoneNumber}`,
            to: `whatsapp:${recipient}`,
        });

        logger.info('WhatsApp message sent successfully. The message has been delivered to the customer.');
        return response;
    } catch (error) {
        logger.error(`Error sending WhatsApp message: ${error}`);
        throw new MessageSendError(recipient, error);
    }
}

// Validate phone number
const validatePhoneNumber = async (phoneNumber: string): Promise<boolean> => {
    try {
        const validationResponse = await client.lookups.v2.phoneNumbers(phoneNumber).fetch();
        return validationResponse.valid;
    } catch (error) {
        logger.error(`Error validating phone number: ${error}`);
        throw new PhoneNumberValidationError(phoneNumber);
    }
};

export default sendMessage;
