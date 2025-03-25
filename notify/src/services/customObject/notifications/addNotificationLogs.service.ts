import CustomError from "../../../errors/custom.error"
import { NotificationLog } from "../../../interface/notificationsCustomObject.interface"
import { createCustomObject } from "../../../repository/customObjects/notifications/createCustomObject.repository"
import { generateRandomKey } from "../../../utils/helpers.utils"
import { logger } from "../../../utils/logger.utils"
import { getRecipientFromOrder } from "../../orders/orders.service"

/**
 * Adds a notification log entry to the custom objects storage
 * 
 * @param channel - The notification channel used (default: 'whatsapp')
 * @param success - Whether the notification was successful (default: true) 
 * @param resourceType - The type of resource being notified about (default: 'Order')
 * @param container - The custom objects container name (default: 'notifications')
 * @param unknownError - Flag indicating if error is unknown (default: false)
 * @param pubSubDecodedMessage - The decoded message from PubSub
 * @param error - Optional error object if notification failed
 * @returns Promise<void>
 * 
 * Creates a notification log entry with:
 * - Channel used (whatsapp, email etc)
 * - Status (sent/failed)
 * - Log message and status code
 * - Resource type
 * - Recipient details (fetched from order for whatsapp)
 * 
 * The log is stored in custom objects with a random key
 */



export const addNotificationLog = async (
    channel: string,
    success: boolean,
    pubSubDecodedMessage: Record<string, any>,
    error?: any
): Promise<void> => {
    try {
        const errorMessage = success
            ? `Notified! with log ${error}`
            : error || error?.toString() || 'Unknown error';

        const statusCode = error instanceof CustomError
            ? error.statusCode
            : success ? 200 : 500;

        const log: NotificationLog = {
            channel: channel,
            status: success ? 'sent' : 'failed',
            logs: {
                message: errorMessage,
                statusCode: statusCode,
            },
            resourceType: pubSubDecodedMessage.resource.typeId,
            recipient: channel === 'whatsapp'
                ? await getRecipientFromOrder(pubSubDecodedMessage, 'whatsapp')
                : 'Unknown recipient'
        };
        const key = pubSubDecodedMessage.id || generateRandomKey();
        await createCustomObject('notifications', key, log);
    } catch (error) {
        logger.error(`Error while adding notification log: ${error instanceof Error ? error.message : String(error)}`);
    }
}

