import CustomError from "../../errors/custom.error";
import { removeSubscriptionRepository } from "../../repository/subscription/subscription.repository";

export const removeSubscriptionService = async (subscriptionKey: string) => {
    if (!subscriptionKey) {
        throw new CustomError(400, 'Subscription key is required');
    }
    await removeSubscriptionRepository(subscriptionKey);
};