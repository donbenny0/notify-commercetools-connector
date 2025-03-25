
import { GoogleCloudPubSubDestination, } from '@commercetools/platform-sdk';
import { fetchGcpEnvironmentVariables } from '../../utils/gcp.utils';
import { createSubscriptionRepository } from '../../repository/subscription/subscription.repository';
export const createSubscriptionService = async (resourceTypeValue: string, typesValue: string[], subscriptionChannel: string) => {

    const gcpVariables = await fetchGcpEnvironmentVariables();

    const destination: GoogleCloudPubSubDestination = {
        type: 'GoogleCloudPubSub',
        topic: gcpVariables.topic,
        projectId: gcpVariables.projectId,
    };

    const subscriptionKey = createSubscriptionKey(gcpVariables.topic, gcpVariables.projectId, subscriptionChannel);

    await createSubscriptionRepository(destination, resourceTypeValue, typesValue, subscriptionKey);

}


const createSubscriptionKey = (topic: string, projectId: string, subscriptionChannel: string): string => {
    return `${topic}-${projectId}-${subscriptionChannel}`;
}
