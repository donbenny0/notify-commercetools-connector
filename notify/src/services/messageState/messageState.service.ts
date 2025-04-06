export const handleMessageState = async (){
    // When message arrives
    // 1. Check if the messageState container available
    // If container available 
        // 1. Check if already the message exists in the messageState
            // If Exists
            // Fetch the channel reference 
            // Group all the enabled channels
            // Go throug each enabled channels and look into the  channelsProcessed.[channel_name].isSent
            // If isSent is 
            // 1. true => then skip sending through current channel
            // 2. false => try sending through current channel when starting to send set the channel isSent to 'processing'  ----May be we can avoid processing by setting false by internal timeout to 10s
            // ---- if sending is success then make it true and add log to the log container. 
                    // => Adding logs should be done after all the channel try to send its data. before that store each send/fail logs of each channel to a variable
                    //  and all channels finished sending process irrespective of the state for that message add log. => MULTIY THREADING?
            // ---- if fails make it false, and if fails to send in default time like in 10s then take it as false.
            // 3. processing => then skip sending through that channel bcz its in processing state.
       
        // 2. If Messsage is not available in the MessageState then
            // => Add a messageState of that message into the MessageState container
                // 1. Fetch channel container and group all the channels
                // 2. Add channel reference to the body
                // 3. Create channelsProcessed entries for each channels 
                // 4. Call the If exists logic
                
    // If container not available    
        // 1. Create container with new message and call =>  2. If Messsage is not available in the MessageState then
    
}


interface ChannelConfig {
    isEnabled: boolean;
    messageBody: Record<string, {
        message: string;
        sendToPath: string;
    }>;
}

interface ChannelsContainer {
    container: string;
    key: string;
    value: Record<string, {
        configurations: ChannelConfig;
    }>;
}

interface MessageStateValue {
    channelReference: {
        id: string;
        typeId: string;
    };
    channelsProcessed: Record<string, {
        isSent: ("processing" | boolean)[];
    }>;
    message: any; // Your message type
}

interface MessageStateContainer {
    container: string;
    version: number;
    key: string;
    value: MessageStateValue;
}

interface ProcessLog {
    message: string;
    statusCode: number;
    createdAt: string;
}

interface ChannelLog {
    isSent: boolean;
    lastProcessedDate: string;
    recipient: string;
    processLogs: ProcessLog[];
}

interface MessageLog {
    messageId: string;
    channels: Record<string, ChannelLog>;
    message: string;
}

interface MessageLogsContainer {
    container: string;
    key: string;
    value: Record<string, Record<string, MessageLog[]>>;
}

// Simulated storage clients
const messageStateClient = {
    get: async (key: string): Promise<MessageStateContainer | null> => {
        // Implementation would fetch from your storage
        return null;
    },
    create: async (container: MessageStateContainer): Promise<void> => {
        // Implementation would create in your storage
    },
    update: async (container: MessageStateContainer): Promise<void> => {
        // Implementation would update in your storage
    }
};

const channelsClient = {
    get: async (): Promise<ChannelsContainer> => {
        // Implementation would fetch from your storage
        return {
            container: "notify-channels",
            key: "notify-channels-key",
            value: {
                whatsapp: { configurations: { isEnabled: true, messageBody: {} } },
                email: { configurations: { isEnabled: true, messageBody: {} } },
                sms: { configurations: { isEnabled: true, messageBody: {} } }
            }
        };
    }
};

const logsClient = {
    append: async (log: MessageLog): Promise<void> => {
        // Implementation would append to your logs storage
    }
};

// Simulated channel send functions
const channelSenders = {
    whatsapp: async (message: any, recipient: string): Promise<{ success: boolean; statusCode: number; message: string }> => {
        // Implementation would send via WhatsApp
        return { success: true, statusCode: 200, message: "Message sent successfully" };
    },
    email: async (message: any, recipient: string): Promise<{ success: boolean; statusCode: number; message: string }> => {
        // Implementation would send via email
        return { success: true, statusCode: 200, message: "Message sent successfully" };
    },
    sms: async (message: any, recipient: string): Promise<{ success: boolean; statusCode: number; message: string }> => {
        // Implementation would send via SMS
        return { success: true, statusCode: 200, message: "Message sent successfully" };
    }
};

export const handleMessageState = async (message: any) => {
    try {
        const messageId = message.id;
        if (!messageId) {
            throw new Error("Message ID is required");
        }

        // 1. Check if the messageState container is available
        let messageState = await messageStateClient.get(messageId);

        if (messageState) {
            // Message exists in the messageState
            await processExistingMessage(messageState);
        } else {
            // Message is not available in the MessageState
            await createNewMessageState(message);
        }
    } catch (error) {
        console.error("Error handling message state:", error);
        throw error;
    }
};

async function processExistingMessage(messageState: MessageStateContainer) {
    const channelsContainer = await channelsClient.get();
    const enabledChannels = getEnabledChannels(channelsContainer.value, messageState.value.message.type);

    const channelLogs: Record<string, ChannelLog> = {};
    const processingPromises: Promise<void>[] = [];

    for (const [channelName, channelConfig] of Object.entries(enabledChannels)) {
        const channelState = messageState.value.channelsProcessed[channelName];

        if (!channelState) {
            console.warn(`Channel ${channelName} is enabled but not in message state`);
            continue;
        }

        // Find the latest state (last element in the array)
        const latestState = channelState.isSent[channelState.isSent.length - 1];

        if (latestState === true) {
            // Skip sending through current channel
            continue;
        } else if (latestState === "processing") {
            // Check if processing is stuck (older than 10 seconds)
            if (channelState.isSent.length > 1) {
                // If there are previous attempts, we might want to retry
                // This is a simple approach - in production you might want more sophisticated handling
                console.log(`Channel ${channelName} is processing - will attempt to send`);
            } else {
                console.log(`Channel ${channelName} is processing - skipping`);
                continue;
            }
        }

        // Prepare for sending
        channelState.isSent.push("processing");
        await messageStateClient.update(messageState);

        processingPromises.push(
            processChannel(
                channelName,
                messageState,
                channelConfig,
                channelLogs
            ).catch(err => {
                console.error(`Error processing channel ${channelName}:`, err);
            })
        );
    }

    // Wait for all channels to complete processing
    await Promise.all(processingPromises);

    // Add logs after all channels have been processed
    if (Object.keys(channelLogs).length > 0) {
        await logsClient.append({
            messageId: messageState.key,
            channels: channelLogs,
            message: JSON.stringify(messageState.value.message)
        });
    }
}

async function processChannel(
    channelName: string,
    messageState: MessageStateContainer,
    channelConfig: ChannelConfig,
    channelLogs: Record<string, ChannelLog>
) {
    const channelLog: ChannelLog = {
        isSent: false,
        lastProcessedDate: new Date().toISOString(),
        recipient: "", // Will be set based on sendToPath
        processLogs: []
    };

    try {
        // Get recipient from message using sendToPath
        const sendToPath = channelConfig.messageBody[messageState.value.message.type]?.sendToPath;
        const recipient = getValueFromPath(messageState.value.message, sendToPath);
        channelLog.recipient = recipient;

        // Send message
        const sendResult = await channelSenders[channelName](
            messageState.value.message,
            recipient
        );

        channelLog.processLogs.push({
            message: sendResult.message,
            statusCode: sendResult.statusCode,
            createdAt: new Date().toISOString()
        });

        // Update message state based on send result
        const channelState = messageState.value.channelsProcessed[channelName];
        if (sendResult.success) {
            channelState.isSent[channelState.isSent.length - 1] = true;
            channelLog.isSent = true;
        } else {
            channelState.isSent[channelState.isSent.length - 1] = false;
            channelLog.isSent = false;
        }

        await messageStateClient.update(messageState);
    } catch (error) {
        channelLog.processLogs.push({
            message: error.message,
            statusCode: 500,
            createdAt: new Date().toISOString()
        });

        // Mark as failed in message state
        const channelState = messageState.value.channelsProcessed[channelName];
        channelState.isSent[channelState.isSent.length - 1] = false;
        await messageStateClient.update(messageState);
    } finally {
        channelLogs[channelName] = channelLog;
    }
}

async function createNewMessageState(message: any) {
    const channelsContainer = await channelsClient.get();
    const enabledChannels = getEnabledChannels(channelsContainer.value, message.type);

    // Create new message state
    const messageState: MessageStateContainer = {
        container: "notify-messageState",
        version: 1,
        key: message.id,
        value: {
            channelReference: {
                id: "some-channel-ref-id", // This should be fetched from your channel reference storage
                typeId: "key-value-document"
            },
            channelsProcessed: {},
            message
        }
    };

    // Initialize channelsProcessed for each enabled channel
    for (const channelName of Object.keys(enabledChannels)) {
        messageState.value.channelsProcessed[channelName] = {
            isSent: [false] // Initial state is false (not sent)
        };
    }

    // Save the new message state
    await messageStateClient.create(messageState);

    // Now process the message
    await processExistingMessage(messageState);
}

function getEnabledChannels(channels: ChannelsContainer['value'], messageType: string): Record<string, ChannelConfig> {
    const enabledChannels: Record<string, ChannelConfig> = {};

    for (const [channelName, channelData] of Object.entries(channels)) {
        if (channelData.configurations.isEnabled &&
            channelData.configurations.messageBody[messageType]) {
            enabledChannels[channelName] = channelData.configurations;
        }
    }

    return enabledChannels;
}

function getValueFromPath(obj: any, path: string): string {
    if (!path) return "";

    return path.split('.').reduce((o, p) => o?.[p], obj) || "";
}