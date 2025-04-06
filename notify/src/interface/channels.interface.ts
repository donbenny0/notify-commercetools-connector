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