import { GoogleCloudPubSubDestination } from "@commercetools/platform-sdk";
import { createApiRoot } from "../../client/create.client"
import { getCustomObjectRepository } from "../customObjects/customObjects.repository";

const apiRoot = createApiRoot();


export const createCommerceToolsSubscriptionRepository = async (subscriptionKey: string, resourceTypeId: string, types: string[]) => {
    const gcpPropreties = await getCustomObjectRepository('notify-subscriptions', 'notify-subscriptions-key');
    const destination: GoogleCloudPubSubDestination = {
        type: 'GoogleCloudPubSub',
        topic: gcpPropreties.value.pubsubPropreties.topic,
        projectId: gcpPropreties.value.pubsubPropreties.projectId,
    };

    apiRoot.subscriptions()
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
}

export const updateCommerceToolsSubscriptionRepository = async (subscriptionKey: string, resourceTypeId: string, types: string[]) => {


    const version = await fetchCommerceToolsSubscriptionRepository(subscriptionKey).then(response => response.version);
    apiRoot.subscriptions().withKey({ key: subscriptionKey }).post({
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
}

export const fetchCommerceToolsSubscriptionRepository = async (subscriptionKey: string) => {
    const response = await apiRoot.subscriptions().withKey({ key: subscriptionKey }).get().execute();
    return response.body;
}

export const commerceToolsSubscriptionExistsRepository = async (subscriptionKey: string): Promise<boolean> => {
    const response = await fetchCommerceToolsSubscriptionRepository(subscriptionKey);
    return response.key === subscriptionKey;
}


