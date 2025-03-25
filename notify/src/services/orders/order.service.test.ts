import { Order } from '@commercetools/platform-sdk';
import { getOrder } from '../../repository/orders/getOrder.repository';
import { OrderNotFoundError, FetchOrderError, InvalidOrderState, InvalidOrderResponseError } from '../../errors/order.error';
import { transformOrder, getRecipientFromOrder } from './orders.service';

// Mock the `getOrder` function
jest.mock('../../repository/orders/getOrder.repository');

// Mock environment variable reading
jest.mock('../../utils/config.utils.ts', () => ({
    readConfiguration: jest.fn().mockReturnValue({
        CTP_CLIENT_ID: "XXXXXXXXXXXXXXXXXXXXXXXX",
        CTP_CLIENT_SECRET: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        CTP_PROJECT_KEY: "test-scope",
        CTP_SCOPE: "manage_project:test-scope",
        CTP_REGION: "europe-west1.gcp"
    })
}));

// Mock Twilio client
const mockTwilioClient = {
    messages: {
        create: jest.fn().mockResolvedValue({})
    }
};

jest.mock('../../utils/twilio.utils.ts', () => ({
    readConfiguration: jest.fn().mockReturnValue({
        TWILIO_ACCOUNT_SID: 'XXXXXXXXXXXXXXXXXXXXXXXX',
        TWILIO_AUTH_TOKEN: 'test-auth-token',
        TWILIO_FROM_NUMBER: 'test-number',
        CUSTOM_MESSAGE_TEMPLATE: "Hello {{shippingAddress.firstName}},\n\n your order #{{id}} has been confirmed! Total rates: {{taxedPrice.taxPortions[*].rate}}."
    }),
    __esModule: true,
    default: jest.fn().mockImplementation((_accountSid: string, _authToken: string) => mockTwilioClient)
}));

describe('orders.service.ts', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('transformOrder', () => {
        it('should fetch and return an order with "Confirmed" state', async () => {
            const orderMock: Order = {
                id: '123',
                state: 'Confirmed',
                shippingAddress: { firstName: "John", mobile: '+1234567890' },
                // Add other properties as needed...
            } as any;
            (getOrder as jest.Mock).mockResolvedValue(orderMock);

            const decodedMessage = { orderId: '123', orderState: 'Confirmed' };
            const order = await transformOrder(decodedMessage);

            expect(order).toEqual(orderMock);
            expect(getOrder).toHaveBeenCalledWith(decodedMessage.orderId);
        });

        it('should throw InvalidOrderState if order state is not "Confirmed"', async () => {
            const decodedMessage = { orderId: '123', orderState: 'Processing' };

            await expect(transformOrder(decodedMessage)).rejects.toThrow(InvalidOrderState);
        });

        it('should throw OrderNotFoundError if the order does not exist', async () => {
            const decodedMessage = { orderId: 'nonExistentOrder', orderState: 'Confirmed' };
            (getOrder as jest.Mock).mockRejectedValue({ statusCode: 404 });

            await expect(transformOrder(decodedMessage)).rejects.toThrow(OrderNotFoundError);
        });

        it('should throw InvalidOrderResponseError if the order response is invalid', async () => {
            const decodedMessage = { orderId: '123', orderState: 'Confirmed' };
            (getOrder as jest.Mock).mockResolvedValue(null);

            await expect(transformOrder(decodedMessage)).rejects.toThrow(InvalidOrderResponseError);
        });

        it('should throw FetchOrderError for any other error during order fetch', async () => {
            const decodedMessage = { orderId: '123', orderState: 'Confirmed' };
            (getOrder as jest.Mock).mockRejectedValue(new Error('Some API error'));

            await expect(transformOrder(decodedMessage)).rejects.toThrow(FetchOrderError);
        });
    });

    describe('getRecipientFromOrder', () => {
        it('should return the mobile number from the order\'s shipping address for WhatsApp', async () => {
            const orderMock: Order = {
                id: '123',
                shippingAddress: { firstName: "John", mobile: '+1234567890' },
                // Add other properties as needed...
            } as any;
            (getOrder as jest.Mock).mockResolvedValue(orderMock);

            const decodedMessage = { orderId: '123' };
            const recipient = await getRecipientFromOrder(decodedMessage, 'whatsapp');

            expect(recipient).toBe('+1234567890');
            expect(getOrder).toHaveBeenCalledWith(decodedMessage.orderId);
        });

        it('should return "Unknown user" if no mobile number exists in the order for WhatsApp', async () => {
            const orderMock: Order = {
                id: '123',
                shippingAddress: { firstName: "John" },  // No mobile number here
                // Add other properties as needed...
            } as any;
            (getOrder as jest.Mock).mockResolvedValue(orderMock);

            const decodedMessage = { orderId: '123' };
            const recipient = await getRecipientFromOrder(decodedMessage, 'whatsapp');

            expect(recipient).toBe('Unknown user');
        });

        it('should return "Unknown user" for non-WhatsApp channels', async () => {
            const orderMock: Order = {
                id: '123',
                shippingAddress: { firstName: "John", mobile: '+1234567890' },
                // Add other properties as needed...
            } as any;
            (getOrder as jest.Mock).mockResolvedValue(orderMock);

            const decodedMessage = { orderId: '123' };
            const recipient = await getRecipientFromOrder(decodedMessage, 'email');

            expect(recipient).toBe('Unknown user');
        });

        it('should return "Unknown user" if an error occurs during recipient fetch', async () => {
            const decodedMessage = { orderId: '123' };
            (getOrder as jest.Mock).mockRejectedValue(new Error('API error'));

            const recipient = await getRecipientFromOrder(decodedMessage, 'whatsapp');

            expect(recipient).toBe('Unknown user');
        });
    });
});
