
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
    // Fetch the current custom object with error handling
    const currentCustomObject = await getCustomObjectRepository("notify-subscriptions", "notify-subscriptions-key");

    // Create a deep copy to avoid direct mutation
    const updatedValue = JSON.parse(JSON.stringify(currentCustomObject.value));

    // Get current channel subscriptions
    const currentChannel = updatedValue.channels[channel];

    if (!currentChannel) {
        throw new GlobalError(404, `Channel ${channel} not found`);
    }

    // Preserve existing subscriptions for other resource types
    const existingSubscriptions = currentChannel.subscriptions || [];

    // Prepare batch operations for Commerce Tools subscriptions
    const subscriptionOperations = [];

    // Process new subscriptions with preservation of existing ones
    const mergedSubscriptions = existingSubscriptions.map((existingSub: { resourceType: string; triggers: { triggerType: string; subscribedAt: string; }[]; }) => {
        // Find corresponding new subscription for the same resource type
        const newSubscription = updateBody.subscriptions.find(
            newSub => newSub.resourceType === existingSub.resourceType
        );

        if (newSubscription) {
            // Merge triggers, avoiding duplicates
            const mergedTriggers = [
                ...existingSub.triggers,
                ...newSubscription.triggers.filter(newTrigger =>
                    !existingSub.triggers.some(
                        (existingTrigger: { triggerType: string; subscribedAt: string; }) =>
                            existingTrigger.triggerType === newTrigger.triggerType &&
                            existingTrigger.subscribedAt === newTrigger.subscribedAt
                    )
                )
            ];

            return {
                ...existingSub,
                triggers: mergedTriggers
            };
        }

        return existingSub;
    });

    // Add completely new subscriptions
    const newResourceTypes = updateBody.subscriptions
        .filter(newSub =>
            !mergedSubscriptions.some(
                (existingSub: { resourceType: string; }) => existingSub.resourceType === newSub.resourceType
            )
        );

    mergedSubscriptions.push(...newResourceTypes);

    // Prepare Commerce Tools subscription operations
    for (const subscription of updateBody.subscriptions) {
        const subscriptionKey = `notify-${subscription.resourceType}-subscription`;

        // Find the corresponding merged subscription to get all triggers
        const mergedSubscription = mergedSubscriptions.find(
            (sub: { resourceType: string; }) => sub.resourceType === subscription.resourceType
        );

        if (!mergedSubscription) {
            throw new GlobalError(500, `Failed to find merged subscription for ${subscription.resourceType}`);
        }

        // Extract unique trigger types from all triggers
        const triggers: string[] = Array.from(new Set(
            mergedSubscription.triggers.map((trigger: { triggerType: string; }) => trigger.triggerType)
        ));

        if (!subscription.resourceType) {
            throw new GlobalError(400, `ResourceType is required for subscription`);
        }

        subscriptionOperations.push(
            commerceToolsSubscriptionExistsRepository(subscriptionKey)
                .then(exists => {
                    logger.info(`Subscription ${subscriptionKey} exists: ${exists}`);
                    if (exists) {
                        logger.info(`Updating subscription ${subscriptionKey}`);
                        return updateCommerceToolsSubscriptionRepository(
                            subscriptionKey,
                            subscription.resourceType,
                            triggers
                        );
                    } else {
                        logger.info(`Creating subscription ${subscriptionKey}`);
                        return createCommerceToolsSubscriptionRepository(
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
    currentChannel.subscriptions = mergedSubscriptions;

    const subscriptionObject: CreateCustomObjectInterface = {
        container: "notify-subscriptions",
        key: "notify-subscriptions-key",
        version: currentCustomObject.version,
        value: updatedValue
    };

    // Update custom object
    return await updateCustomObjectRepository(subscriptionObject);
};