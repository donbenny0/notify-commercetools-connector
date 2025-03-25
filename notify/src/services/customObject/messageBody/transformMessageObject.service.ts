import { CustomObject } from "@commercetools/platform-sdk";
import { MessageBodyCustomObject } from "../../../interface/messageBodyCustomObject.interface";
import { getCustomObjectsByContainerAndChannel } from "../../../repository/customObjects/messagesBody/messageBody.repository";

export const transformMessageBodyCustomObject = async (container: string, key: string): Promise<MessageBodyCustomObject | null> => {
    const messageBodyResponse: CustomObject = await getCustomObjectsByContainerAndChannel(container, key);
    if (!messageBodyResponse) {
        return null;
    }
    return {
        channel: messageBodyResponse.value.channel,
        message: messageBodyResponse.value.message
    };
}
