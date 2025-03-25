import sendMessage from "../../utils/twilio.utils";

export const messageHandler = async (resource: Record<string, any>) => {

    if (!resource) return;

    await sendMessage(resource, resource?.shippingAddress?.mobile);

}
