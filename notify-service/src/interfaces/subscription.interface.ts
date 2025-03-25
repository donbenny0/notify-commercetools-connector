export interface CreateSubscriptionInterface {
    resourceName: string;
    triggerTypes: string[];
    channel: string;
}


export interface RemoveSubscriptionInterface {
    subscriptionKey: string;
}