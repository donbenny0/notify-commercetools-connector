import { Router } from 'express';

import { logger } from '../utils/logger.utils';
import { post } from '../controllers/event.controller';

const eventRouter: Router = Router();

eventRouter.post('/', async (req, res, next) => {
  logger.info('Event message received');
  logger.info('✅✅-------Event body-------')
  logger.info(JSON.stringify(req.body));
  try {
    await post(req, res);
  } catch (error) {
    next(error);
  }
});

export default eventRouter;
