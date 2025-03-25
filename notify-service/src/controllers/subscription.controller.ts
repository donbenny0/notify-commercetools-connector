

export const createSubscriptionController = async (req: Request, res: Response) => {
    try {
        const { resourceName, triggerTypes, channel }: CreateSubscriptionInterface = req.body;
        await createSubscriptionService(resourceName, triggerTypes, channel);
        res.status(200).send('Subscription created successfully');
    } catch (error: any) {
        logger.error('Error creating subscription');
        res.status(error.body?.statusCode || 500).send(error.body || { message: 'An error occurred' });
    }
};
export const removeSubscriptionController = async (req: Request, res: Response) => {
    try {
        const { subscriptionKey }: RemoveSubscriptionInterface = req.body;
        await removeSubscriptionService(subscriptionKey);
        res.status(200).send('Subscription removed successfully');
    } catch (error: any) {
        logger.error('Error removing subscription');
        const globalError = GlobalError.fromCatch(error);
        res.status(globalError.getStatusCode()).send(globalError.getResponseBody());
    }
};