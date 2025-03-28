import { Request, Response } from 'express';
import GlobalError from '../errors/global.error';
import { fetchAllChannelsService, fetchChannelService } from '../service/channels/fetchChannel.service';
import { ChannelConfigurationRequest, MessageBody } from '../interfaces/channel.interface';
import { toggleChannelStatusService, updateMessageBodyService } from '../service/channels/updateChannel.service';

export const getAllChannelController = async (req: Request, res: Response) => {
    try {
        const channelResponse = await fetchAllChannelsService();
        res.status(200).json(channelResponse);
    } catch (error: any) {
        const globalError = GlobalError.fromCatch(error);
        res.status(globalError.getStatusCode()).json(globalError.getResponseBody());
    }
};

export const getChannelController = async (req: Request, res: Response) => {
    try {
        const channel = req.params.channel;
        const channelResponse = await fetchChannelService(channel);
        res.status(200).json(channelResponse);
    } catch (error: any) {
        const globalError = GlobalError.fromCatch(error);
        res.status(globalError.getStatusCode()).json(globalError.getResponseBody());
    }
};
export const toggleChannelController = async (req: Request, res: Response) => {
    try {
        const channel = req.params.channel;
        const updateRequest: ChannelConfigurationRequest = req.body;
        const channelResponse = await toggleChannelStatusService(channel, updateRequest);
        res.status(200).json(channelResponse);
    } catch (error: any) {
        const globalError = GlobalError.fromCatch(error);
        res.status(globalError.getStatusCode()).json(globalError.getResponseBody());
    }
};

export const updateMessageBodyController = async (req: Request, res: Response) => {
    try {
        const channel = req.params.channel;
        const updateRequest: MessageBody = req.body;
        const channelResponse = await updateMessageBodyService(channel, updateRequest);
        res.status(200).json(channelResponse);
    } catch (error: any) {
        const globalError = GlobalError.fromCatch(error);
        res.status(globalError.getStatusCode()).json(globalError.getResponseBody());
    }
};
