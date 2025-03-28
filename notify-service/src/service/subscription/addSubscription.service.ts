/* eslint-disable no-useless-catch */

import GlobalError from "../../errors/global.error";
import { CreateCustomObjectInterface } from "../../interfaces/customObject.interface";
import { ChannelSubscriptions } from "../../interfaces/subscription.interface";
import { getCustomObjectRepository, updateCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";
import {
    commerceToolsSubscriptionExistsRepository,
    createCommerceToolsSubscriptionRepository,
    updateCommerceToolsSubscriptionRepository
} from "../../repository/subscription/subscription.repository";
import { logger } from "../../utils/logger.utils";

export const addSubscriptionService = async (channel: string, updateBody: ChannelSubscriptions) => {
    try {
        // Fetch the current custom object with error handling
        const currentCustomObject = await getCustomObjectRepository("notify-subscriptions", "notify-subscriptions-key");

        // Create a deep copy to avoid direct mutation
        const updatedValue = JSON.parse(JSON.stringify(currentCustomObject.value));

        // Get current channel subscriptions
        const currentChannel = updatedValue.channels[channel];

        if (!currentChannel) {
            throw new GlobalError(404, `Channel ${channel} not found`);
        }

        // Normalize currentChannel subscriptions, ensuring no duplicate resourceTypes
        const normalizedCurrentSubscriptions = currentChannel.subscriptions.reduce((acc: any[], curr: any) => {
            const existingIndex = acc.findIndex(sub =>
                sub.resourceType === curr.resourceType);

            if (existingIndex === -1) {
                acc.push(curr);
            }

            return acc;
        }, []);

        // Process new subscriptions with merging logic
        const mergedSubscriptions = normalizedCurrentSubscriptions.map((existingSub: any) => {
            // Find corresponding new subscription for the same resource type
            const newSubscription = updateBody.subscriptions.find(
                newSub =>
                    (newSub.resourceType === existingSub.resourceType) ||
                    (newSub.resourceType === existingSub.resourseType)
            );

            if (newSubscription) {
                // Merge triggers, avoiding duplicates
                const mergedTriggers = [
                    ...(existingSub.triggers || []),
                    ...newSubscription.triggers.filter(newTrigger =>
                        !(existingSub.triggers || []).some(
                            (existingTrigger: { triggerType: string; subscribedAt: string; }) =>
                                existingTrigger.triggerType === newTrigger.triggerType &&
                                existingTrigger.subscribedAt === newTrigger.subscribedAt
                        )
                    )
                ];

                return {
                    resourceType: newSubscription.resourceType,
                    triggers: mergedTriggers
                };
            }

            return existingSub;
        });

        // Add completely new subscriptions
        const newResourceTypes = updateBody.subscriptions
            .filter(newSub =>
                !mergedSubscriptions.some(
                    (existingSub: { resourceType: string; resourseType: string; }) =>
                        existingSub.resourceType === newSub.resourceType ||
                        existingSub.resourseType === newSub.resourceType
                )
            )
            .map(newSub => ({
                resourceType: newSub.resourceType,
                triggers: newSub.triggers
            }));

        // Combine merged and new subscriptions
        const finalSubscriptions = [...mergedSubscriptions, ...newResourceTypes];

        // Prepare Commerce Tools subscription operations
        const subscriptionOperations = [];

        for (const subscription of finalSubscriptions) {
            const subscriptionKey = `notify-${subscription.resourceType}-subscription`;

            // Extract unique trigger types from all triggers
            const triggers: string[] = Array.from(new Set(
                subscription.triggers.map((trigger: { triggerType: string; }) => trigger.triggerType)
            ));

            if (!subscription.resourceType) {
                throw new GlobalError(400, `ResourceType is required for subscription`);
            }

            subscriptionOperations.push(
                commerceToolsSubscriptionExistsRepository(subscriptionKey)
                    .then(async exists => {
                        logger.info(`Subscription ${subscriptionKey} exists: ${exists}`);
                        if (exists) {
                            logger.info(`Updating subscription ${subscriptionKey}`);
                            await updateCommerceToolsSubscriptionRepository(
                                subscriptionKey,
                                subscription.resourceType,
                                triggers
                            );
                        } else {
                            logger.info(`Creating subscription ${subscriptionKey}`);
                            await createCommerceToolsSubscriptionRepository(
                                subscriptionKey,
                                subscription.resourceType,
                                triggers
                            );
                        }
                    })
            );
        }

        // Perform subscription operations in parallel
        await Promise.all(subscriptionOperations);

        // Update channel subscriptions
        currentChannel.subscriptions = finalSubscriptions;

        const subscriptionObject: CreateCustomObjectInterface = {
            container: "notify-subscriptions",
            key: "notify-subscriptions-key",
            version: currentCustomObject.version,
            value: updatedValue
        };

        // Update custom object
        return await updateCustomObjectRepository(subscriptionObject);
    } catch (error) {
        throw error;
    }
};
