import { Request, Response } from 'express';
import { AddSubscriptionDto } from "../dto/request/subscription.dto";
import { addSubscriptionService } from "../service/subscription/addSubscription.service";
import GlobalError from '../errors/global.error';

export const addSubscriptionController = async (req: Request, res: Response) => {
    try {
        const requestBody: AddSubscriptionDto = req.body;
        const response = await addSubscriptionService(requestBody.channel, requestBody.updateBody);
        res.status(200).json(response);
    } catch (error: any) {
        // Convert any caught error to a GlobalError
        const globalError = GlobalError.fromCatch(error);

        // Send the error response with appropriate status code and body
        res.status(globalError.getStatusCode()).json(globalError.getResponseBody());
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