import { ChannelSubscriptions } from "../../interfaces/subscription.interface";

export class AddSubscriptionDto {
    channel!: string;
    updateBody!: ChannelSubscriptions;
}