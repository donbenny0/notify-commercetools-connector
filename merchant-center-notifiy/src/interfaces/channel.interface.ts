export interface MessageBody {
    [key: string]: {
        message: string;
        sendToPath: string;
    };
}

export interface ChannelConfigurationRequest {
    isEnabled?: boolean;
    messageBody?: MessageBody;
}

export interface MessagingChannel {
    configurations: ChannelConfigurationRequest;
}