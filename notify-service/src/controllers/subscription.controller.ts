import { Request, Response } from 'express';
import { AddSubscriptionDto } from "../dto/request/subscription.dto";
import { addSubscriptionService } from "../service/subscription/addSubscription.service";
import { logger } from "../utils/logger.utils";


export const addSubscriptionController = async (req: Request, res: Response) => {
    try {
        const requestBody: AddSubscriptionDto = req.body;
        const response = await addSubscriptionService(requestBody.channel, requestBody.updateBody);
        res.status(200).send(response);
    } catch (error: any) {
        logger.error('Error creating subscription');
        res.status(error.body?.statusCode || 500).send(error.body || { message: error });
    }
};
// export const removeSubscriptionController = async (req: Request, res: Response) => {
//     try {
//         const { subscriptionKey }: RemoveSubscriptionInterface = req.body;
//         await removeSubscriptionService(subscriptionKey);
//         res.status(200).send('Subscription removed successfully');
//     } catch (error: any) {
//         logger.error('Error removing subscription');
//         const globalError = GlobalError.fromCatch(error);
//         res.status(globalError.getStatusCode()).send(globalError.getResponseBody());
//     }
// };