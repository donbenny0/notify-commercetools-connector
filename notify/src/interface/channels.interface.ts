export interface channelBodyinterface {
    [key: string]: {
        configurations: {
            isEnabled: false;
            messageBody: {
                [key: string]: {
                    message: string;
                    sendToPath: string;
                }
            },
        }
    }
}

interface ModifiedBy {
    clientId?: string;
    isPlatformClient?: boolean;
    user?: {
        typeId: string;
        id: string;
    };
}

export interface ChannelInterfaceResponse {
    id: string;
    version: number;
    versionModifiedAt?: string;
    createdAt: string;
    lastModifiedAt: string;
    lastModifiedBy?: ModifiedBy;
    createdBy?: ModifiedBy;
    container: string;
    key: string;
    value: channelBodyinterface
}

export interface ChannelHandler {
    sendMessage: (messageData: Promise<string>, recipient: string) => Promise<void>;
}
