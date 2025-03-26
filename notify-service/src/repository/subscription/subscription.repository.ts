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


