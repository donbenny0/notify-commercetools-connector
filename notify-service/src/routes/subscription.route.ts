import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { addSubscriptionController } from '../controllers/subscription.controller';

const subscriptionRouter: Router = Router();

// create subscription
subscriptionRouter.post('/add', async (req, res) => {
    logger.info('Subscription creation initiated');
    await addSubscriptionController(req, res);
});


export default subscriptionRouter;
