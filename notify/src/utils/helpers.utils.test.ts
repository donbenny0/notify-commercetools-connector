import { generateMessage, generateRandomKey } from './helpers.utils';
import { Order } from '@commercetools/platform-sdk';

// Mock transformMessageBodyCustomObject to avoid external dependency
jest.mock('../services/customObject/messageBody/transformMessageObject.service', () => ({
    transformMessageBodyCustomObject: jest.fn().mockResolvedValue({
        message: "Order {{shippingAddress.mobile}} has been confirmed."
    }),
}));

// Mock environment variable reading
jest.mock('../utils/config.utils.ts', () => ({
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

jest.mock('../utils/twilio.utils.ts', () => ({
    readConfiguration: jest.fn().mockReturnValue({
        TWILIO_ACCOUNT_SID: 'XXXXXXXXXXXXXXXXXXXXXXXX',
        TWILIO_AUTH_TOKEN: 'test-auth-token',
        TWILIO_FROM_NUMBER: 'test-number',
        CUSTOM_MESSAGE_TEMPLATE: "Hello {{shippingAddress.firstName}},\n\n your order #{{id}} has been confirmed! Total rates: {{taxedPrice.taxPortions[*].rate}}."
    }),
    __esModule: true,
    default: jest.fn().mockImplementation((_accountSid: string, _authToken: string) => mockTwilioClient)
}));


describe('helpers.utils.ts', () => {

    describe('generateMessage', () => {
        const orderMock: Order = {
            id: '123',
            shippingAddress: { mobile: '+1234567890' },
        } as any;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate message from order data using custom object template', async () => {
            const result = await generateMessage(orderMock);
            expect(result).toBe("Order +1234567890 has been confirmed.");
        });

        it('should use process.env.CUSTOM_MESSAGE_TEMPLATE if custom object template is missing', async () => {
            process.env.CUSTOM_MESSAGE_TEMPLATE = "Order {{shippingAddress.mobile}} is processed.";
            (require('../services/customObject/messageBody/transformMessageObject.service').transformMessageBodyCustomObject as jest.Mock).mockResolvedValue(null);

            const result = await generateMessage(orderMock);
            expect(result).toBe("Order +1234567890 is processed.");
        });

        it('should use default message if both custom object template and environment template are missing', async () => {
            delete process.env.CUSTOM_MESSAGE_TEMPLATE;
            (require('../services/customObject/messageBody/transformMessageObject.service').transformMessageBodyCustomObject as jest.Mock).mockResolvedValue(null);

            const result = await generateMessage(orderMock);
            expect(result).toBe("Hello,\n\nYour order has been confirmed!.\nThank you");
        });

    });

    describe('generateRandomKey', () => {
        it('should generate a 32-character random key', () => {
            const key = generateRandomKey();
            expect(key).toHaveLength(32);
            expect(/^[A-Za-z0-9]+$/.test(key)).toBe(true);
        });

        it('should generate unique keys on multiple calls', () => {
            const key1 = generateRandomKey();
            const key2 = generateRandomKey();
            expect(key1).not.toEqual(key2);
        });
    });
});
