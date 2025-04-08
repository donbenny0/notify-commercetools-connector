import { ProcessLogInterface, LogValueInterface } from "../../../interface/log.interface";
import { PubsubMessageBody } from "../../../interface/pubsubMessageBody.interface";
import { getCustomObjectRepository, updateCustomObjectRepository } from "../../../repository/customObjects/customObjects.repository";
import { jsonToBase64 } from "../../../utils/helpers.utils";
import { logger } from "../../../utils/logger.utils";

export const getMessageLogs = async (messageId: string) => {
    try {
        const existingLogs = await getCustomObjectRepository("notify-messagelogs", messageId);
        return existingLogs;
    } catch (error) {
        // If logs don't exist yet, return null
        return null;
    }
};

export const updateMessageLogs = async (
    messageId: string,
    channel: string,
    recipient: string,
    isSent: boolean,
    processLog: ProcessLogInterface,
    message: PubsubMessageBody
) => {
    try {
        const now = new Date().toISOString();
        const existingLogs = await getMessageLogs(messageId);

        const baseLogValue: LogValueInterface = {
            message: jsonToBase64(message),
            channels: {
                [channel]: {
                    isSent,
                    lastProcessedDate: now,
                    recipient,
                    processLogs: [processLog]
                }
            }
        };

        if (existingLogs) {
            // If logs exist, update the existing entry
            if (existingLogs.value.channels[channel]) {
                // Channel exists, append to processLogs
                existingLogs.value.channels[channel].processLogs.push(processLog);
                existingLogs.value.channels[channel].lastProcessedDate = now;
                existingLogs.value.channels[channel].isSent = isSent;
            } else {
                // Channel doesn't exist, add new channel entry
                existingLogs.value.channels[channel] = {
                    isSent,
                    lastProcessedDate: now,
                    recipient,
                    processLogs: [processLog]
                };
            }

            await updateCustomObjectRepository({
                container: "notify-messagelogs",
                key: messageId,
                version: existingLogs.version,
                value: existingLogs.value
            });
        } else {
            // Create new log entry
            await updateCustomObjectRepository({
                container: "notify-messagelogs",
                key: messageId,
                version: 0,
                value: baseLogValue
            });
        }
    } catch (error) {
        logger.error("Error updating message logs:", error);
    }
};