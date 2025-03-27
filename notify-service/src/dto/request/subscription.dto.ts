import { ChannelSubscriptions } from "../../interfaces/subscription.interface";

export class AddSubscriptionDto {
    channel!: string;
    updateBody!: ChannelSubscriptions;
}

export class RemoveSubscriptionDto {
    channel!: string;
    subscription!: {
        resourceType: string;
        triggerType: string;
    }
}