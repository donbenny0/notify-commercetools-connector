import { GoogleCloudPubSubDestination } from "@commercetools/platform-sdk";
import { createApiRoot } from "../../client/create.client"
import { getCustomObjectRepository } from "../customObjects/customObjects.repository";
import GlobalError from "../../errors/global.error";

const apiRoot = createApiRoot();

export const createCommerceToolsSubscriptionRepository = async (subscriptionKey: string, resourceTypeId: string, types: string[]) => {
    try {
        const gcpPropreties = await getCustomObjectRepository('notify-subscriptions', 'notify-subscriptions-key');
        const destination: GoogleCloudPubSubDestination = {
            type: 'GoogleCloudPubSub',
            topic: gcpPropreties.value.pubsubPropreties.topic,
            projectId: gcpPropreties.value.pubsubPropreties.projectId,
        };

        const response = await apiRoot.subscriptions()
            .post({
                body: {
                    key: subscriptionKey,
                    destination,
                    messages: [
                        {
                            resourceTypeId: resourceTypeId,
                            types: types,
                        },
                    ],
                },
            })
            .execute();

        return response;
    } catch (error: any) {
        throw new GlobalError(error.statusCode || 500, error.message || 'Failed to create subscription');
    }
}

export const updateCommerceToolsSubscriptionRepository = async (subscriptionKey: string, resourceTypeId: string, types: string[]) => {
    try {
        const version = await fetchCommerceToolsSubscriptionRepository(subscriptionKey).then(response => response.version);
        const response = await apiRoot.subscriptions().withKey({ key: subscriptionKey }).post({
            body: {
                actions: [
                    {
                        action: 'setMessages',
                        messages: [
                            {
                                resourceTypeId: resourceTypeId,
                                types: types,
                            },
                        ]
                    },
                ],
                version: version
            }
        }).execute();
        return response;
    } catch (error: any) {
        throw new GlobalError(error.statusCode || 500, error.message || 'Failed to update subscription');
    }

}

export const deleteCommerceToolsSubscriptionRepository = async (subscriptionKey: string) => {
    try {
        const version = await fetchCommerceToolsSubscriptionRepository(subscriptionKey).then(response => response.version);

        // If found, delete the subscription
        await apiRoot.subscriptions()
            .withKey({ key: subscriptionKey })
            .delete({
                queryArgs: {
                    version: version,
                },
            })
            .execute();

        return true;
    } catch (error: any) {
        if (error.statusCode === 404) {
            return true;
        }
        // For other errors, throw a GlobalError
        throw new GlobalError(
            error.statusCode || 500,
            error.message || 'Failed to delete subscription'
        );
    }
};



export const fetchCommerceToolsSubscriptionRepository = async (subscriptionKey: string) => {
    try {
        const response = await apiRoot.subscriptions().withKey({ key: subscriptionKey }).get().execute();
        return response.body;
    } catch (error: any) {
        throw new GlobalError(error.statusCode || 500, error.message || 'Failed to update subscription');
    }

}

export const commerceToolsSubscriptionExistsRepository = async (subscriptionKey: string): Promise<boolean> => {
    try {
        await apiRoot.subscriptions().withKey({ key: subscriptionKey }).get().execute();
        return true;
    } catch (error: any) {
        if (error?.statusCode === 404) {
            return false;
        }
        throw error;
    }
};


