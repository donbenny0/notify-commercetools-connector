import { CustomObject } from '@commercetools/platform-sdk';
import { createApiRoot } from '../../../client/create.client';
import CustomError from '../../../errors/custom.error';

/**
 * Fetches custom objects by container name and channel from commercetools
 * @param container - The container name to fetch custom objects from
 * @param channel - The channel name to filter by
 * @returns A promise that resolves to the list of custom objects
 * @throws {Error} If container or channel parameters are missing
 * @throws {CustomError} If a custom error occurs
 */
export async function getCustomObjectsByContainerAndChannel(container: string, key: string): Promise<CustomObject> {
    // Validate input
    if (!container) {
        throw new Error('Container name is required');
    }

    let apiRootInstance;
    try {
        // Initialize API root with error handling
        apiRootInstance = createApiRoot();
        if (!apiRootInstance) {
            throw new Error('Failed to initialize API client');
        }

        // Verify the customObjects method exists
        if (typeof apiRootInstance.customObjects !== 'function') {
            throw new Error('Invalid API client configuration');
        }

        // Fetch custom objects by container and channel
        const response = await apiRootInstance
            .customObjects().withContainerAndKey({ container, key }).get()
            .execute()

        // Validate response
        if (!response || !response.body) {
            throw new Error('Invalid response from commercetools');
        }

        return response.body;

    } catch (error: any) {
        // Handle specific error types
        if (error instanceof CustomError) {
            throw error;
        }

        // Handle other API errors
        if (error?.message) {
            throw new Error(`Failed to fetch custom objects: ${error.message}`);
        }

        // Generic error fallback
        throw new Error('An unexpected error occurred while fetching custom objects');
    }
}
