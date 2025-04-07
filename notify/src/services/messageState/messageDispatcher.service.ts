import { smsHandler } from "../../handlers/sms.handler";
import { whatsappHandler } from "../../handlers/whatsapp.handler";
import { ChannelHandler, ChannelInterfaceResponse } from "../../interface/channels.interface";
import { MessageStateRequest, MessageStateResponse } from "../../interface/messageState.interface";
import { PubsubMessageBody } from "../../interface/pubsubMessageBody.interface";
import { checkIfCustomObjectExists, getCustomObjectRepository, updateCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";
import { getOrder } from "../../repository/orders/getOrder.repository";
import { fetchResource } from "../../repository/orders/resource.repository";
import { fetchValueFromPlaceholder, generateMessage } from "../../utils/helpers.utils";
import { logger } from "../../utils/logger.utils";

const handlers: Record<string, ChannelHandler> = {
    sms: smsHandler,
    whatsapp: whatsappHandler,
};

export const handleMessageState = async (message: PubsubMessageBody) => {
    const messageExists = await checkIfCustomObjectExists("notify-messageState", message.id);

    const channels = await getCustomObjectRepository("notify-channels", "notify-channels-key");

    if (messageExists) {
        const currentMessageState: MessageStateResponse = await getCustomObjectRepository("notify-messageState", message.id);
        await processDeliveringMessage(currentMessageState, channels, message);
    } else {
        await addNewMessageStateEntry(message, channels);
    }
};


const addNewMessageStateEntry = async (
    message: PubsubMessageBody,
    channels: ChannelInterfaceResponse
) => {
    const channelsToSend = Object.keys(channels.value);
    const channelsProcessed = channelsToSend.reduce((acc, channelName) => {
        acc[channelName] = { isSent: "processing" };
        return acc;
    }, {} as Record<string, { isSent: "processing" | boolean }>);

    const newMessageState: MessageStateRequest = {
        container: "notify-messageState",
        version: 0,
        key: message.id,
        value: {
            channelsProcessed,
            message,
        },
    };

    const newMessageStateResponse = await updateCustomObjectRepository(newMessageState);
    await processDeliveringMessage(newMessageStateResponse, channels, message);
};

const processDeliveringMessage = async (
    currentMessageState: MessageStateResponse,
    channels: ChannelInterfaceResponse,
    message: PubsubMessageBody
) => {
    const enabledChannels = Object.entries(channels.value)
        .filter(([_, config]) => config.configurations.isEnabled)
        .map(([channelName]) => channelName);


    const channelsToSend = enabledChannels.filter((channel) => {
        const status = currentMessageState.value.channelsProcessed[channel]?.isSent;
        return status !== true; // skip already sent
    });

    const sendPromises = channelsToSend.map(async (channel) => {
        const handler = handlers[channel];
        const recipientPath = channels.value[channel]?.configurations.messageBody?.[message.type].sendToPath;
        // const currentResource = fetchResource(message.resource.typeId, message.resource.id)
        const currentResource = getOrder(message.resource.id)

        const generatedMessageBody = generateMessage(currentResource)
        const recipient = fetchValueFromPlaceholder(currentResource, recipientPath)

        if (handler && generatedMessageBody && recipient) {
            try {
                await handler.sendMessage(generatedMessageBody, recipient);

                // Mark as sent after successful delivery
                currentMessageState.value.channelsProcessed[channel].isSent = true;
            } catch (error) {
                logger.info(`Error sending to ${channel}:`);
                currentMessageState.value.channelsProcessed[channel].isSent = false;
            }
        }
    });

    // Wait for all to finish (concurrently) within pub/sub timeout (10s)
    await Promise.allSettled(sendPromises);

    // Final update to state
    await updateCustomObjectRepository({
        container: "notify-messageState",
        key: message.id,
        version: currentMessageState.version,
        value: currentMessageState.value,
    });
};