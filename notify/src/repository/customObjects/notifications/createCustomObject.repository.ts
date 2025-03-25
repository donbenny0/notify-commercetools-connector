import { createApiRoot } from '../../../client/create.client';
import CustomError from '../../../errors/custom.error';
import { NotificationLog } from '../../../interface/notificationsCustomObject.interface';
import { logger } from '../../../utils/logger.utils';

/**
 * Creates a custom object in commercetools
 * @param container - The container name for the custom object
 * @param key - The unique key for the custom object
 * @param value - The value/data to store in the custom object
 * @returns A promise that resolves to the created custom object
 * @throws {Error} If required parameters are missing
 * @throws {CustomError} If a custom error occurs
 */
export async function createCustomObject(container: string, key: string, value: NotificationLog) {
    // Validate input
    if (!container || !key) {
        throw new Error('Container and key are required');
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

        // Create the custom object
        const response = await apiRootInstance
            .customObjects()
            .post({
                body: {
                    container: container,
                    key: key,
                    value: value
                }
            })
            .execute();

        // Validate response
        if (!response || !response.body) {
            throw new Error('Invalid response from commercetools');
        }
        logger.info("Notification log added!")
        return response.body;

    } catch (error: any) {
        // Handle specific error types
        if (error instanceof CustomError) {
            throw error;
        }

        // Handle other API errors
        if (error?.message) {
            throw new Error(`Failed to create custom object: ${error.message}`);
        }

        // Generic error fallback
        throw new Error('An unexpected error occurred while creating custom object');
    }
}
