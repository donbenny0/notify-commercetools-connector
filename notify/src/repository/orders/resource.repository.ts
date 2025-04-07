import { createApiRoot } from "../../client/create.client";
import GlobalError from "../../errors/global.error";
import { logger } from "../../utils/logger.utils";

const apiRoot = createApiRoot();

// Special cases mapping (singular to plural)
const SPECIAL_CASES: Record<string, string> = {
    "inventory-entry": "inventory",
};

const getPluralResourceName = (resourceType: string): string => {
    // Handle special cases first
    if (SPECIAL_CASES[resourceType]) {
        return SPECIAL_CASES[resourceType];
    }

    // Default pluralization rules
    if (resourceType.endsWith('y')) {
        return resourceType.slice(0, -1) + 'ies';
    }
    if (resourceType.endsWith('s') || resourceType.endsWith('x') || resourceType.endsWith('ch')) {
        return resourceType + 'es'; // box -> boxes, bus -> buses
    }

    return resourceType + 's';
};

export const fetchResource = async (resourceType: string, resourceId: string) => {
    logger.info(`Fetching ${resourceType} with ID ${resourceId}`);

    try {
        const pluralName = getPluralResourceName(resourceType.toLowerCase());

        // Check if the method exists on apiRoot
        if (!(pluralName in (apiRoot as Record<string, any>) && typeof (apiRoot as Record<string, any>)[pluralName] === 'function')) {
            throw new GlobalError(400, `Unsupported resource type: ${resourceType}`);
        }

        // Call the method dynamically
        const response = await (apiRoot as Record<string, any>)[pluralName]()
            .withId(resourceId)
            .get()
            .execute();

        return response.body;
    } catch (error: any) {
        throw new GlobalError(
            error.statusCode || 500,
            error.message || `Failed to fetch ${resourceType} with ID ${resourceId}`
        );
    }
};