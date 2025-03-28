export interface MessageBody {
    [key: string]: string;
}

export interface ChannelConfigurationRequest {
    isEnabled?: boolean;
    messageBody?: MessageBody;
}

export interface MessagingChannel {
    configurations: ChannelConfigurationRequest;
}