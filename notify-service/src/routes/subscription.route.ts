import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { addSubscriptionController, removeSubscriptionController } from '../controllers/subscription.controller';

const subscriptionRouter: Router = Router();

// create subscription
subscriptionRouter.post('/add', async (req, res, next) => {
    logger.info('Subscription creation initiated');
    try {
        await addSubscriptionController(req, res);
    } catch (error) {
        next(error);
    }
});


// remove subscription
subscriptionRouter.delete('/remove', async (req, res, next) => {
    logger.info('Subscription removal initiated');
    try {
        await removeSubscriptionController(req, res);
    } catch (error) {
        next(error);
    }
});


export default subscriptionRouter;
