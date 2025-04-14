import { Request, Response } from 'express';
import { post } from '../../src/controllers/event.controller';
import { decodePubSubData } from '../../src/utils/helpers.utils';
import { addNotificationLog } from '../../src/services/customObject/notifications/addNotificationLogs.service';
import { messageHandler } from '../../src/services/messaging/messageHandler.service';
import { resourceHandler } from '../../src/services/messaging/resourceHandler.service';
import CustomError from '../../src/errors/custom.error';

// Mock modules
jest.mock('../../src/utils/helpers.utils');
jest.mock('../../src/services/customObject/notifications/addNotificationLogs.service');
jest.mock('../../src/services/messaging/messageHandler.service');
jest.mock('../../src/services/messaging/resourceHandler.service');
// Mock environment variable reading
jest.mock('../../src/utils/config.utils.ts', () => ({
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

jest.mock('../../src/utils/twilio.utils.ts', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    TWILIO_ACCOUNT_SID: 'XXXXXXXXXXXXXXXXXXXXXXXX',
    TWILIO_AUTH_TOKEN: 'test-auth-token',
    TWILIO_FROM_NUMBER: 'test-number',
    CUSTOM_MESSAGE_TEMPLATE: "Hello {{shippingAddress.firstName}},\n\n your order #{{id}} has been confirmed! Total rates: {{taxedPrice.taxPortions[*].rate}}."
  }),
  __esModule: true,
  default: jest.fn().mockImplementation((_accountSid: string, _authToken: string) => mockTwilioClient)
}));

describe('Event Controller Integration Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockStatus = jest.fn().mockReturnThis();
  const mockSend = jest.fn().mockReturnThis();

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {
        message: {
          data: Buffer.from(JSON.stringify({
            orderId: 'mockOrderId',
            orderState: 'Confirmed'
          })).toString('base64')
        }
      }
    };

    mockResponse = {
      status: mockStatus,
      send: mockSend
    };
  });

  describe('Successful scenarios', () => {
    test('should return 200 and send message successfully', async () => {
      // Arrange
      const mockDecodedData = {
        orderId: 'mockOrderId',
        orderState: 'Confirmed'
      };
      const mockResourceData = { id: 'mockOrderId', shippingAddress: { mobile: '1234567890' } };

      (decodePubSubData as jest.Mock).mockReturnValue(mockDecodedData);
      (resourceHandler as jest.Mock).mockResolvedValue(mockResourceData);
      (messageHandler as jest.Mock).mockResolvedValue(undefined);
      (addNotificationLog as jest.Mock).mockResolvedValue(undefined);

      // Act
      await post(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith('Message sent successfully');
      expect(addNotificationLog).toHaveBeenCalledWith('whatsapp', true, mockDecodedData);
    });
  });

  describe('Error scenarios', () => {
    test('should handle errors during message sending and return CustomError', async () => {
      // Arrange
      const mockDecodedData = {
        orderId: 'mockOrderId',
        orderState: 'Open',
      };
      const mockResourceData = { id: 'mockOrderId', shippingAddress: { mobile: '1234567890' } };

      (decodePubSubData as jest.Mock).mockReturnValue(mockDecodedData);
      (resourceHandler as jest.Mock).mockResolvedValue(mockResourceData);

      // Make sure the mock explicitly throws an error
      const customError = new CustomError(500, 'Message handler failed');
      (messageHandler as jest.Mock).mockRejectedValue(customError);

      // Mock response methods
      const statusMock = jest.fn().mockReturnThis();
      const sendMock = jest.fn();
      (mockResponse.status as jest.Mock).mockImplementation(statusMock);
      (mockResponse.send as jest.Mock).mockImplementation(sendMock);

      // Act
      await post(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Message handler failed');
      expect(addNotificationLog).toHaveBeenCalledWith('whatsapp', false, mockDecodedData, customError);
    });
  });

});
