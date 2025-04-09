import { emailHandler } from "../../handlers/email.handler";
import { smsHandler } from "../../handlers/sms.handler";
import { whatsappHandler } from "../../handlers/whatsapp.handler";
import { ChannelAndSubscriptions, ChannelHandler, ChannelInterfaceResponse } from "../../interface/channels.interface";
import { MessageStateRequest, MessageStateResponse } from "../../interface/messageState.interface";
import { updateCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";
import { fetchResource } from "../../repository/allResources/resource.repository";
import { parsePlaceholder } from "../../utils/helpers.utils";
import { logger } from "../../utils/logger.utils";
import { PubsubMessageBody } from "../../interface/pubsub.interface";


const handlers: Record<string, ChannelHandler> = {
    sms: smsHandler,
    whatsapp: whatsappHandler,
    email: emailHandler
};


export const addNewMessageStateEntry = async (
    message: PubsubMessageBody,
    channelsAndSubscriptions: ChannelAndSubscriptions
) => {
    const channelsToSend = Object.keys(channelsAndSubscriptions.value.references.obj.value);
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
    await processDeliveringMessage(newMessageStateResponse, channelsAndSubscriptions, message);
};

export const processDeliveringMessage = async (
    currentMessageState: MessageStateResponse,
    channelsAndSubscriptions: ChannelAndSubscriptions,
    message: PubsubMessageBody
): Promise<boolean> => {
    const channels: ChannelInterfaceResponse = channelsAndSubscriptions.value.references.obj
    const enabledChannels = Object.entries(channels.value)
        .filter(([_, config]) => config.configurations.isEnabled)
        .map(([channelName]) => channelName);


    const channelsToSend = enabledChannels.filter((channel) => {
        const status = currentMessageState.value.channelsProcessed[channel]?.isSent;
        const channelSubscriptions = channelsAndSubscriptions.value.channels[channel]?.subscriptions || [];
        const hasTriggerType = channelSubscriptions.some(subscription =>
            subscription.triggers.some(trigger => trigger.triggerType === message.type)
        );

        return status !== true && hasTriggerType;
    });
    logger.info("channelsToSend", channelsToSend)
    const currentResource = await fetchResource(message.resource.typeId, message.resource.id);
    const allSuccessful = await deliverMessages(
        currentMessageState,
        channelsToSend,
        channels,
        currentResource,
        message
    );

    await updateCustomObjectRepository({
        container: "notify-messageState",
        key: message.id,
        version: currentMessageState.version,
        value: currentMessageState.value,
    });

    return allSuccessful;
};

const deliverMessages = async (
    currentMessageState: MessageStateResponse,
    channelsToSend: string[],
    channels: ChannelInterfaceResponse,
    currentResource: object,
    message: PubsubMessageBody
): Promise<boolean> => {
    const sendResults = await Promise.allSettled(channelsToSend.map(async (channel) => {
        const handler = handlers[channel];
        const recipientPath = channels.value[channel]?.configurations.messageBody?.[message.type].sendToPath;
        const messageBodyPath = channels.value[channel]?.configurations.messageBody?.[message.type].message;
        const generatedMessageBody = parsePlaceholder(currentResource, messageBodyPath);
        const recipient = parsePlaceholder(currentResource, `{{${recipientPath}}}`);
        if (handler && generatedMessageBody && recipient) {
            try {
                await handler.sendMessage(generatedMessageBody, recipient);
                currentMessageState.value.channelsProcessed[channel].isSent = true;
                return true;
            } catch (error: any) {
                logger.info(`Error sending to ${channel}:`, error);
                currentMessageState.value.channelsProcessed[channel].isSent = false;
                return false;
            }
        }
        currentMessageState.value.channelsProcessed[channel].isSent = false;
        return false;
    }));

    return sendResults.every(result =>
        result.status === 'fulfilled' && result.value === true
    );
};