import { Order } from "@commercetools/platform-sdk";
import { getOrder } from "../../repository/orders/getOrder.repository";
import CustomError from "../../errors/custom.error";
import { FetchOrderError, InvalidOrderResponseError, InvalidOrderState, OrderNotFoundError } from "../../errors/order.error";

export const transformOrder = async (decodedMessage: Record<string, any>): Promise<Record<string, any>> => {
    try {
        if (decodedMessage.orderState !== "Confirmed") {
            throw new InvalidOrderState();
        }
        const order: Order | null = await getOrder(decodedMessage.orderId);
        // Validate response
        if (!order) {
            throw new InvalidOrderResponseError();
        }

        return order;
    } catch (error: any) {
        if (error instanceof CustomError) {
            throw error;
        }

        // Handle 404 errors specifically
        if (error?.statusCode === 404) {
            throw new OrderNotFoundError(decodedMessage.orderId);
        }
        // Handle other API errors
        if (error?.message) {
            throw new FetchOrderError(decodedMessage.orderId);
        }
        // Generic error fallback
        throw new FetchOrderError(decodedMessage.orderId);
    }
}

export const getRecipientFromOrder = async (decodedMessage: Record<string, any>, channel: string): Promise<string> => {
    try {
        const order: Order | null = await getOrder(decodedMessage.orderId);

        if (channel === 'whatsapp') {
            return order?.shippingAddress?.mobile || 'Unknown user';
        }

        return 'Unknown user';
    } catch (error) {
        // Silently handle any errors and return default value
        return 'Unknown user';
    }
}
