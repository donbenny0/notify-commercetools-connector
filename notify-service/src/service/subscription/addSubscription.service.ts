import GlobalError from "../../errors/global.error";
import { CreateCustomObjectInterface } from "../../interfaces/customObject.interface";
import { ChannelSubscriptions } from "../../interfaces/subscription.interface";
import { getCustomObjectRepository, updateCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";
import { createCommerceToolsSubscriptionRepository } from "../../repository/subscription/subscription.repository";

export const addSubscriptionService = async (channel: string, updateBody: ChannelSubscriptions) => {
    // Fetch the current custom object
    const currentCustomObject = await getCustomObjectRepository("notify-subscriptions", "notify-subscriptions-key");

    // Create a deep copy to avoid direct mutation
    const updatedValue = JSON.parse(JSON.stringify(currentCustomObject.value));

    // Get current channel subscriptions
    const currentChannel = updatedValue.channels[channel];

    if (!currentChannel) {
        throw new GlobalError(404, `Channel ${channel} not found`);
    }

    // Deduplicate and merge subscriptions
    const mergedSubscriptions: typeof currentChannel.subscriptions = [];

    // Process each subscription in the update body
    for (const newSubscription of updateBody.subscriptions) {
        // Find existing subscription for this resourceType
        const existingSubscriptionIndex = mergedSubscriptions.findIndex(
            (sub: { resourseType: string; }) => sub.resourseType === newSubscription.resourceType
        );

        if (existingSubscriptionIndex !== -1) {
            // If resourceType exists, merge triggers
            const existingSubscription = mergedSubscriptions[existingSubscriptionIndex];

            // Merge triggers, avoiding duplicates
            const mergedTriggers = [
                ...existingSubscription.triggers,
                ...newSubscription.triggers.filter(newTrigger =>
                    !existingSubscription.triggers.some(
                        (existingTrigger: { triggerType: string; subscribedAt: string; }) =>
                            existingTrigger.triggerType === newTrigger.triggerType &&
                            existingTrigger.subscribedAt === newTrigger.subscribedAt
                    )
                )
            ];

            // Update the subscription with merged triggers
            mergedSubscriptions[existingSubscriptionIndex] = {
                ...existingSubscription,
                triggers: mergedTriggers
            };
        } else {
            // If resourceType doesn't exist, add new subscription
            mergedSubscriptions.push(newSubscription);
        }

        // Create CommerceTools subscription for each resource type
        const subKey = `notify-${newSubscription.resourceType}-subscription`;
        const triggers = newSubscription.triggers.map(trigger => trigger.triggerType);

        // Validate required fields before creating subscription
        if (!newSubscription.resourceType) {
            throw new GlobalError(400, `ResourceType is required for subscription`);
        }

        await createCommerceToolsSubscriptionRepository(
            subKey,
            newSubscription.resourceType,
            triggers
        );
    }

    // Replace the channel's subscriptions with the merged subscriptions
    currentChannel.subscriptions = mergedSubscriptions;

    const subscriptionObject: CreateCustomObjectInterface = {
        container: "notify-subscriptions",
        key: "notify-subscriptions-key",
        version: currentCustomObject.version,
        value: updatedValue
    }

    const subObjectUpdatedResponse = await updateCustomObjectRepository(subscriptionObject);

    return subObjectUpdatedResponse;
};