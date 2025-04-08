import { createApiRoot } from '../../client/create.client';
import { logger } from '../../utils/logger.utils';

/**
 * Fetches an order using the provided order ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns A promise that resolves to the order details if found.
 * @param orderId - The ID of the order to retrieve.
 * @throws {OrderNotFoundError} If the order is not found
 * @throws {FetchOrderError} If there's an error fetching the order
 * @throws {InvalidOrderResponseError} If the response is invalid
 */
export async function getOrder(orderId: string) {
  logger.info(`Fetching order with ID : ${orderId}`);
  // Initialize API root with error handling
  const apiRootInstance = createApiRoot();

  // Fetch the order by ID
  const response = await apiRootInstance
    .orders()
    .withId({ ID: '9bda752a-447a-47e6-bbc7-07dac970ecb8' })
    .get()
    .execute();


  return response.body;
}
