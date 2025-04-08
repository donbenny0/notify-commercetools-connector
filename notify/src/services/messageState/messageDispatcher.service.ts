import { emailHandler } from "../../handlers/email.handler";
import { smsHandler } from "../../handlers/sms.handler";
import { whatsappHandler } from "../../handlers/whatsapp.handler";
import { ChannelAndSubscriptions, ChannelHandler, ChannelInterfaceResponse } from "../../interface/channels.interface";
import { MessageStateRequest, MessageStateResponse } from "../../interface/messageState.interface";
import { PubsubMessageBody } from "../../interface/pubsubMessageBody.interface";
import { updateCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";
import { fetchResource } from "../../repository/orders/resource.repository";
import { fetchValueFromPlaceholder, generateMessage } from "../../utils/helpers.utils";
import { logger } from "../../utils/logger.utils";


const handlers: Record<string, ChannelHandler> = {
    sms: smsHandler,
    whatsapp: whatsappHandler,
    email: emailHandler
};

// export const handleMessageState = async (message: PubsubMessageBody) => {
//     const messageExists = await checkIfCustomObjectExists("notify-messageState", message.id);
//     const channels = await getCustomObjectRepository("notify-channels", "notify-channels-key");

//     if (messageExists) {
//         const currentMessageState: MessageStateResponse = await getCustomObjectRepository("notify-messageState", message.id);
//         await processDeliveringMessage(currentMessageState, channels, message);
//     } else {
//         await addNewMessageStateEntry(message, channels);
//     }
// };

export const addNewMessageStateEntry = async (
    message: PubsubMessageBody,
    channelsAndSubscriptuons: ChannelAndSubscriptions
) => {
    const channelsToSend = Object.keys(channelsAndSubscriptuons.value.references.obj.value);
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
    await processDeliveringMessage(newMessageStateResponse, channelsAndSubscriptuons, message);
};

export const processDeliveringMessage = async (
    currentMessageState: MessageStateResponse,
    channelsAndSubscriptuons: ChannelAndSubscriptions,
    message: PubsubMessageBody
): Promise<boolean> => {
    const enabledChannels = Object.entries(channelsAndSubscriptuons.value.references.obj.value)
        .filter(([_, config]) => config.configurations.isEnabled)
        .map(([channelName]) => channelName);


    // const channelsToSend = enabledChannels.filter((channel) => {
    //     const status = currentMessageState.value.channelsProcessed[channel]?.isSent;
    //     const channelSubscriptions = channelsAndSubscriptuons.value;

    //     // Check if any subscription has a trigger matching the message type
    //     const hasTriggerType = channelSubscriptions.some(subscription =>
    //         subscription.triggers.some(trigger => trigger.triggerType === message.type)
    //     );

    //     return status !== true && hasTriggerType;
    // });

    const channelsToSend = enabledChannels.filter((channel) => {
        const status = currentMessageState.value.channelsProcessed[channel]?.isSent;
        return status !== true;
    });

    const currentResource = await fetchResource(message.resource.typeId, message.resource.id);

    // const allSuccessful = await deliverMessages(
    //     currentMessageState,
    //     channelsToSend,
    //     channels,
    //     currentResource,
    //     message
    // );

    // Final update to state
    await updateCustomObjectRepository({
        container: "notify-messageState",
        key: message.id,
        version: currentMessageState.version,
        value: currentMessageState.value,
    });

    return true;
};

// const deliverMessages = async (
//     currentMessageState: MessageStateResponse,
//     channelsToSend: string[],
//     channels: ChannelInterfaceResponse,
//     currentResource: object,
//     message: PubsubMessageBody
// ): Promise<boolean> => {
//     const sendResults = await Promise.allSettled(channelsToSend.map(async (channel) => {
//         const handler = handlers[channel];
//         const recipientPath = channels.value[channel]?.configurations.messageBody?.[message.type].sendToPath;
//         const generatedMessageBody = await generateMessage(currentResource);
//         const recipient = fetchValueFromPlaceholder(currentResource, recipientPath);

//         if (handler && generatedMessageBody && recipient) {
//             try {
//                 await handler.sendMessage(generatedMessageBody, recipient);
//                 currentMessageState.value.channelsProcessed[channel].isSent = true;
//                 return true;
//             } catch (error: any) {
//                 logger.info(`Error sending to ${channel}:`, error);
//                 currentMessageState.value.channelsProcessed[channel].isSent = false;
//                 return false;
//             }
//         }
//         currentMessageState.value.channelsProcessed[channel].isSent = false;
//         return false;
//     }));

//     // Check if all messages were sent successfully
//     return sendResults.every(result =>
//         result.status === 'fulfilled' && result.value === true
//     );
// };