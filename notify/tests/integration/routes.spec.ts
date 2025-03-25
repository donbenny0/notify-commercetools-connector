import { expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import * as enventController from '../../src/controllers/event.controller';
import { readConfiguration } from '../../src/utils/config.utils';

jest.mock('../../src/utils/config.utils');
// Mock environment variable reading
jest.mock('../../src/utils/config.utils.ts', () => ({
  readConfiguration: jest.fn().mockReturnValue({
      CTP_CLIENT_ID: "client-id",
      CTP_CLIENT_SECRET: "client-secret",
      CTP_PROJECT_KEY: "project-key",
      CTP_SCOPE: "scope",
      CTP_REGION: "region"
  })
}));
jest.mock('../../src/utils/twilio.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
      TWILIO_ACCOUNT_SID: 'sid',
      TWILIO_AUTH_TOKEN: 'auth-token',
      TWILIO_FROM_NUMBER: 'from-number',
      CUSTOM_MESSAGE_TEMPLATE:"Hello {{shippingAddress.firstName}},\n\n your order #{{id}} has been confirmed! Total rates: {{taxedPrice.taxPortions[*].rate}}."
  })
}));
describe('Testing router', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
  });
  test('Post to non existing route', async () => {
    const response = await request(app).post('/none');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Path not found.',
    });
  });

});
describe('unexpected error', () => {
  let postMock: jest.SpyInstance;

  beforeEach(() => {
    // Mock the post method to throw an error
    postMock = jest.spyOn(enventController, 'post').mockImplementation(() => {
      throw new Error('Test error');
    });
    (readConfiguration as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Restore the original implementation
    postMock.mockRestore();
  });
  test('should handle errors thrown by post method', async () => {
    // Call the route handler
    const response = await request(app).post('/event');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});
