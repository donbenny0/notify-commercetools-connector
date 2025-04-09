import { createApiRoot } from "../../client/create.client";
import GlobalError from "../../errors/global.error";
import { logger } from "../../utils/logger.utils";

const apiRoot = createApiRoot();


export const fetchResource = async (resourceType: string, resourceId: string) => {
    logger.info(`Fetching ${resourceType} with ID ${resourceId}`);

    switch (resourceType) {
        case 'order':
            return (await apiRoot.orders().withId({ ID: resourceId }).get().execute()).body;
        case 'customer':
            return (await apiRoot.customers().withId({ ID: resourceId }).get().execute()).body;
        case 'product':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'inventory-entry':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'payment':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'product-selection':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'quote':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'quote-request':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'review':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'staged-quote':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'product-tailoring':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'standalone-price':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        case 'store':
            return (await apiRoot.products().withId({ ID: resourceId }).get().execute()).body;
        default:
            throw new GlobalError(400, `Invalid resource type: ${resourceType}`)
    }

}