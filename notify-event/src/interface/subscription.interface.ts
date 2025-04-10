interface Reference {
    id: string;
    typeId: string;
}

interface ReferenceObject {
    [key: string]: Reference;
}

interface Subscription {
    triggerType: string;
    subscribedAt: string;
}

interface ChannelSubscriptions {
    subscriptions: Subscription[];
}

export interface CreateSubscriptionInterface {
    references?: ReferenceObject;
    channels: {
        [key: string]: ChannelSubscriptions;
    };
}
