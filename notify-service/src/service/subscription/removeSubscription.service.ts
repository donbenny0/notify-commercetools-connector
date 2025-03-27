/* eslint-disable no-useless-catch */

import { RemoveSubscriptionDto } from "../../dto/request/subscription.dto";
import GlobalError from "../../errors/global.error";
import {
    getCustomObjectRepository,
    updateCustomObjectRepository
} from "../../repository/customObjects/customObjects.repository";
import {
    deleteCommerceToolsSubscriptionRepository,
    updateCommerceToolsSubscriptionRepository
} from "../../repository/subscription/subscription.repository";
import { logger } from "../../utils/logger.utils";

export const removeSubscriptionService = async (removeSubscriptionDto: RemoveSubscriptionDto) => {
    try {
        const { channel, subscription } = removeSubscriptionDto;
        const subscriptionKey = `notify-${subscription.resourceType}-subscription`;

        // Fetch custom object and prepare Commerce Tools operations in parallel
        const [currentCustomObject] = await Promise.all([
            getCustomObjectRepository("notify-subscriptions", "notify-subscriptions-key")
        ]);

        const updatedValue = structuredClone(currentCustomObject.value); // Faster than JSON.parse/stringify
        const currentChannel = updatedValue.channels[channel];

        if (!currentChannel) {
            throw new GlobalError(404, `Channel ${channel} not found`);
        }

        // Use direct array access with find instead of findIndex when possible
        const subscriptionIndex = currentChannel.subscriptions.findIndex((sub: any) =>
            (sub.resourceType === subscription.resourceType ||
             sub.resourseType === subscription.resourceType)
        );

        if (subscriptionIndex === -1) {
            throw new GlobalError(404, `Subscription for resource type ${subscription.resourceType} not found`);
        }

        const currentSubscription = currentChannel.subscriptions[subscriptionIndex];
        const updatedTriggers = currentSubscription.triggers.filter(
            (trigger: { triggerType: string }) => trigger.triggerType !== subscription.triggerType
        );

        // Handle Commerce Tools operations and custom object update in parallel
        if (updatedTriggers.length === 0) {
            currentChannel.subscriptions.splice(subscriptionIndex, 1);
            
            // Execute delete operation and custom object update in parallel
            await Promise.all([
                deleteCommerceToolsSubscriptionRepository(subscriptionKey)
                    .then(() => logger.info(`Deleted Commerce Tools subscription ${subscriptionKey}`))
                    .catch(error => logger.error(`Failed to delete Commerce Tools subscription ${subscriptionKey}`, error)),
                updateCustomObjectRepository({
                    container: "notify-subscriptions",
                    key: "notify-subscriptions-key",
                    version: currentCustomObject.version,
                    value: updatedValue
                })
            ]);
        } else {
            currentChannel.subscriptions[subscriptionIndex].triggers = updatedTriggers;
            const remainingTriggerTypes = updatedTriggers.map(
                (trigger: { triggerType: string }) => trigger.triggerType
            );

            // Execute update operation and custom object update in parallel
            await Promise.all([
                updateCommerceToolsSubscriptionRepository(
                    subscriptionKey,
                    subscription.resourceType,
                    remainingTriggerTypes
                )
                    .then(() => logger.info(`Updated Commerce Tools subscription ${subscriptionKey}`))
                    .catch(error => logger.error(`Failed to update Commerce Tools subscription ${subscriptionKey}`, error)),
                updateCustomObjectRepository({
                    container: "notify-subscriptions",
                    key: "notify-subscriptions-key",
                    version: currentCustomObject.version,
                    value: updatedValue
                })
            ]);
        }

        return updatedValue;
    } catch (error) {
        throw error;
    }
};
