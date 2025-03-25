export interface PubSubEncodedMessage {
    data?: string;
}

export interface PubSubDecodedData {
    id: string;
    orderId: string;
    orderState: string;
}
