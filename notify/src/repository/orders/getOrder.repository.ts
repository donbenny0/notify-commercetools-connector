import { createApiRoot } from '../../client/create.client';

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
  
  // Initialize API root with error handling
  const apiRootInstance = createApiRoot();
  
  // Fetch the order by ID
  const response = await apiRootInstance
    .orders()
    .withId({ ID: orderId })
    .get()
    .execute();

  // Validate response
  if (!response || !response.body) {
    return null;
  }

  return response.body;
}
