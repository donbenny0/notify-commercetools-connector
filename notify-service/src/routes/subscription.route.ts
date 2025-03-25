import { Router } from 'express';
import { createSubscriptionController, removeSubscriptionController } from '../controllers/subscription/subscription.controller';
import { logger } from '../utils/logger.utils';

// Create a single router instance to handle both routes
const subscriptionRouter: Router = Router();

// create subscription
subscriptionRouter.post('/create', async (req, res) => {
    logger.info('Subscription creation initiated');
    await createSubscriptionController(req, res);
});

// remove subscription 
subscriptionRouter.post('/remove', async (req, res) => {
    logger.info('Subscription removal initiated');
    await removeSubscriptionController(req, res);
});

export default subscriptionRouter;
