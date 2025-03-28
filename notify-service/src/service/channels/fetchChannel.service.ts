import GlobalError from "../../errors/global.error";
import { getCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";

/* eslint-disable no-useless-catch */
export const fetchAllChannelsService = async () => {
    try {
        const response = await getCustomObjectRepository('notify-channels', 'notify-channels-key');
        if (!response) {
            throw new GlobalError(404, 'Channel not found');
        }
        return response;
    } catch (error) {
        throw error;
    }
}

export const fetchChannelService = async (channel: string) => {
    try {
        const response = await getCustomObjectRepository('notify-channels', 'notify-channels-key');
        if (!response) {
            throw new GlobalError(404, 'Channel not found');
        }
        const channelData = response.value[channel];
        if (!channelData) {
            throw new GlobalError(404, `Channel '${channel}' not found`);
        }
        return channelData;
    } catch (error) {
        throw error;
    }
};
