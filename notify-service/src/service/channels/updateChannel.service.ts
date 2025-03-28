/* eslint-disable no-useless-catch */
import GlobalError from "../../errors/global.error";
import { ChannelConfigurationRequest, MessageBody, MessagingChannel } from "../../interfaces/channel.interface";
import { CreateCustomObjectInterface } from "../../interfaces/customObject.interface";
import { getCustomObjectRepository, updateCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";

export const toggleChannelStatusService = async (channel: string, updateRequest: ChannelConfigurationRequest) => {
    try {
        // Fetch the existing object
        const response = await getCustomObjectRepository('notify-channels', 'notify-channels-key');
        if (!response) {
            throw new GlobalError(404, 'Notification channels not found');
        }

        // Check if the requested channel exists
        const channelData: MessagingChannel = response.value[channel];
        if (!channelData) {
            throw new GlobalError(404, `Channel '${channel}' not found`);
        }

        // Update the `isEnabled` field
        channelData.configurations.isEnabled = updateRequest.isEnabled;

        // Prepare the updated object with the correct version
        const updatedObject: CreateCustomObjectInterface = {
            container: response.container,
            key: response.key,
            version: response.version,
            value: response.value,
        };

        // Save the updated object
        const updatedResponse = await updateCustomObjectRepository(updatedObject);

        return { message: `Channel '${channel}' updated successfully`, updatedChannel: updatedResponse.value[channel] };
    } catch (error) {
        throw error;
    }
};


export const updateMessageBodyService = async (channel: string, updateRequest: MessageBody) => {
    try {
        // Fetch the existing object
        const response = await getCustomObjectRepository('notify-channels', 'notify-channels-key');
        if (!response) {
            throw new GlobalError(404, 'Notification channels not found');
        }

        // Check if the requested channel exists
        if (!response.value[channel]) {
            throw new GlobalError(404, `Channel '${channel}' not found`);
        }

        // Ensure `configurations` and `messageBody` exist
        if (!response.value[channel].configurations) {
            response.value[channel].configurations = {};
        }
        if (!response.value[channel].configurations.messageBody) {
            response.value[channel].configurations.messageBody = {};
        }
        // Validate if all keys exist before updating
        Object.keys(updateRequest).forEach((key) => {
            if (!(key in response.value[channel].configurations.messageBody)) {
                throw new GlobalError(404, `Key '${key}' not found in message body for channel '${channel}'`);
            }
        });

        // Update the message body field dynamically
        Object.keys(updateRequest).forEach((key) => {
            response.value[channel].configurations.messageBody[key] = updateRequest[key];
        });

        // Prepare the updated object with the correct version
        const updatedObject: CreateCustomObjectInterface = {
            container: response.container,
            key: response.key,
            version: response.version,
            value: response.value, // Preserve full object structure
        };

        // Save the updated object
        const updatedResponse = await updateCustomObjectRepository(updatedObject);

        return {
            message: `Message body for '${channel}' updated successfully`,
            updatedMessageBody: updatedResponse.value[channel].configurations.messageBody,
        };
    } catch (error) {
        throw error;
    }
};
