import GlobalError from "../../errors/global.error";
import { ChannelSubscriptions } from "../../interfaces/subscription.interface";
import { getCustomObjectRepository } from "../../repository/customObjects/customObjects.repository";

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
    }

    // Replace the channel's subscriptions with the merged subscriptions
    currentChannel.subscriptions = mergedSubscriptions;

    return updatedValue;
};