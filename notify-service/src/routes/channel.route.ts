import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { getAllChannelController, getChannelController, toggleChannelController, updateMessageBodyController } from '../controllers/channel.controller';


const channelRouter: Router = Router();

// get all channel
channelRouter.get('/', async (req, res, next) => {
    logger.info('Channels fetch initiated');
    try {
        await getAllChannelController(req, res);
    } catch (error) {
        next(error);
    }
});

// get channel
channelRouter.get('/:channel', async (req, res, next) => {
    logger.info('Channel fetch initiated');
    try {
        await getChannelController(req, res);
    } catch (error) {
        next(error);
    }
});
// get channel
channelRouter.get('/:channel', async (req, res, next) => {
    logger.info('Channel fetch initiated');
    try {
        await getChannelController(req, res);
    } catch (error) {
        next(error);
    }
});

// update channel
channelRouter.patch('/:channel', async (req, res, next) => {
    logger.info('Channel toggle update initiated');
    try {
        await toggleChannelController(req, res);
    } catch (error) {
        next(error);
    }
});

// update channel message body
channelRouter.patch('/:channel/message-body', async (req, res, next) => {
    logger.info('Channel message-body update initiated');
    try {
        await updateMessageBodyController(req, res);
    } catch (error) {
        next(error);
    }
});

export default channelRouter;
