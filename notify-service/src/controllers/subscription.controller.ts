import { Request, Response } from 'express';
import { AddSubscriptionDto, RemoveSubscriptionDto } from "../dto/request/subscription.dto";
import { addSubscriptionService } from "../service/subscription/addSubscription.service";
import GlobalError from '../errors/global.error';
import { removeSubscriptionService } from '../service/subscription/removeSubscription.service';

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

export const removeSubscriptionController = async (req: Request, res: Response) => {
    try {
        const requestBody: RemoveSubscriptionDto = req.body;


        const response = await removeSubscriptionService(requestBody);
        res.status(200).json(response);
    } catch (error: any) {
        // Convert any caught error to a GlobalError
        const globalError = GlobalError.fromCatch(error);

        // Send the error response with appropriate status code and body
        res.status(globalError.getStatusCode()).json(globalError.getResponseBody());
    }
};